
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Day, AppLanguage, Dish, SavedWeek } from '../types';
import { generateFullWeekMenu } from '../services/geminiService';
import { storage } from '../services/storage';
import { DAYS_OF_WEEK_KEYS, MEAL_NAMES_KEYS, DEFAULT_SECTION_SUGGESTIONS } from '../constants';

const STANDARD_MEAL_KEYS = ['breakfast', 'lunch', 'snack', 'dinner'];

const initializeWeekMenu = (): Day[] => {
    return DAYS_OF_WEEK_KEYS.map(dayKey => ({
      name: dayKey,
      meals: MEAL_NAMES_KEYS.map(mealKey => ({
        name: mealKey,
        subMeals: [{ id: Date.now().toString() + Math.random(), name: 'Main', dish: null }], 
      })),
    }));
};

export const useWeekMenu = (t: (key: string) => string) => {
    // -- State --
    const [weekMenu, setWeekMenuState] = useState<Day[]>(initializeWeekMenu());
    const [weekNotes, setWeekNotesState] = useState('');
    const [appliedRuleNames, setAppliedRuleNames] = useState<string[]>([]);
    const [activeWeekId, setActiveWeekId] = useState<string | null>(storage.activeWeekId.get());
    const [isDirty, setIsDirty] = useState(false);
    
    // Saved Weeks history
    const [savedWeeks, setSavedWeeks] = useState<SavedWeek[]>(() => storage.weeks.get(initializeWeekMenu()));

    // Helpers to track user inputs for autocomplete
    const [subMealNameHistory, setSubMealNameHistory] = useState<string[]>([]);

    // -- Persistence --
    useEffect(() => { storage.activeWeekId.set(activeWeekId); }, [activeWeekId]);
    useEffect(() => { storage.weeks.set(savedWeeks); }, [savedWeeks]);

    // -- Computeds --
    const activeWeekName = useMemo(() => {
        const week = savedWeeks.find(w => w.id === activeWeekId);
        return week ? week.name : t('new_menu');
    }, [savedWeeks, activeWeekId, t]);

    const currentSectionSuggestions = useMemo(() => {
        const defaults = DEFAULT_SECTION_SUGGESTIONS.map(key => t(key));
        return Array.from(new Set([...defaults, ...subMealNameHistory]));
    }, [t, subMealNameHistory]);

    const mealSuggestions = useMemo(() => {
        return STANDARD_MEAL_KEYS.map(key => t(key));
    }, [t]);

    const displayWeekMenu = useMemo(() => weekMenu.map((day, idx) => ({
        ...day,
        originalIndex: idx, 
        name: t(day.name),
        meals: day.meals.map(meal => ({ ...meal, name: t(meal.name) }))
    })), [weekMenu, t]);

    // -- Wrappers that set Dirty State --
    
    const setWeekMenu = useCallback((value: Day[] | ((prev: Day[]) => Day[])) => {
        setWeekMenuState(value);
        setIsDirty(true);
    }, []);

    const setWeekNotes = useCallback((notes: string) => {
        setWeekNotesState(notes);
        setIsDirty(true);
    }, []);

    // -- Actions --

    const handleGenerateWeek = async (
        rulesPrompt: string, 
        ruleNames: string[], 
        recipeBook: Dish[], 
        language: AppLanguage, 
        dishCategories: string[]
    ) => {
        // Translate structure for AI context
        const translatedWeekMenu = weekMenu.map(day => ({
            ...day,
            name: t(day.name),
            meals: day.meals.map(meal => ({ ...meal, name: t(meal.name) }))
        }));

        const newMenuFromAI = await generateFullWeekMenu(rulesPrompt, translatedWeekMenu, recipeBook, language, dishCategories);
        
        // Merge strategy: Only fill empty slots, do not overwrite existing dishes
        const mergedMenu = weekMenu.map((day, dIdx) => ({
            ...day,
            meals: day.meals.map((meal, mIdx) => ({
                ...meal,
                subMeals: meal.subMeals.map((subMeal, sIdx) => {
                    if (subMeal.dish) return subMeal; // Keep existing
                    
                    const aiDay = newMenuFromAI[dIdx];
                    const aiMeal = aiDay?.meals?.[mIdx];
                    const aiSubMeal = aiMeal?.subMeals?.[sIdx];
                    
                    if (aiSubMeal && aiSubMeal.dish) {
                         return { 
                             ...subMeal, 
                             dish: { ...aiSubMeal.dish, id: Date.now().toString() + Math.random() }
                         };
                    }
                    return subMeal;
                })
            }))
        }));

        setWeekMenuState(mergedMenu);
        setAppliedRuleNames(ruleNames);
        setIsDirty(true);
    };

    const handleAssignDish = (dayIndex: number, mealIndex: number, subMealId: string, dish: Dish) => {
        setWeekMenuState(prevMenu => {
            const newMenu = JSON.parse(JSON.stringify(prevMenu));
            const subMeal = newMenu[dayIndex].meals[mealIndex].subMeals.find((sm: any) => sm.id === subMealId);
            if (subMeal) subMeal.dish = dish;
            return newMenu;
        });
        setIsDirty(true);
    };

    const handleAddSubMeal = (dayIndex: number, mealIndex: number, name: string) => {
        setWeekMenuState(prevMenu => {
            const newMenu = JSON.parse(JSON.stringify(prevMenu));
            newMenu[dayIndex].meals[mealIndex].subMeals.push({
                id: Date.now().toString() + Math.random(),
                name,
                dish: null
            });
            return newMenu;
        });
        setIsDirty(true);
        
        // Add to history if unique and not a default key
        const isTranslatedDefault = DEFAULT_SECTION_SUGGESTIONS.some(key => t(key) === name);
        if (!isTranslatedDefault && !subMealNameHistory.includes(name)) {
            setSubMealNameHistory(prev => [...prev, name]);
        }
    };

    const handleRenameSubMeal = (dayIndex: number, mealIndex: number, subMealId: string, newName: string) => {
        setWeekMenuState(prevMenu => {
            const newMenu = JSON.parse(JSON.stringify(prevMenu));
            const subMeal = newMenu[dayIndex].meals[mealIndex].subMeals.find((sm: any) => sm.id === subMealId);
            if (subMeal) subMeal.name = newName;
            return newMenu;
        });
        setIsDirty(true);
        
        const isTranslatedDefault = DEFAULT_SECTION_SUGGESTIONS.some(key => t(key) === newName);
        if (newName.trim() && !isTranslatedDefault && !subMealNameHistory.includes(newName)) {
            setSubMealNameHistory(prev => [...prev, newName]);
        }
    };

    const handleAddMeal = (dayIndex: number, name: string) => {
        // Check if the user typed a standard key (like 'Breakfast') in their language
        const standardKey = STANDARD_MEAL_KEYS.find(k => t(k).toLowerCase() === name.toLowerCase());
        const finalName = standardKey || name;
        
        setWeekMenuState(prevMenu => {
            const newMenu = JSON.parse(JSON.stringify(prevMenu));
            newMenu[dayIndex].meals.push({
                name: finalName,
                subMeals: [{ id: Date.now().toString() + Math.random(), name: 'Main', dish: null }]
            });
            return newMenu;
        });
        setIsDirty(true);
    };

    // Generic removers/movers
    const handleRemoveSubMeal = (dayIndex: number, mealIndex: number, subMealId: string) => {
        setWeekMenuState(prev => {
            const newMenu = JSON.parse(JSON.stringify(prev));
            const meal = newMenu[dayIndex].meals[mealIndex];
            if (meal.subMeals.length > 1) {
                meal.subMeals = meal.subMeals.filter((sm: any) => sm.id !== subMealId);
            }
            return newMenu;
        });
        setIsDirty(true);
    };

    const handleRemoveMeal = (dayIndex: number, mealIndex: number) => {
        setWeekMenuState(prev => {
            const newMenu = JSON.parse(JSON.stringify(prev));
            if (newMenu[dayIndex]?.meals) newMenu[dayIndex].meals.splice(mealIndex, 1);
            return newMenu;
        });
        setIsDirty(true);
    };

    const handleRemoveDish = (dayIndex: number, mealIndex: number, subMealId: string) => {
        setWeekMenuState(prev => prev.map((day, dIdx) => {
            if (dIdx !== dayIndex) return day;
            return {
                ...day,
                meals: day.meals.map((meal, mIdx) => {
                    if (mIdx !== mealIndex) return meal;
                    return {
                        ...meal,
                        subMeals: meal.subMeals.map(subMeal => 
                            subMeal.id === subMealId ? { ...subMeal, dish: null } : subMeal
                        )
                    };
                })
            };
        }));
        setIsDirty(true);
    };

    const handleMove = (type: 'meal' | 'subMeal', indices: number[], direction: 'up' | 'down') => {
        const [dayIdx, mealIdx, subIdx] = indices;
        setWeekMenuState(prev => {
            const newMenu = JSON.parse(JSON.stringify(prev));
            if (type === 'meal') {
                const meals = newMenu[dayIdx].meals;
                const target = direction === 'up' ? mealIdx - 1 : mealIdx + 1;
                if (target >= 0 && target < meals.length) {
                    [meals[mealIdx], meals[target]] = [meals[target], meals[mealIdx]];
                }
            } else {
                const subMeals = newMenu[dayIdx].meals[mealIdx].subMeals;
                const target = direction === 'up' ? subIdx - 1 : subIdx + 1;
                if (target >= 0 && target < subMeals.length) {
                    [subMeals[subIdx], subMeals[target]] = [subMeals[target], subMeals[subIdx]];
                }
            }
            return newMenu;
        });
        setIsDirty(true);
    };

    // Saved Weeks Logic
    const handleQuickSave = () => {
        const idToSave = (activeWeekId && activeWeekId !== 'default-new-menu') ? activeWeekId : null;
        if (idToSave) {
            handleOverwriteWeek(idToSave);
        } else {
            return false; // Signal to open modal
        }
        return true;
    };

    const handleSaveNewWeek = (name: string) => {
        const newId = Date.now().toString();
        const newSavedWeek: SavedWeek = {
            id: newId,
            name,
            menu: JSON.parse(JSON.stringify(weekMenu)),
            notes: weekNotes,
            ruleNames: [...appliedRuleNames]
        };
        setSavedWeeks([newSavedWeek, ...savedWeeks]);
        setActiveWeekId(newId);
        setIsDirty(false);
    };

    const handleOverwriteWeek = (id: string) => {
        setSavedWeeks(prev => prev.map(w => w.id === id ? {
            ...w,
            menu: JSON.parse(JSON.stringify(weekMenu)),
            notes: weekNotes,
            ruleNames: [...appliedRuleNames]
        } : w));
        setActiveWeekId(id);
        setIsDirty(false);
    };

    const handleLoadWeek = (week: SavedWeek) => {
        setWeekMenuState(JSON.parse(JSON.stringify(week.menu)));
        setWeekNotesState(week.notes);
        setAppliedRuleNames([...week.ruleNames]);
        setActiveWeekId(week.id);
        setIsDirty(false);
    };

    const handleDeleteWeek = (id: string) => {
        setSavedWeeks(prev => prev.filter(w => w.id !== id));
        if (activeWeekId === id) setActiveWeekId(null);
    };

    const handleImportWeeks = (weeks: SavedWeek[]) => {
        setSavedWeeks(prev => [...weeks, ...prev]);
    };

    return {
        weekMenu,
        displayWeekMenu,
        weekNotes,
        setWeekNotes,
        appliedRuleNames,
        activeWeekId,
        activeWeekName,
        savedWeeks,
        isDirty,
        currentSectionSuggestions,
        mealSuggestions,
        setWeekMenu,
        handleGenerateWeek,
        handleAssignDish,
        handleAddSubMeal,
        handleRenameSubMeal,
        handleAddMeal,
        handleRemoveSubMeal,
        handleRemoveMeal,
        handleRemoveDish,
        handleMove,
        handleQuickSave,
        handleSaveNewWeek,
        handleOverwriteWeek,
        handleLoadWeek,
        handleDeleteWeek,
        handleImportWeeks
    };
};

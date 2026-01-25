
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Day, Dish, SavedRule, RuleCategory, AppLanguage, SavedWeek } from './types';
import { 
    DAYS_OF_WEEK_KEYS, MEAL_NAMES_KEYS, TRANSLATIONS, 
    DEFAULT_DISH_CATEGORIES, DEFAULT_SECTION_SUGGESTIONS 
} from './constants';
import WeekView from './components/WeekView';
import DishSelector from './components/DishSelector';
import RecipeBookView from './components/RecipeBookView';
import GroceryListView from './components/GroceryListView';
import RulesView from './components/RulesView';
import Header from './components/Header';
import { generateFullWeekMenu } from './services/geminiService';
import GenerateWeekModal from './components/GenerateWeekModal';
import RecipeDetailModal from './components/RecipeDetailModal';
import SubMealNameModal from './components/SubMealNameModal';
import MealNameModal from './components/MealNameModal';
import PrintWeekModal from './components/PrintWeekModal';
import PrintGroceryModal from './components/PrintGroceryModal';
import SavedWeeksModal from './components/SavedWeeksModal';
import { initialRecipes } from './initialRecipes';
import html2canvas from 'html2canvas';

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

function App() {
  const [language, setLanguage] = useState<AppLanguage>('es');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true;
  });
  
  const [activeWeekId, setActiveWeekId] = useState<string | null>(() => {
      return localStorage.getItem('active_week_id');
  });

  const [hiddenDayKeys, setHiddenDayKeys] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('hidden_day_keys');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('bg-dark-bg', 'text-dark-text');
      document.body.classList.remove('bg-white', 'text-gray-900');
    } else {
      document.body.classList.add('bg-white', 'text-gray-900');
      document.body.classList.remove('bg-dark-bg', 'text-dark-text');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
      if (activeWeekId) localStorage.setItem('active_week_id', activeWeekId);
      else localStorage.removeItem('active_week_id');
  }, [activeWeekId]);

  useEffect(() => {
    localStorage.setItem('hidden_day_keys', JSON.stringify(Array.from(hiddenDayKeys)));
  }, [hiddenDayKeys]);

  const t = useCallback((key: string): string => {
      const translation = TRANSLATIONS[key]?.[language];
      return translation || key;
  }, [language]);

  const [dishCategories, setDishCategories] = useState<string[]>(() => {
      const saved = localStorage.getItem('dish_categories');
      return saved ? JSON.parse(saved) : [];
  });
  
  const [subMealNameHistory, setSubMealNameHistory] = useState<string[]>([]);
  
  const currentSectionSuggestions = useMemo(() => {
      const defaults = DEFAULT_SECTION_SUGGESTIONS.map(key => t(key));
      return Array.from(new Set([...defaults, ...subMealNameHistory]));
  }, [t, subMealNameHistory]);

  const mealSuggestions = useMemo(() => {
      return STANDARD_MEAL_KEYS.map(key => t(key));
  }, [t]);

  const currentDishCategories = useMemo(() => {
      const defaults = DEFAULT_DISH_CATEGORIES.map(key => key);
      return Array.from(new Set([...defaults, ...dishCategories]));
  }, [dishCategories]);

  const [weekMenu, setWeekMenu] = useState<Day[]>(initializeWeekMenu());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroceryListOpen, setIsGroceryListOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ dayIndex: number; mealIndex: number; subMealId: string } | null>(null);
  
  const [recipeBook, setRecipeBook] = useState<Dish[]>(() => {
      const saved = localStorage.getItem('saved_recipes');
      return saved ? JSON.parse(saved) : initialRecipes;
  });

  const [currentView, setCurrentView] = useState<'planner' | 'recipes' | 'rules'>('planner');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewingDish, setViewingDish] = useState<Dish | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Dish | null>(null);
  const [addingSubMealTo, setAddingSubMealTo] = useState<{dayIndex: number, mealIndex: number} | null>(null);
  const [addingMealTo, setAddingMealTo] = useState<{dayIndex: number} | null>(null);
  
  const [isPrintWeekModalOpen, setIsPrintWeekModalOpen] = useState(false);
  const [isPrintGroceryModalOpen, setIsPrintGroceryModalOpen] = useState(false);
  
  const [weekNotes, setWeekNotes] = useState('');
  const [appliedRuleNames, setAppliedRuleNames] = useState<string[]>([]);
  
  const [savedWeeks, setSavedWeeks] = useState<SavedWeek[]>(() => {
      const saved = localStorage.getItem('saved_weeks');
      if (saved) return JSON.parse(saved);
      return [{
          id: 'default-new-menu',
          name: 'New Menu', 
          menu: initializeWeekMenu(),
          notes: '',
          ruleNames: []
      }];
  });

  const activeWeekName = useMemo(() => {
    const week = savedWeeks.find(w => w.id === activeWeekId);
    return week ? week.name : t('new_menu');
  }, [savedWeeks, activeWeekId, t]);

  const [isSavedWeeksModalOpen, setIsSavedWeeksModalOpen] = useState(false);
  const [savedRules, setSavedRules] = useState<SavedRule[]>(() => {
      const saved = localStorage.getItem('saved_rules_v2');
      return saved ? JSON.parse(saved) : [];
  });
  const [ruleCategories, setRuleCategories] = useState<RuleCategory[]>(() => {
      const saved = localStorage.getItem('rule_categories');
      return saved ? JSON.parse(saved) : [];
  });
  const [ingredientStoreMap, setIngredientStoreMap] = useState<Record<string, string>>(() => {
      const saved = localStorage.getItem('ingredient_stores');
      return saved ? JSON.parse(saved) : {};
  });
  const [checkedGroceryItems, setCheckedGroceryItems] = useState<Record<string, boolean>>({});

  useEffect(() => { localStorage.setItem('saved_rules_v2', JSON.stringify(savedRules)); }, [savedRules]);
  useEffect(() => { localStorage.setItem('rule_categories', JSON.stringify(ruleCategories)); }, [ruleCategories]);
  useEffect(() => { localStorage.setItem('dish_categories', JSON.stringify(dishCategories)); }, [dishCategories]);
  useEffect(() => { localStorage.setItem('ingredient_stores', JSON.stringify(ingredientStoreMap)); }, [ingredientStoreMap]);
  useEffect(() => { localStorage.setItem('saved_weeks', JSON.stringify(savedWeeks)); }, [savedWeeks]);
  useEffect(() => { localStorage.setItem('saved_recipes', JSON.stringify(recipeBook)); }, [recipeBook]);

  const handleAddDishCategory = (name: string) => {
      if (!dishCategories.includes(name) && !DEFAULT_DISH_CATEGORIES.includes(name)) {
          setDishCategories([...dishCategories, name]);
      }
  };
  const handleDeleteDishCategory = (name: string) => {
      if (!DEFAULT_DISH_CATEGORIES.includes(name)) {
         setDishCategories(dishCategories.filter(c => c !== name));
      }
  };

  const handleAddRule = (rule: Omit<SavedRule, 'id'>) => {
      const newRule = { ...rule, id: Date.now().toString() + Math.random() };
      setSavedRules([...savedRules, newRule]);
  };
  const handleUpdateRule = (rule: SavedRule) => {
      setSavedRules(savedRules.map(r => r.id === rule.id ? rule : r));
  };
  const handleDeleteRule = (id: string) => {
      setSavedRules(savedRules.filter(r => r.id !== id));
  };
  const handleAddCategory = (name: string) => {
      const newCat = { id: Date.now().toString() + Math.random(), name };
      setRuleCategories([...ruleCategories, newCat]);
  };
  const handleUpdateCategory = (category: RuleCategory) => {
      setRuleCategories(ruleCategories.map(c => c.id === category.id ? category : c));
  };
  const handleDeleteCategory = (id: string) => {
      setRuleCategories(ruleCategories.filter(c => c.id !== id));
      setSavedRules(savedRules.map(r => r.categoryId === id ? { ...r, categoryId: '' } : r));
  };

  const handleImportRules = (data: { rules: SavedRule[], categories: RuleCategory[] }) => {
      const currentCatIds = new Set(ruleCategories.map(c => c.id));
      const currentCatNames = new Set(ruleCategories.map(c => c.name.toLowerCase()));
      const newCategories = data.categories.filter(c => !currentCatIds.has(c.id) && !currentCatNames.has(c.name.toLowerCase()));
      setRuleCategories([...ruleCategories, ...newCategories]);
      const currentRuleIds = new Set(savedRules.map(r => r.id));
      const newRules = data.rules.filter(r => !currentRuleIds.has(r.id));
      setSavedRules([...savedRules, ...newRules]);
  };

  const handleImportRecipes = (importedRecipes: Dish[]) => {
      setRecipeBook(prev => [...importedRecipes, ...prev]);
  };

  const handleClearRecipes = () => {
    if (confirm(t('confirm_clear_recipes'))) {
      setRecipeBook([]);
    }
  };

  const handleToggleGroceryItem = (id: string) => {
    setCheckedGroceryItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrintClick = (mode: 'week' | 'grocery') => {
    if (mode === 'week') setIsPrintWeekModalOpen(true);
    else setIsPrintGroceryModalOpen(true);
  };

  const handleScreenshot = useCallback(async () => {
    if (currentView !== 'planner') {
        setCurrentView('planner');
        await new Promise(r => setTimeout(r, 200));
    }

    const element = document.getElementById('week-view-container');
    if (!element) return;

    try {
        const canvas = await html2canvas(element, {
            backgroundColor: isDarkMode ? '#111827' : '#ffffff',
            scale: 2,
            useCORS: true,
            logging: false,
            onclone: (clonedDoc) => {
                const container = clonedDoc.getElementById('week-view-container');
                if (container) {
                    container.style.height = 'auto';
                    container.style.minHeight = 'auto';
                    container.style.width = '1800px'; 
                    container.style.overflow = 'visible';
                    container.style.display = 'flex';
                    container.style.flexDirection = 'column';

                    const daysGrid = container.querySelector('.flex.gap-4.min-w-max, .md\\:grid-cols-7');
                    if (daysGrid) {
                        (daysGrid as HTMLElement).style.display = 'grid';
                        (daysGrid as HTMLElement).style.gridTemplateColumns = 'repeat(7, 1fr)';
                        (daysGrid as HTMLElement).style.width = '100%';
                        (daysGrid as HTMLElement).style.gap = '16px';
                        (daysGrid as HTMLElement).style.padding = '24px';
                        
                        daysGrid.querySelectorAll('.w-\\[300px\\], md\\:w-auto').forEach(card => {
                            (card as HTMLElement).style.width = '100%';
                            (card as HTMLElement).style.height = 'auto';
                        });
                    }

                    const footer = container.querySelector('.sticky.bottom-0');
                    if (footer) {
                        (footer as HTMLElement).style.position = 'relative';
                        (footer as HTMLElement).style.bottom = 'auto';
                        (footer as HTMLElement).style.marginTop = '40px';
                        (footer as HTMLElement).style.boxShadow = 'none';
                        (footer as HTMLElement).style.borderTop = '2px solid #ccc';
                        (footer as HTMLElement).style.background = isDarkMode ? '#111827' : '#ffffff';
                    }

                    clonedDoc.querySelectorAll('.truncate, .line-clamp-1, .line-clamp-2, .line-clamp-3, .overflow-hidden').forEach(el => {
                        (el as HTMLElement).style.whiteSpace = 'normal';
                        (el as HTMLElement).style.overflow = 'visible';
                        (el as HTMLElement).style.textOverflow = 'clip';
                        (el as HTMLElement).style.display = 'block';
                        (el as HTMLElement).style.webkitLineClamp = 'unset';
                        (el as HTMLElement).style.maxHeight = 'none';
                    });
                }
            }
        });

        const link = document.createElement('a');
        link.download = `plan_menu_${activeWeekName.replace(/\s+/g, '_').toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error("Screenshot failed:", err);
        alert("Error capturing screenshot.");
    }
  }, [currentView, isDarkMode, activeWeekName]);

  const handleSelectSlot = (dayIndex: number, mealIndex: number, subMealId: string) => {
    setSelectedSlot({ dayIndex, mealIndex, subMealId });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  const handleAssignDish = (dish: Dish) => {
    if (!selectedSlot) return;
    const { dayIndex, mealIndex, subMealId } = selectedSlot;
    setWeekMenu(prevMenu => {
      const newMenu = JSON.parse(JSON.stringify(prevMenu));
      const subMeal = newMenu[dayIndex].meals[mealIndex].subMeals.find((sm: any) => sm.id === subMealId);
      if (subMeal) subMeal.dish = dish;
      return newMenu;
    });
  };

  const updateIngredientStores = (dish: Dish) => {
    if (!dish.ingredients) return;
    const newMap = { ...ingredientStoreMap };
    let hasChanges = false;
    dish.ingredients.forEach(ing => {
        if (ing.store && ing.text) {
            newMap[ing.text.trim().toLowerCase()] = ing.store;
            hasChanges = true;
        }
    });
    if (hasChanges) setIngredientStoreMap(newMap);
  };

  const handleSaveRecipe = (recipeToSave: Omit<Dish, 'id'> | Dish) => {
    if (recipeBook.some(recipe => recipe.name.toLowerCase() === recipeToSave.name.toLowerCase())) return;
    const newRecipe: Dish = {
      ...recipeToSave,
      id: ('id' in recipeToSave && recipeToSave.id) ? recipeToSave.id : Date.now().toString(),
    };
    updateIngredientStores(newRecipe);
    setRecipeBook(prevRecipes => [newRecipe, ...prevRecipes]);
  };

  const handleUpdateRecipe = (updatedRecipe: Dish) => {
    updateIngredientStores(updatedRecipe);
    setRecipeBook(prev => prev.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
    setEditingRecipe(null);
  };

  const handleEditFromDetailModal = (dishToEdit: Dish) => {
    const recipeInBook = recipeBook.find(r => r.name.toLowerCase() === dishToEdit.name.toLowerCase());
    if (recipeInBook) {
        setViewingDish(null);
        setCurrentView('recipes');
        setEditingRecipe(recipeInBook);
    }
  };

  const handleGenerateWeek = async (rulesPrompt: string, ruleNames: string[]) => {
    setIsGenerating(true);
    try {
        const translatedWeekMenu = weekMenu.map(day => ({
            ...day,
            name: t(day.name),
            meals: day.meals.map(meal => ({ ...meal, name: t(meal.name) }))
        }));
        const newMenuFromAI = await generateFullWeekMenu(rulesPrompt, translatedWeekMenu, recipeBook, language, currentDishCategories);
        const mergedMenu = weekMenu.map((day, dIdx) => ({
            ...day,
            meals: day.meals.map((meal, mIdx) => ({
                ...meal,
                subMeals: meal.subMeals.map((subMeal, sIdx) => {
                    if (subMeal.dish) return subMeal;
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
        setWeekMenu(mergedMenu);
        setAppliedRuleNames(ruleNames);
        setIsGenerateModalOpen(false);
    } catch (error) {
        console.error(error);
        alert(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleViewRecipe = (dish: Dish) => { setViewingDish(dish); };

  const handleAddSubMeal = (dayIndex: number, mealIndex: number, name: string) => {
    setWeekMenu(prevMenu => {
        const newMenu = JSON.parse(JSON.stringify(prevMenu));
        newMenu[dayIndex].meals[mealIndex].subMeals.push({
            id: Date.now().toString() + Math.random(),
            name,
            dish: null
        });
        return newMenu;
    });
    const isTranslatedDefault = DEFAULT_SECTION_SUGGESTIONS.some(key => t(key) === name);
    if (!isTranslatedDefault && !subMealNameHistory.includes(name)) {
        setSubMealNameHistory(prev => [...prev, name]);
    }
    setAddingSubMealTo(null);
  };

  const handleAddMeal = (dayIndex: number, name: string) => {
      const standardKey = STANDARD_MEAL_KEYS.find(k => t(k).toLowerCase() === name.toLowerCase());
      const finalName = standardKey || name;
      setWeekMenu(prevMenu => {
          const newMenu = JSON.parse(JSON.stringify(prevMenu));
          newMenu[dayIndex].meals.push({
              name: finalName,
              subMeals: [{ id: Date.now().toString() + Math.random(), name: 'Main', dish: null }]
          });
          return newMenu;
      });
      setAddingMealTo(null);
  };
  
  const handleRenameSubMeal = (dayIndex: number, mealIndex: number, subMealId: string, newName: string) => {
      setWeekMenu(prevMenu => {
          const newMenu = JSON.parse(JSON.stringify(prevMenu));
          const subMeal = newMenu[dayIndex].meals[mealIndex].subMeals.find((sm: any) => sm.id === subMealId);
          if (subMeal) subMeal.name = newName;
          return newMenu;
      });
      const isTranslatedDefault = DEFAULT_SECTION_SUGGESTIONS.some(key => t(key) === newName);
      if (newName.trim() && !isTranslatedDefault && !subMealNameHistory.includes(newName)) {
          setSubMealNameHistory(prev => [...prev, newName]);
      }
  };
  
  const handleRemoveSubMeal = (dayIndex: number, mealIndex: number, subMealId: string) => {
      setWeekMenu(prevMenu => {
          const newMenu = JSON.parse(JSON.stringify(prevMenu));
          const meal = newMenu[dayIndex].meals[mealIndex];
          if (meal.subMeals.length > 1) {
              meal.subMeals = meal.subMeals.filter((sm: any) => sm.id !== subMealId);
          }
          return newMenu;
      });
  };

  const handleRemoveMeal = (dayIndex: number, mealIndex: number) => {
      setWeekMenu(prevMenu => {
          const newMenu = JSON.parse(JSON.stringify(prevMenu));
          if (newMenu[dayIndex] && newMenu[dayIndex].meals) newMenu[dayIndex].meals.splice(mealIndex, 1);
          return newMenu;
      });
  };

  const handleMoveMeal = (dayIndex: number, mealIndex: number, direction: 'up' | 'down') => {
      setWeekMenu(prevMenu => {
          const newMenu = JSON.parse(JSON.stringify(prevMenu));
          const meals = newMenu[dayIndex].meals;
          const targetIndex = direction === 'up' ? mealIndex - 1 : mealIndex + 1;
          if (targetIndex >= 0 && targetIndex < meals.length) {
              [meals[mealIndex], meals[targetIndex]] = [meals[targetIndex], meals[mealIndex]];
          }
          return newMenu;
      });
  };

  const handleMoveSubMeal = (dayIndex: number, mealIndex: number, subMealIndex: number, direction: 'up' | 'down') => {
      setWeekMenu(prevMenu => {
          const newMenu = JSON.parse(JSON.stringify(prevMenu));
          const subMeals = newMenu[dayIndex].meals[mealIndex].subMeals;
          const targetIndex = direction === 'up' ? subMealIndex - 1 : subMealIndex + 1;
          if (targetIndex >= 0 && targetIndex < subMeals.length) {
              [subMeals[subMealIndex], subMeals[targetIndex]] = [subMeals[targetIndex], subMeals[subMealIndex]];
          }
          return newMenu;
      });
  };

  const handleRemoveDish = (dayIndex: number, mealIndex: number, subMealId: string) => {
    setWeekMenu(prevMenu => {
        return prevMenu.map((day, dIdx) => {
            if (dIdx !== dayIndex) return day;
            return {
                ...day,
                meals: day.meals.map((meal, mIdx) => {
                    if (mIdx !== mealIndex) return meal;
                    return {
                        ...meal,
                        subMeals: meal.subMeals.map(subMeal => {
                            if (subMeal.id !== subMealId) return subMeal;
                            return { ...subMeal, dish: null };
                        })
                    };
                })
            };
        });
    });
  };

  const displayWeekMenu = useMemo(() => weekMenu.map((day, idx) => ({
      ...day,
      originalIndex: idx, // Keep track of position in standard 7-day array
      name: t(day.name),
      meals: day.meals.map(meal => ({ ...meal, name: t(meal.name) }))
  })), [weekMenu, t]);

  const onOverwrite = useCallback((id: string) => {
    setSavedWeeks(prev => prev.map(w => w.id === id ? {
        ...w,
        menu: JSON.parse(JSON.stringify(weekMenu)),
        notes: weekNotes,
        ruleNames: [...appliedRuleNames]
    } : w));
    setActiveWeekId(id);
    alert(t('save_success') || "Modificaciones guardadas.");
  }, [weekMenu, weekNotes, appliedRuleNames, t]);

  const handleQuickSave = () => {
    if (activeWeekId && activeWeekId !== 'default-new-menu') {
        onOverwrite(activeWeekId);
    } else {
        setIsSavedWeeksModalOpen(true);
    }
  };

  const toggleLanguage = () => {
      const langs: AppLanguage[] = ['es', 'en', 'fr'];
      const currentIndex = langs.indexOf(language);
      const nextIndex = (currentIndex + 1) % langs.length;
      setLanguage(langs[nextIndex]);
  };

  const toggleDayVisibility = (dayKey: string) => {
    setHiddenDayKeys(prev => {
        const next = new Set(prev);
        if (next.has(dayKey)) next.delete(dayKey);
        else next.add(dayKey);
        return next;
    });
  };

  return (
    <>
        <div className={`min-h-screen font-sans print:hidden transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg text-dark-text' : 'bg-white text-gray-900'}`}>
            <Header 
                t={t}
                language={language}
                toggleLanguage={toggleLanguage}
                activeWeekId={activeWeekId}
                handleQuickSave={handleQuickSave}
                setIsSavedWeeksModalOpen={setIsSavedWeeksModalOpen}
                setIsGroceryListOpen={setIsGroceryListOpen}
                setIsGenerateModalOpen={setIsGenerateModalOpen}
                handlePrintClick={handlePrintClick}
                handleScreenshot={handleScreenshot}
                currentView={currentView}
                setCurrentView={setCurrentView}
                isDarkMode={isDarkMode}
                toggleTheme={() => setIsDarkMode(!isDarkMode)}
            />

          <main className="w-full" id="main-content">
            {currentView === 'planner' && <WeekView 
                weekMenu={displayWeekMenu} 
                hiddenDayKeys={hiddenDayKeys}
                onToggleDayVisibility={toggleDayVisibility}
                onSelectSlot={handleSelectSlot} 
                onViewRecipe={handleViewRecipe}
                onAddSubMeal={(dayIndex, mealIndex) => setAddingSubMealTo({dayIndex, mealIndex})}
                onRenameSubMeal={handleRenameSubMeal}
                onRemoveSubMeal={handleRemoveSubMeal}
                onRemoveDish={handleRemoveDish}
                onRemoveMeal={handleRemoveMeal}
                onAddMeal={(dayIndex) => setAddingMealTo({dayIndex})}
                onMoveMeal={handleMoveMeal}
                onMoveSubMeal={handleMoveSubMeal}
                weekNotes={weekNotes}
                setWeekNotes={setWeekNotes}
                appliedRuleNames={appliedRuleNames}
                t={t}
                isDarkMode={isDarkMode}
                activeWeekName={activeWeekName}
            />}
            {currentView === 'recipes' && <div className="container mx-auto">
                <RecipeBookView 
                    recipes={recipeBook} 
                    onAddRecipe={handleSaveRecipe} 
                    onUpdateRecipe={handleUpdateRecipe} 
                    onImportRecipes={handleImportRecipes}
                    onClearRecipes={handleClearRecipes}
                    editingRecipe={editingRecipe}
                    setEditingRecipe={setEditingRecipe}
                    categories={currentDishCategories}
                    onAddCategory={handleAddDishCategory}
                    onDeleteCategory={handleDeleteDishCategory}
                    t={t}
                    ingredientStoreMap={ingredientStoreMap}
                    isDarkMode={isDarkMode}
                />
            </div>}
            {currentView === 'rules' && <div className="container mx-auto">
                <RulesView 
                    rules={savedRules}
                    categories={ruleCategories}
                    onAddRule={handleAddRule}
                    onUpdateRule={handleUpdateRule}
                    onDeleteRule={handleDeleteRule}
                    onAddCategory={handleAddCategory}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onImportRules={handleImportRules}
                    t={t}
                    isDarkMode={isDarkMode}
                />
            </div>}
          </main>
          
          <DishSelector
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSelectDish={handleAssignDish}
            onSaveRecipe={handleSaveRecipe}
            mealIdentifier={(() => {
                if (!selectedSlot) return null;
                const day = weekMenu[selectedSlot.dayIndex];
                const meal = day.meals[selectedSlot.mealIndex];
                const subMeal = meal.subMeals.find(sm => sm.id === selectedSlot.subMealId);
                return { dayName: t(day.name), mealName: subMeal?.name || t(meal.name) };
            })()}
            recipeBook={recipeBook}
            categories={currentDishCategories}
            savedRules={savedRules}
            t={t}
            language={language}
            ingredientStoreMap={ingredientStoreMap}
            onAddCategory={handleAddDishCategory}
            onDeleteCategory={handleDeleteCategory}
            isDarkMode={isDarkMode}
          />

          <GroceryListView 
            isOpen={isGroceryListOpen}
            onClose={() => setIsGroceryListOpen(false)}
            weekMenu={displayWeekMenu}
            ingredientStoreMap={ingredientStoreMap}
            onPrint={() => handlePrintClick('grocery')}
            t={t}
            checkedItems={checkedGroceryItems}
            onToggleItem={handleToggleGroceryItem}
            isDarkMode={isDarkMode}
          />

          <GenerateWeekModal
            isOpen={isGenerateModalOpen}
            onClose={() => setIsGenerateModalOpen(false)}
            onGenerate={handleGenerateWeek}
            isLoading={isGenerating}
            savedRules={savedRules}
            ruleCategories={ruleCategories}
            t={t}
            isDarkMode={isDarkMode}
          />

          <RecipeDetailModal
            isOpen={!!viewingDish}
            onClose={() => setViewingDish(null)}
            dish={viewingDish}
            onSaveRecipe={handleSaveRecipe}
            isRecipeSaved={viewingDish ? recipeBook.some(r => r.name.toLowerCase() === viewingDish.name.toLowerCase()) : false}
            onEditRecipe={handleEditFromDetailModal}
            t={t}
            isDarkMode={isDarkMode}
          />

          <SubMealNameModal
            isOpen={!!addingSubMealTo}
            onClose={() => setAddingSubMealTo(null)}
            onConfirm={(name) => {
                if (addingSubMealTo) handleAddSubMeal(addingSubMealTo.dayIndex, addingSubMealTo.mealIndex, name)
            }}
            history={currentSectionSuggestions}
            t={t}
            isDarkMode={isDarkMode}
          />

          <MealNameModal
            isOpen={!!addingMealTo}
            onClose={() => setAddingMealTo(null)}
            onConfirm={(name) => handleAddMeal(addingMealTo!.dayIndex, name)}
            suggestions={mealSuggestions}
            t={t}
            isDarkMode={isDarkMode}
          />

          <PrintWeekModal
            isOpen={isPrintWeekModalOpen}
            onClose={() => setIsPrintWeekModalOpen(false)}
            weekMenu={displayWeekMenu.filter(day => !hiddenDayKeys.has(DAYS_OF_WEEK_KEYS[day.originalIndex]))}
            t={t}
            weekNotes={weekNotes}
            appliedRuleNames={appliedRuleNames}
            isDarkMode={isDarkMode}
          />

          <PrintGroceryModal 
            isOpen={isPrintGroceryModalOpen}
            onClose={() => setIsPrintGroceryModalOpen(false)}
            weekMenu={displayWeekMenu}
            t={t}
            ingredientStoreMap={ingredientStoreMap}
            checkedItems={checkedGroceryItems}
            isDarkMode={isDarkMode}
          />

          <SavedWeeksModal
            isOpen={isSavedWeeksModalOpen}
            onClose={() => setIsSavedWeeksModalOpen(false)}
            savedWeeks={savedWeeks}
            activeWeekId={activeWeekId}
            onSave={(name) => {
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
                alert(t('save_success') || "Menu guardado.");
            }}
            onLoad={(week) => {
                setWeekMenu(JSON.parse(JSON.stringify(week.menu)));
                setWeekNotes(week.notes);
                setAppliedRuleNames([...week.ruleNames]);
                setActiveWeekId(week.id);
                setIsSavedWeeksModalOpen(false);
                setHiddenDayKeys(new Set()); 
            }}
            onOverwrite={onOverwrite}
            onDelete={(id) => {
                setSavedWeeks(savedWeeks.filter(w => w.id !== id));
                if (activeWeekId === id) setActiveWeekId(null);
            }}
            onImport={(weeks) => setSavedWeeks(prev => [...weeks, ...prev])}
            t={t}
            isDarkMode={isDarkMode}
          />
        </div>
    </>
  );
}

export default App;


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

const STANDARD_MEAL_KEYS = ['breakfast', 'lunch', 'snack', 'dinner'];

// Helper to create a fresh empty week
const initializeWeekMenu = (): Day[] => {
    return DAYS_OF_WEEK_KEYS.map(dayKey => ({
      name: dayKey, // Store key, translate on render
      meals: MEAL_NAMES_KEYS.map(mealKey => ({
        name: mealKey, // Store key
        subMeals: [{ id: Date.now().toString() + Math.random(), name: 'Main', dish: null }], 
      })),
    }));
};

function App() {
  const [language, setLanguage] = useState<AppLanguage>('es');
  
  // Helper for translations
  const t = useCallback((key: string): string => {
      const translation = TRANSLATIONS[key]?.[language];
      return translation || key; // Fallback to key if not found
  }, [language]);

  // Lazy initialize categories from LocalStorage
  const [dishCategories, setDishCategories] = useState<string[]>(() => {
      const saved = localStorage.getItem('dish_categories');
      return saved ? JSON.parse(saved) : [];
  });
  
  // Calculate display suggestions for submeals (combining translated defaults + history)
  // We don't save the translated default in history, we generate it on fly
  const [subMealNameHistory, setSubMealNameHistory] = useState<string[]>([]);
  
  const currentSectionSuggestions = useMemo(() => {
      const defaults = DEFAULT_SECTION_SUGGESTIONS.map(key => t(key));
      // Combine defaults with custom history, removing duplicates
      return Array.from(new Set([...defaults, ...subMealNameHistory]));
  }, [t, subMealNameHistory]);

  const currentDishCategories = useMemo(() => {
      // Categories can be keys (like 'cat_fish') or custom strings ('My Custom Tag')
      // If it matches a known translation key, translate it. If not, show as is.
      const defaults = DEFAULT_DISH_CATEGORIES.map(key => key); // keys
      const allCats = Array.from(new Set([...defaults, ...dishCategories]));
      
      // We return the raw list to the view, the View uses t() to display.
      // But for custom categories added by user that are NOT in translations, t() returns the key itself.
      return allCats;
  }, [dishCategories]);


  const [weekMenu, setWeekMenu] = useState<Day[]>(initializeWeekMenu());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroceryListOpen, setIsGroceryListOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ dayIndex: number; mealIndex: number; subMealId: string } | null>(null);
  
  // Lazy initialize recipes
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
  
  // Lazy initialize saved weeks
  const [savedWeeks, setSavedWeeks] = useState<SavedWeek[]>(() => {
      const saved = localStorage.getItem('saved_weeks');
      if (saved) return JSON.parse(saved);
      
      // Default template if no saved weeks
      const emptyMenu = initializeWeekMenu();
      return [{
          id: 'default-new-menu',
          name: 'New Menu', 
          menu: emptyMenu,
          notes: '',
          ruleNames: []
      }];
  });

  const [isSavedWeeksModalOpen, setIsSavedWeeksModalOpen] = useState(false);

  // Lazy initialize Rules & Categories
  const [savedRules, setSavedRules] = useState<SavedRule[]>(() => {
      const saved = localStorage.getItem('saved_rules_v2');
      return saved ? JSON.parse(saved) : [];
  });
  
  const [ruleCategories, setRuleCategories] = useState<RuleCategory[]>(() => {
      const saved = localStorage.getItem('rule_categories');
      return saved ? JSON.parse(saved) : [];
  });

  // Lazy initialize Ingredient Stores
  const [ingredientStoreMap, setIngredientStoreMap] = useState<Record<string, string>>(() => {
      const saved = localStorage.getItem('ingredient_stores');
      return saved ? JSON.parse(saved) : {};
  });

  // Grocery List Checked Items State (lifted from GroceryListView)
  const [checkedGroceryItems, setCheckedGroceryItems] = useState<Record<string, boolean>>({});

  // Dynamic Suggestions for Meals
  const mealSuggestions = useMemo(() => {
    if (!addingMealTo) return [];
    
    const day = weekMenu[addingMealTo.dayIndex];
    if (!day) return [];
    
    // Get keys present in this day
    const existingKeys = new Set(day.meals.map(m => m.name));
    
    // Find missing standard keys
    const missingKeys = STANDARD_MEAL_KEYS.filter(k => !existingKeys.has(k));
    
    // Return translated suggestions
    return missingKeys.map(k => t(k));
  }, [addingMealTo, weekMenu, t]);


  // Save changes
  useEffect(() => { localStorage.setItem('saved_rules_v2', JSON.stringify(savedRules)); }, [savedRules]);
  useEffect(() => { localStorage.setItem('rule_categories', JSON.stringify(ruleCategories)); }, [ruleCategories]);
  useEffect(() => { localStorage.setItem('dish_categories', JSON.stringify(dishCategories)); }, [dishCategories]);
  useEffect(() => { localStorage.setItem('ingredient_stores', JSON.stringify(ingredientStoreMap)); }, [ingredientStoreMap]);
  useEffect(() => { localStorage.setItem('saved_weeks', JSON.stringify(savedWeeks)); }, [savedWeeks]);
  useEffect(() => { localStorage.setItem('saved_recipes', JSON.stringify(recipeBook)); }, [recipeBook]);

  // Dish Category Management
  const handleAddDishCategory = (name: string) => {
      if (!dishCategories.includes(name) && !DEFAULT_DISH_CATEGORIES.includes(name)) {
          setDishCategories([...dishCategories, name]);
      }
  };
  const handleDeleteDishCategory = (name: string) => {
      // Only delete if it's not a default
      if (!DEFAULT_DISH_CATEGORIES.includes(name)) {
         setDishCategories(dishCategories.filter(c => c !== name));
      }
  };

  // Rule Handlers
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
      // Merge categories
      const currentCatIds = new Set(ruleCategories.map(c => c.id));
      const currentCatNames = new Set(ruleCategories.map(c => c.name.toLowerCase()));
      const newCategories = data.categories.filter(c => !currentCatIds.has(c.id) && !currentCatNames.has(c.name.toLowerCase()));
      const mergedCategories = [...ruleCategories, ...newCategories];
      
      // Merge rules
      const currentRuleIds = new Set(savedRules.map(r => r.id));
      const newRules = data.rules.filter(r => !currentRuleIds.has(r.id));
      const mergedRules = [...savedRules, ...newRules];

      setRuleCategories(mergedCategories);
      setSavedRules(mergedRules);
      alert(`Imported ${newRules.length} rules and ${newCategories.length} categories.`);
  };

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
      if (subMeal) {
        subMeal.dish = dish;
      }
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
    if (hasChanges) {
        setIngredientStoreMap(newMap);
    }
  };

  const handleSaveRecipe = (recipeToSave: Omit<Dish, 'id'> | Dish) => {
    if (recipeBook.some(recipe => recipe.name.toLowerCase() === recipeToSave.name.toLowerCase())) {
      alert('Ya existe una receta con este nombre.');
      return;
    }
    const newRecipe: Dish = {
      ...recipeToSave,
      id: ('id' in recipeToSave && recipeToSave.id) ? recipeToSave.id : Date.now().toString(),
    };
    
    // Update store map persistence
    updateIngredientStores(newRecipe);

    setRecipeBook(prevRecipes => [newRecipe, ...prevRecipes]);
    alert('¡Receta guardada!');
  };

  const handleUpdateRecipe = (updatedRecipe: Dish) => {
    updateIngredientStores(updatedRecipe);
    setRecipeBook(prev => prev.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
    setEditingRecipe(null);
    alert('¡Receta actualizada!');
  };

  const handleEditFromDetailModal = (dishToEdit: Dish) => {
    const recipeInBook = recipeBook.find(r => r.name.toLowerCase() === dishToEdit.name.toLowerCase());
    if (recipeInBook) {
        setViewingDish(null);
        setCurrentView('recipes');
        setEditingRecipe(recipeInBook);
    } else {
        alert("No se pudo encontrar la receta para editar.");
    }
  };

  const handleGenerateWeek = async (rulesPrompt: string, ruleNames: string[]) => {
    setIsGenerating(true);
    try {
        const translatedWeekMenu = weekMenu.map(day => ({
            ...day,
            name: t(day.name),
            meals: day.meals.map(meal => ({
                ...meal,
                name: t(meal.name)
            }))
        }));

        const newMenuFromAI = await generateFullWeekMenu(rulesPrompt, translatedWeekMenu, recipeBook, language, currentDishCategories);

        // MERGE LOGIC:
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
                             dish: {
                                 ...aiSubMeal.dish,
                                 id: Date.now().toString() + Math.random() // Ensure new ID
                             }
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

  const handleViewRecipe = (dish: Dish) => {
    setViewingDish(dish);
  };

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
    
    // If name is NOT in translations, add to custom history
    const isTranslatedDefault = DEFAULT_SECTION_SUGGESTIONS.some(key => t(key) === name);
    if (!isTranslatedDefault && !subMealNameHistory.includes(name)) {
        setSubMealNameHistory(prev => [...prev, name]);
    }
    setAddingSubMealTo(null);
  };

  const handleAddMeal = (dayIndex: number, name: string) => {
      // Reverse map: If user selected a translated standard key, save the key instead of the translation
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
          if (subMeal) {
              subMeal.name = newName;
          }
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
          if (newMenu[dayIndex] && newMenu[dayIndex].meals) {
              newMenu[dayIndex].meals.splice(mealIndex, 1);
          }
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

  const isRecipeSaved = (dish: Dish): boolean => {
    return recipeBook.some(r => r.name.toLowerCase() === dish.name.toLowerCase());
  };
  
  const getMealIdentifier = () => {
    if (!selectedSlot) return null;
    const day = weekMenu[selectedSlot.dayIndex];
    const meal = day.meals[selectedSlot.mealIndex];
    const subMeal = meal.subMeals.find(sm => sm.id === selectedSlot.subMealId);
    return { dayName: t(day.name), mealName: subMeal?.name || t(meal.name) };
  }

  const handleImportRecipes = (importedRecipes: Dish[]) => {
      setRecipeBook(currentRecipes => {
          const currentIds = new Set(currentRecipes.map(r => r.id));
          const currentNames = new Set(currentRecipes.map(r => r.name.toLowerCase()));
          
          const newRecipes = importedRecipes.filter(r => {
              if (r.id && currentIds.has(r.id)) return false;
              if (currentNames.has(r.name.toLowerCase())) return false;
              return true;
          }).map(r => ({
              ...r,
              id: r.id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
          }));
          
          // Also update store map from imported recipes
          const newMap = { ...ingredientStoreMap };
          newRecipes.forEach(r => {
              r.ingredients?.forEach(ing => {
                  if (ing.store && ing.text) {
                      newMap[ing.text.trim().toLowerCase()] = ing.store;
                  }
              });
          });
          setIngredientStoreMap(newMap);

          const merged = [...newRecipes, ...currentRecipes];
          alert(`Imported ${newRecipes.length} new recipes.`);
          return merged;
      });
  }

  const handleImportWeeks = (importedWeeks: SavedWeek[]) => {
      setSavedWeeks(currentWeeks => {
          const currentIds = new Set(currentWeeks.map(w => w.id));
          
          const newWeeks = importedWeeks.filter(w => {
              if (currentIds.has(w.id)) return false; // Simple dup check ID
              // Could also check name duplicates but let's allow it with unique IDs
              return true;
          }).map(w => ({
             ...w,
             id: currentIds.has(w.id) ? Date.now().toString() + Math.random() : w.id 
          }));

          const merged = [...newWeeks, ...currentWeeks];
          alert(`Imported ${newWeeks.length} saved weeks.`);
          return merged;
      });
  };

  const handlePrintClick = (mode: 'week' | 'grocery') => {
      if (mode === 'week') {
          setIsPrintWeekModalOpen(true);
      } else {
          setIsPrintGroceryModalOpen(true);
      }
  };

  const handleSaveWeek = (name: string) => {
      const newSavedWeek: SavedWeek = {
          id: Date.now().toString(),
          name,
          menu: weekMenu,
          notes: weekNotes,
          ruleNames: appliedRuleNames
      };
      setSavedWeeks([newSavedWeek, ...savedWeeks]);
      alert("Week saved successfully!");
  };

  const handleLoadWeek = (week: SavedWeek) => {
      // Deep copy to ensure no reference issues
      setWeekMenu(JSON.parse(JSON.stringify(week.menu)));
      setWeekNotes(week.notes);
      setAppliedRuleNames(week.ruleNames);
      setIsSavedWeeksModalOpen(false);
  };

  const handleWeekSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      const week = savedWeeks.find(w => w.id === value);
      if (week) {
          handleLoadWeek(week);
      }
      e.target.value = ''; // Reset select
  };

  const handleDeleteWeek = (id: string) => {
      setSavedWeeks(savedWeeks.filter(w => w.id !== id));
  };

  const handleToggleGroceryItem = (id: string) => {
      setCheckedGroceryItems(prev => {
          const newState = { ...prev };
          if (newState[id]) {
              delete newState[id];
          } else {
              newState[id] = true;
          }
          return newState;
      });
  };

  // Transform weekMenu for display (translation) with useMemo to prevent unnecessary re-renders
  const displayWeekMenu = useMemo(() => weekMenu.map(day => ({
      ...day,
      name: t(day.name),
      meals: day.meals.map(meal => ({
          ...meal,
          name: t(meal.name)
      }))
  })), [weekMenu, t]);

  return (
    <>
        <div className="min-h-screen bg-dark-bg text-dark-text font-sans print:hidden">
            <Header 
                t={t}
                language={language}
                setLanguage={setLanguage}
                savedWeeks={savedWeeks}
                handleWeekSelectChange={handleWeekSelectChange}
                setIsSavedWeeksModalOpen={setIsSavedWeeksModalOpen}
                setIsGroceryListOpen={setIsGroceryListOpen}
                setIsGenerateModalOpen={setIsGenerateModalOpen}
                handlePrintClick={handlePrintClick}
                currentView={currentView}
                setCurrentView={setCurrentView}
            />

          <main className="container mx-auto" id="main-content">
            {currentView === 'planner' && <WeekView 
                weekMenu={displayWeekMenu} 
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
            />}
            {currentView === 'recipes' && <RecipeBookView 
                recipes={recipeBook} 
                onAddRecipe={handleSaveRecipe} 
                onUpdateRecipe={handleUpdateRecipe} 
                onImportRecipes={handleImportRecipes}
                editingRecipe={editingRecipe}
                setEditingRecipe={setEditingRecipe}
                categories={currentDishCategories}
                onAddCategory={handleAddDishCategory}
                onDeleteCategory={handleDeleteDishCategory}
                t={t}
                ingredientStoreMap={ingredientStoreMap}
            />}
            {currentView === 'rules' && <RulesView 
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
            />}
          </main>
          
          <DishSelector
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSelectDish={handleAssignDish}
            onSaveRecipe={handleSaveRecipe}
            mealIdentifier={getMealIdentifier()}
            recipeBook={recipeBook}
            categories={currentDishCategories}
            t={t}
            language={language}
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
          />

          <GenerateWeekModal
            isOpen={isGenerateModalOpen}
            onClose={() => setIsGenerateModalOpen(false)}
            onGenerate={handleGenerateWeek}
            isLoading={isGenerating}
            savedRules={savedRules}
            ruleCategories={ruleCategories}
            t={t}
          />

          <RecipeDetailModal
            isOpen={!!viewingDish}
            onClose={() => setViewingDish(null)}
            dish={viewingDish}
            onSaveRecipe={handleSaveRecipe}
            isRecipeSaved={viewingDish ? isRecipeSaved(viewingDish) : false}
            onEditRecipe={handleEditFromDetailModal}
            t={t}
          />

          <SubMealNameModal
            isOpen={!!addingSubMealTo}
            onClose={() => setAddingSubMealTo(null)}
            onConfirm={(name) => {
                if (addingSubMealTo) {
                    handleAddSubMeal(addingSubMealTo.dayIndex, addingSubMealTo.mealIndex, name)
                }
            }}
            history={currentSectionSuggestions}
            t={t}
          />

          <MealNameModal
            isOpen={!!addingMealTo}
            onClose={() => setAddingMealTo(null)}
            onConfirm={(name) => handleAddMeal(addingMealTo!.dayIndex, name)}
            suggestions={mealSuggestions}
            t={t}
          />

          <PrintWeekModal
            isOpen={isPrintWeekModalOpen}
            onClose={() => setIsPrintWeekModalOpen(false)}
            weekMenu={displayWeekMenu}
            t={t}
            weekNotes={weekNotes}
            appliedRuleNames={appliedRuleNames}
          />

          <PrintGroceryModal 
            isOpen={isPrintGroceryModalOpen}
            onClose={() => setIsPrintGroceryModalOpen(false)}
            weekMenu={displayWeekMenu}
            t={t}
            ingredientStoreMap={ingredientStoreMap}
            checkedItems={checkedGroceryItems}
          />

          <SavedWeeksModal
            isOpen={isSavedWeeksModalOpen}
            onClose={() => setIsSavedWeeksModalOpen(false)}
            savedWeeks={savedWeeks}
            onSave={handleSaveWeek}
            onLoad={handleLoadWeek}
            onDelete={handleDeleteWeek}
            onImport={handleImportWeeks}
            t={t}
          />
        </div>
    </>
  );
}

export default App;

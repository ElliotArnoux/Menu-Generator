
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dish, SavedRule, RuleCategory, AppLanguage, Day } from './types';
import { DAYS_OF_WEEK_KEYS, TRANSLATIONS, DEFAULT_DISH_CATEGORIES } from './constants';
import WeekView from './components/WeekView';
import DishSelector from './components/DishSelector';
import RecipeBookView from './components/RecipeBookView';
import GroceryListView from './components/GroceryListView';
import RulesView from './components/RulesView';
import Header from './components/Header';
import GenerateWeekModal from './components/GenerateWeekModal';
import RecipeDetailModal from './components/RecipeDetailModal';
import SubMealNameModal from './components/SubMealNameModal';
import MealNameModal from './components/MealNameModal';
import PrintGroceryModal from './components/PrintGroceryModal';
import SavedWeeksModal from './components/SavedWeeksModal';

// Hooks & Services
import { storage } from './services/storage';
import { useScreenshot } from './hooks/useScreenshot';
import { useWeekMenu } from './hooks/useWeekMenu';

function App() {
  // -- Global UI State --
  const [language, setLanguage] = useState<AppLanguage>('es');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(storage.theme.get());
  const [currentView, setCurrentView] = useState<'planner' | 'recipes' | 'rules'>('planner');
  const [hiddenDayKeys, setHiddenDayKeys] = useState<Set<string>>(storage.hiddenDays.get());
  
  // -- Modals State --
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroceryListOpen, setIsGroceryListOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isPrintGroceryModalOpen, setIsPrintGroceryModalOpen] = useState(false);
  const [isSavedWeeksModalOpen, setIsSavedWeeksModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // -- Selection State --
  const [selectedSlot, setSelectedSlot] = useState<{ dayIndex: number; mealIndex: number; subMealId: string } | null>(null);
  const [viewingDish, setViewingDish] = useState<Dish | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Dish | null>(null);
  const [addingSubMealTo, setAddingSubMealTo] = useState<{dayIndex: number, mealIndex: number} | null>(null);
  const [addingMealTo, setAddingMealTo] = useState<{dayIndex: number} | null>(null);
  
  // -- Data State (Recipes & Rules) --
  const [recipeBook, setRecipeBook] = useState<Dish[]>(storage.recipes.get());
  const [dishCategories, setDishCategories] = useState<string[]>(storage.dishCategories.get());
  const [savedRules, setSavedRules] = useState<SavedRule[]>(storage.rules.getRules());
  const [ruleCategories, setRuleCategories] = useState<RuleCategory[]>(storage.rules.getCategories());
  const [ingredientStoreMap, setIngredientStoreMap] = useState<Record<string, string>>(storage.ingredients.getStoreMap());
  const [checkedGroceryItems, setCheckedGroceryItems] = useState<Record<string, boolean>>({});

  // -- Custom Hooks --
  const t = useCallback((key: string) => TRANSLATIONS[key]?.[language] || key, [language]);
  
  const { 
      displayWeekMenu, weekMenu, weekNotes, setWeekNotes, appliedRuleNames, activeWeekId, activeWeekName, savedWeeks, isDirty,
      currentSectionSuggestions, mealSuggestions,
      setWeekMenu, // Exposed for syncing
      handleGenerateWeek: execGenerateWeek,
      handleAssignDish: execAssignDish,
      handleAddSubMeal, handleRenameSubMeal, handleAddMeal,
      handleRemoveSubMeal, handleRemoveMeal, handleRemoveDish, handleMove,
      handleQuickSave: execQuickSave, handleSaveNewWeek, handleOverwriteWeek,
      handleLoadWeek, handleDeleteWeek, handleImportWeeks
  } = useWeekMenu(t);

  const { handleScreenshot } = useScreenshot(currentView, setCurrentView, isDarkMode, activeWeekName);

  // -- Effects (Persistence) --
  useEffect(() => {
    document.body.classList.toggle('bg-dark-bg', isDarkMode);
    document.body.classList.toggle('text-dark-text', isDarkMode);
    document.body.classList.toggle('bg-white', !isDarkMode);
    document.body.classList.toggle('text-gray-900', !isDarkMode);
    storage.theme.set(isDarkMode);
  }, [isDarkMode]);

  useEffect(() => { storage.hiddenDays.set(hiddenDayKeys); }, [hiddenDayKeys]);
  useEffect(() => { storage.recipes.set(recipeBook); }, [recipeBook]);
  useEffect(() => { storage.dishCategories.set(dishCategories); }, [dishCategories]);
  useEffect(() => { storage.rules.setRules(savedRules); }, [savedRules]);
  useEffect(() => { storage.rules.setCategories(ruleCategories); }, [ruleCategories]);
  useEffect(() => { storage.ingredients.setStoreMap(ingredientStoreMap); }, [ingredientStoreMap]);

  // -- Helper: Sync Menu with Recipes --
  const syncMenuWithRecipes = useCallback((menu: Day[], recipes: Dish[]): Day[] => {
      const recipeMapById = new Map(recipes.map(r => [r.id, r]));
      const recipeMapByName = new Map(recipes.map(r => [r.name.toLowerCase().trim(), r]));

      return menu.map(day => ({
          ...day,
          meals: day.meals.map(meal => ({
              ...meal,
              subMeals: meal.subMeals.map(subMeal => {
                  if (!subMeal.dish) return subMeal;

                  // 1. Try ID match (Fastest and most accurate for updates)
                  if (subMeal.dish.id && recipeMapById.has(subMeal.dish.id)) {
                      return { ...subMeal, dish: recipeMapById.get(subMeal.dish.id)! };
                  }

                  // 2. Try Name match (Re-linking imported data)
                  const nameKey = subMeal.dish.name.toLowerCase().trim();
                  if (recipeMapByName.has(nameKey)) {
                       return { ...subMeal, dish: recipeMapByName.get(nameKey)! };
                  }

                  return subMeal;
              })
          }))
      }));
  }, []);

  // -- Computed Properties --
  const currentDishCategories = useMemo(() => {
      return Array.from(new Set([...DEFAULT_DISH_CATEGORIES, ...dishCategories]));
  }, [dishCategories]);

  // -- Handlers: Recipe Management --
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
    setRecipeBook(prev => {
        const newBook = [newRecipe, ...prev];
        // Sync week menu to link this new recipe if it matches an existing dish in planner
        setWeekMenu(currentMenu => syncMenuWithRecipes(currentMenu, [newRecipe]));
        return newBook;
    });
  };

  const handleUpdateRecipe = (updatedRecipe: Dish) => {
    updateIngredientStores(updatedRecipe);
    setRecipeBook(prev => prev.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
    // Sync the updated recipe to the planner immediately
    setWeekMenu(currentMenu => syncMenuWithRecipes(currentMenu, [updatedRecipe]));
    setEditingRecipe(null);
  };

  const handleImportRecipes = (importedRecipes: Dish[]) => {
      setRecipeBook(prev => {
          const combined = [...importedRecipes, ...prev];
          // Sync existing planner with newly imported recipes
          setWeekMenu(currentMenu => syncMenuWithRecipes(currentMenu, combined));
          return combined;
      });
  };

  const handleClearRecipes = () => {
    if (confirm(t('confirm_clear_recipes'))) setRecipeBook([]);
  };

  // -- Handlers: Rules Management --
  const handleAddRule = (rule: Omit<SavedRule, 'id'>) => {
      setSavedRules([...savedRules, { ...rule, id: Date.now().toString() + Math.random() }]);
  };
  const handleUpdateRule = (rule: SavedRule) => setSavedRules(savedRules.map(r => r.id === rule.id ? rule : r));
  const handleDeleteRule = (id: string) => setSavedRules(savedRules.filter(r => r.id !== id));
  
  const handleAddRuleCategory = (name: string) => {
      setRuleCategories([...ruleCategories, { id: Date.now().toString() + Math.random(), name }]);
  };
  const handleUpdateRuleCategory = (cat: RuleCategory) => setRuleCategories(ruleCategories.map(c => c.id === cat.id ? cat : c));
  const handleDeleteRuleCategory = (id: string) => {
      setRuleCategories(ruleCategories.filter(c => c.id !== id));
      setSavedRules(savedRules.map(r => r.categoryId === id ? { ...r, categoryId: '' } : r));
  };

  const handleImportRules = (data: { rules: SavedRule[], categories: RuleCategory[] }) => {
      const currentCatIds = new Set(ruleCategories.map(c => c.id));
      const newCategories = data.categories.filter(c => !currentCatIds.has(c.id));
      setRuleCategories([...ruleCategories, ...newCategories]);
      
      const currentRuleIds = new Set(savedRules.map(r => r.id));
      const newRules = data.rules.filter(r => !currentRuleIds.has(r.id));
      setSavedRules([...savedRules, ...newRules]);
  };

  // -- Handlers: Interaction & UI --
  const toggleLanguage = () => {
      const langs: AppLanguage[] = ['es', 'en', 'fr'];
      setLanguage(langs[(langs.indexOf(language) + 1) % langs.length]);
  };

  const toggleDayVisibility = (dayKey: string) => {
    setHiddenDayKeys(prev => {
        const next = new Set(prev);
        if (next.has(dayKey)) next.delete(dayKey); else next.add(dayKey);
        return next;
    });
  };

  const handleAssignDishToSlot = (dish: Dish) => {
      if (!selectedSlot) return;
      execAssignDish(selectedSlot.dayIndex, selectedSlot.mealIndex, selectedSlot.subMealId, dish);
  };

  const handleGenerateWeek = async (rulesPrompt: string, ruleNames: string[]) => {
    setIsGenerating(true);
    try {
        await execGenerateWeek(rulesPrompt, ruleNames, recipeBook, language, currentDishCategories);
        setIsGenerateModalOpen(false);
    } catch (error) {
        console.error(error);
        alert(error instanceof Error ? error.message : "Error generating menu.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleQuickSave = () => {
     const saved = execQuickSave();
     if(saved) alert(t('save_success'));
     else setIsSavedWeeksModalOpen(true);
  };

  const handleOverwriteConfirm = (id: string) => {
      handleOverwriteWeek(id);
      alert(t('save_success'));
  };

  const handleSaveNewWeekConfirm = (name: string) => {
      handleSaveNewWeek(name);
      alert(t('save_success'));
  };

  const handleLoadWeekConfirm = (week: any) => {
      // Before loading, sync the week's dishes with the current recipe book
      const syncedMenu = syncMenuWithRecipes(week.menu, recipeBook);
      handleLoadWeek({ ...week, menu: syncedMenu });
      setIsSavedWeeksModalOpen(false);
      setHiddenDayKeys(new Set());
  };

  return (
    <div className={`min-h-screen font-sans print:hidden transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg text-dark-text' : 'bg-white text-gray-900'}`}>
        <Header 
            t={t}
            language={language}
            toggleLanguage={toggleLanguage}
            activeWeekId={activeWeekId}
            activeWeekName={activeWeekName}
            isDirty={isDirty}
            handleQuickSave={handleQuickSave}
            setIsSavedWeeksModalOpen={setIsSavedWeeksModalOpen}
            setIsGroceryListOpen={setIsGroceryListOpen}
            setIsGenerateModalOpen={setIsGenerateModalOpen}
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
            onSelectSlot={(d, m, s) => { setSelectedSlot({ dayIndex: d, mealIndex: m, subMealId: s }); setIsModalOpen(true); }}
            onViewRecipe={(dish) => setViewingDish(dish)}
            onAddSubMeal={(d, m) => setAddingSubMealTo({dayIndex: d, mealIndex: m})}
            onRenameSubMeal={handleRenameSubMeal}
            onRemoveSubMeal={handleRemoveSubMeal}
            onRemoveDish={handleRemoveDish}
            onRemoveMeal={handleRemoveMeal}
            onAddMeal={(d) => setAddingMealTo({dayIndex: d})}
            onMoveMeal={(d, m, dir) => handleMove('meal', [d, m], dir)}
            onMoveSubMeal={(d, m, s, dir) => handleMove('subMeal', [d, m, s], dir)}
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
                onAddCategory={handleAddRuleCategory}
                onUpdateCategory={handleUpdateRuleCategory}
                onDeleteCategory={handleDeleteRuleCategory}
                onImportRules={handleImportRules}
                t={t}
                isDarkMode={isDarkMode}
            />
        </div>}
      </main>
      
      {/* Modals */}
      <DishSelector
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedSlot(null); }}
        onSelectDish={handleAssignDishToSlot}
        onSaveRecipe={handleSaveRecipe}
        mealIdentifier={selectedSlot ? { dayName: t(weekMenu[selectedSlot.dayIndex].name), mealName: t(weekMenu[selectedSlot.dayIndex].meals[selectedSlot.mealIndex].name) } : null}
        recipeBook={recipeBook}
        categories={currentDishCategories}
        savedRules={savedRules}
        t={t}
        language={language}
        ingredientStoreMap={ingredientStoreMap}
        onAddCategory={handleAddDishCategory}
        onDeleteCategory={handleDeleteDishCategory}
        isDarkMode={isDarkMode}
      />

      <GroceryListView 
        isOpen={isGroceryListOpen}
        onClose={() => setIsGroceryListOpen(false)}
        weekMenu={displayWeekMenu}
        ingredientStoreMap={ingredientStoreMap}
        onPrint={() => setIsPrintGroceryModalOpen(true)}
        t={t}
        checkedItems={checkedGroceryItems}
        onToggleItem={(id) => setCheckedGroceryItems(p => ({ ...p, [id]: !p[id] }))}
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
        onEditRecipe={(d) => { setViewingDish(null); setCurrentView('recipes'); setEditingRecipe(recipeBook.find(r => r.name.toLowerCase() === d.name.toLowerCase()) || d); }}
        t={t}
        isDarkMode={isDarkMode}
      />

      <SubMealNameModal
        isOpen={!!addingSubMealTo}
        onClose={() => setAddingSubMealTo(null)}
        onConfirm={(name) => { if (addingSubMealTo) handleAddSubMeal(addingSubMealTo.dayIndex, addingSubMealTo.mealIndex, name); setAddingSubMealTo(null); }}
        history={currentSectionSuggestions}
        t={t}
        isDarkMode={isDarkMode}
      />

      <MealNameModal
        isOpen={!!addingMealTo}
        onClose={() => setAddingMealTo(null)}
        onConfirm={(name) => { if (addingMealTo) handleAddMeal(addingMealTo.dayIndex, name); setAddingMealTo(null); }}
        suggestions={mealSuggestions}
        t={t}
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
        onSave={handleSaveNewWeekConfirm}
        onLoad={handleLoadWeekConfirm}
        onOverwrite={handleOverwriteConfirm}
        onDelete={handleDeleteWeek}
        onImport={handleImportWeeks}
        t={t}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default App;

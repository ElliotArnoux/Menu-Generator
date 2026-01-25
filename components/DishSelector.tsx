
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dish, AppLanguage, SavedRule } from '../types';
import { getMealSuggestions } from '../services/geminiService';
import DishCard from './DishCard';
import { XIcon, RefreshCwIcon, Wand2Icon } from './icons';
import RecipeForm from './RecipeForm';

interface DishSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDish: (dish: Dish) => void;
  onSaveRecipe: (dish: Dish | Omit<Dish, 'id'>) => void;
  mealIdentifier: { mealName: string; dayName: string } | null;
  recipeBook: Dish[];
  categories: string[];
  savedRules: SavedRule[];
  t: (key: string) => string;
  language: AppLanguage;
  ingredientStoreMap: Record<string, string>;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (name: string) => void;
  isDarkMode: boolean;
}

const DishSelector: React.FC<DishSelectorProps> = ({ 
    isOpen, onClose, onSelectDish, onSaveRecipe, mealIdentifier, recipeBook, 
    categories, savedRules, t, language, ingredientStoreMap, onAddCategory, onDeleteCategory, isDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'myRecipes' | 'freeText' | 'create'>('myRecipes');
  const [selectedCategory, setSelectedCategory] = useState<string>('Any');
  const [suggestions, setSuggestions] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // AI Customization
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedRuleIds, setSelectedRuleIds] = useState<Set<string>>(new Set());
  const [showAiSettings, setShowAiSettings] = useState(true);

  // Free Text
  const [freeText, setFreeText] = useState('');

  const recipeNamesInBook = useMemo(() => 
    new Set(recipeBook.map(r => r.name.toLowerCase())), 
    [recipeBook]
  );

  const fetchSuggestions = useCallback(async () => {
    if (!mealIdentifier) return;
    setIsLoading(true);
    
    let context = customPrompt;
    if (selectedRuleIds.size > 0) {
        const rulesText = savedRules
            .filter(r => selectedRuleIds.has(r.id))
            .map(r => r.text)
            .join(' ');
        context = `${context}. ${rulesText}`;
    }

    const fetchedSuggestions = await getMealSuggestions(selectedCategory, mealIdentifier.mealName, language, categories, context);
    setSuggestions(fetchedSuggestions);
    setIsLoading(false);
  }, [selectedCategory, mealIdentifier, language, categories, customPrompt, selectedRuleIds, savedRules]);

  // Only auto-fetch on first open, not on every render
  useEffect(() => {
    if (isOpen && mealIdentifier && activeTab === 'ai' && suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [isOpen, activeTab]); 
  
  useEffect(() => {
    if (isOpen) {
        setActiveTab(recipeBook.length > 0 ? 'myRecipes' : 'ai');
        setSearchTerm('');
        setFreeText('');
        setSuggestions([]); 
    }
  }, [isOpen, recipeBook.length]);

  const filteredRecipes = useMemo(() => {
    return recipeBook.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'Any' 
          ? true 
          : (recipe.categories?.includes(selectedCategory) || recipe.category === selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [recipeBook, searchTerm, selectedCategory]);

  const toggleRule = (id: string) => {
    const newSet = new Set(selectedRuleIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setSelectedRuleIds(newSet);
  };

  const handleFreeTextSubmit = () => {
      if (!freeText.trim()) return;
      onSelectDish({
          id: Date.now().toString(),
          name: freeText,
          description: '', 
          ingredients: []
      });
      onClose();
  };

  const handleCreateAndSelect = (dish: Omit<Dish, 'id'> | Dish) => {
      const newDish = {
          ...dish,
          id: ('id' in dish && dish.id) ? dish.id : Date.now().toString()
      };
      onSaveRecipe(newDish);
      onSelectDish(newDish);
      onClose();
  };

  if (!isOpen || !mealIdentifier) return null;

  const handleSelectAndClose = (dish: Dish) => {
    onSelectDish(dish);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50 p-0 sm:items-center sm:p-4">
      <div className="bg-dark-bg w-full max-w-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col transform transition-transform duration-300 ease-in-out translate-y-full sm:translate-y-0 animate-slide-up">
        <header className="flex items-center justify-between p-4 border-b border-dark-border sticky top-0 bg-dark-bg rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-dark-text">Select a Dish</h2>
            <p className="text-brand-light font-semibold">{mealIdentifier.dayName} - {mealIdentifier.mealName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-dark-card transition-colors">
            <XIcon className="h-6 w-6 text-dark-text-secondary" />
          </button>
        </header>

        <div className="p-4 flex-shrink-0 border-b border-dark-border">
            <div className="flex bg-dark-card p-1 rounded-lg overflow-x-auto whitespace-nowrap scrollbar-hide">
                <button onClick={() => setActiveTab('myRecipes')} className={`flex-1 min-w-[100px] py-2 text-xs md:text-sm font-semibold rounded-md transition-colors ${activeTab === 'myRecipes' ? 'bg-brand-primary text-white' : 'text-dark-text-secondary hover:bg-gray-700'}`}>{t('my_recipes')}</button>
                <button onClick={() => setActiveTab('ai')} className={`flex-1 min-w-[100px] py-2 text-xs md:text-sm font-semibold rounded-md transition-colors ${activeTab === 'ai' ? 'bg-brand-primary text-white' : 'text-dark-text-secondary hover:bg-gray-700'}`}>AI</button>
                <button onClick={() => setActiveTab('create')} className={`flex-1 min-w-[100px] py-2 text-xs md:text-sm font-semibold rounded-md transition-colors ${activeTab === 'create' ? 'bg-brand-primary text-white' : 'text-dark-text-secondary hover:bg-gray-700'}`}>{t('tab_create')}</button>
                <button onClick={() => setActiveTab('freeText')} className={`flex-1 min-w-[100px] py-2 text-xs md:text-sm font-semibold rounded-md transition-colors ${activeTab === 'freeText' ? 'bg-brand-primary text-white' : 'text-dark-text-secondary hover:bg-gray-700'}`}>{t('free_text')}</button>
            </div>
        </div>

        {activeTab !== 'freeText' && activeTab !== 'create' && (
            <div className="px-4 py-2 border-b border-dark-border">
                <p className="text-sm text-dark-text-secondary mb-2">{t('categories')}:</p>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedCategory('Any')}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedCategory === 'Any' ? 'bg-brand-primary text-white' : 'bg-dark-card text-dark-text-secondary hover:bg-gray-700'}`}
                    >
                        {t('Any')}
                    </button>
                    {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedCategory === category ? 'bg-brand-primary text-white' : 'bg-dark-card text-dark-text-secondary hover:bg-gray-700'}`}
                    >
                        {t(category)}
                    </button>
                    ))}
                </div>
            </div>
        )}

        <div className="overflow-y-auto flex-grow">
          {activeTab === 'ai' && (
            <div className="p-4">
              <div className="mb-4 bg-dark-card/50 p-3 rounded-lg border border-dark-border">
                  <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => setShowAiSettings(!showAiSettings)}>
                      <h4 className="text-sm font-bold text-brand-light flex items-center gap-2">
                          <Wand2Icon className="h-4 w-4" /> Customize
                      </h4>
                      <span className="text-dark-text-secondary text-xs">{showAiSettings ? 'Hide' : 'Show'}</span>
                  </div>
                  
                  {showAiSettings && (
                      <div className="space-y-3 animate-fade-in">
                          <input 
                              type="text" 
                              value={customPrompt}
                              onChange={(e) => setCustomPrompt(e.target.value)}
                              placeholder={t('ai_custom_placeholder')}
                              className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1.5 text-sm text-dark-text focus:border-brand-primary outline-none"
                          />
                          {savedRules.length > 0 && (
                            <div>
                                <p className="text-xs text-dark-text-secondary mb-1">{t('select_rules_optional')}:</p>
                                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                                    {savedRules.map(rule => (
                                        <button 
                                            key={rule.id}
                                            onClick={() => toggleRule(rule.id)}
                                            className={`text-xs px-2 py-1 rounded border transition-colors ${selectedRuleIds.has(rule.id) ? 'bg-brand-primary border-brand-primary text-white' : 'bg-dark-bg border-dark-border text-dark-text-secondary'}`}
                                        >
                                            {rule.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                          )}
                      </div>
                  )}
              </div>

              <div className="mt-2">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-dark-text">Suggestions</h3>
                    <button onClick={fetchSuggestions} disabled={isLoading} className="flex items-center gap-2 px-3 py-1 bg-dark-card rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50 text-dark-text-secondary">
                        <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="text-xs">Refresh</span>
                    </button>
                </div>
                {isLoading ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestions.length > 0 ? suggestions.map((dish, index) => (
                      <DishCard 
                        key={`${dish.name}-${index}`} 
                        dish={dish} 
                        onSelect={handleSelectAndClose} 
                        onSave={onSaveRecipe}
                        isSaved={recipeNamesInBook.has(dish.name.toLowerCase())}
                      />
                    )) : (
                        <div className="text-center py-8 text-dark-text-secondary">
                            <p>Click Refresh to get AI suggestions.</p>
                        </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'myRecipes' && (
             <div className="p-4">
                <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-dark-card border border-dark-border rounded-md px-3 py-2 mb-4 text-dark-text focus:ring-brand-primary focus:border-brand-primary"
                />
                {filteredRecipes.length > 0 ? (
                    <div className="space-y-3">
                        {filteredRecipes.map((dish) => (
                            <DishCard key={dish.id} dish={dish} onSelect={handleSelectAndClose} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-dark-text-secondary">No recipes found.</p>
                    </div>
                )}
            </div>
          )}

          {activeTab === 'create' && (
              <div className="p-4">
                  <RecipeForm 
                    editingRecipe={null}
                    onSave={handleCreateAndSelect}
                    onCancel={() => setActiveTab('myRecipes')}
                    categories={categories}
                    t={t}
                    ingredientStoreMap={ingredientStoreMap}
                    onAddCategory={onAddCategory}
                    onDeleteCategory={onDeleteCategory}
                  />
              </div>
          )}

          {activeTab === 'freeText' && (
              <div className="p-6 flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-dark-text">{t('free_text')}</h3>
                  <input
                    type="text"
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    placeholder={t('free_text_placeholder')}
                    className="w-full bg-dark-card border border-dark-border rounded-md px-4 py-3 text-dark-text focus:ring-brand-primary focus:border-brand-primary text-lg"
                    autoFocus
                  />
                  <button 
                    onClick={handleFreeTextSubmit}
                    disabled={!freeText.trim()}
                    className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50"
                  >
                      {t('add_free_text')}
                  </button>
              </div>
          )}
        </div>
      </div>
       <style>{`
        @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default DishSelector;

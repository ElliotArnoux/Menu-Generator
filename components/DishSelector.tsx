
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dish, AppLanguage } from '../types';
import { getMealSuggestions } from '../services/geminiService';
import DishCard from './DishCard';
import { XIcon, RefreshCwIcon } from './icons';

interface DishSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDish: (dish: Dish) => void;
  onSaveRecipe: (dish: Dish) => void;
  mealIdentifier: { mealName: string; dayName: string } | null;
  recipeBook: Dish[];
  categories: string[];
  t: (key: string) => string;
  language: AppLanguage;
}

const DishSelector: React.FC<DishSelectorProps> = ({ 
    isOpen, onClose, onSelectDish, onSaveRecipe, mealIdentifier, recipeBook, 
    categories, t, language
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'myRecipes'>('ai');
  const [selectedCategory, setSelectedCategory] = useState<string>('Any');
  const [suggestions, setSuggestions] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const recipeNamesInBook = useMemo(() => 
    new Set(recipeBook.map(r => r.name.toLowerCase())), 
    [recipeBook]
  );

  const fetchSuggestions = useCallback(async () => {
    if (!mealIdentifier) return;
    setIsLoading(true);
    const fetchedSuggestions = await getMealSuggestions(selectedCategory, mealIdentifier.mealName, language, categories);
    setSuggestions(fetchedSuggestions);
    setIsLoading(false);
  }, [selectedCategory, mealIdentifier, language, categories]);

  useEffect(() => {
    if (isOpen && mealIdentifier && activeTab === 'ai') {
      fetchSuggestions();
    }
  }, [isOpen, fetchSuggestions, mealIdentifier, activeTab]);
  
  useEffect(() => {
    if (isOpen) {
        setActiveTab(recipeBook.length > 0 ? 'myRecipes' : 'ai');
        setSearchTerm('');
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
            <div className="flex bg-dark-card p-1 rounded-lg">
                <button onClick={() => setActiveTab('myRecipes')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'myRecipes' ? 'bg-brand-primary text-white' : 'text-dark-text-secondary hover:bg-gray-700'}`}>{t('my_recipes')}</button>
                <button onClick={() => setActiveTab('ai')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'ai' ? 'bg-brand-primary text-white' : 'text-dark-text-secondary hover:bg-gray-700'}`}>AI Suggestions</button>
            </div>
        </div>

        {/* Categories are available in both views now */}
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

        <div className="overflow-y-auto flex-grow">
          {activeTab === 'ai' && (
            <div className="p-4">
              <div className="mt-2">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-dark-text">Suggestions</h3>
                    <button onClick={fetchSuggestions} disabled={isLoading} className="p-2 rounded-full hover:bg-dark-card transition-colors disabled:opacity-50">
                        <RefreshCwIcon className={`h-5 w-5 text-dark-text-secondary ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                {isLoading ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestions.map((dish, index) => (
                      <DishCard 
                        key={`${dish.name}-${index}`} 
                        dish={dish} 
                        onSelect={handleSelectAndClose} 
                        onSave={onSaveRecipe}
                        isSaved={recipeNamesInBook.has(dish.name.toLowerCase())}
                      />
                    ))}
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
        </div>
      </div>
       <style>{`
        @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default DishSelector;

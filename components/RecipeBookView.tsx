
import React, { useState, useRef } from 'react';
import { Dish } from '../types';
import RecipeCard from './RecipeCard';
import RecipeForm from './RecipeForm';
import { DownloadIcon, UploadIcon } from './icons';
import { downloadJson, readJsonFile } from '../fileUtils';

interface RecipeBookViewProps {
  recipes: Dish[];
  onAddRecipe: (dish: Omit<Dish, 'id'> | Dish) => void;
  onUpdateRecipe: (dish: Dish) => void;
  onImportRecipes: (recipes: Dish[]) => void;
  editingRecipe: Dish | null;
  setEditingRecipe: (dish: Dish | null) => void;
  categories: string[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (name: string) => void;
  t: (key: string) => string;
  ingredientStoreMap: Record<string, string>;
  isDarkMode: boolean;
}

const RecipeBookView: React.FC<RecipeBookViewProps> = ({ 
    recipes, onAddRecipe, onUpdateRecipe, onImportRecipes, 
    editingRecipe, setEditingRecipe, categories, onAddCategory, onDeleteCategory, t,
    ingredientStoreMap, isDarkMode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (dish: Omit<Dish, 'id'> | Dish) => {
      if (editingRecipe) {
          onUpdateRecipe(dish as Dish);
      } else {
          onAddRecipe(dish);
      }
  };

  const handleCancelEdit = () => {
      setEditingRecipe(null);
  };

  const handleExport = () => {
      downloadJson('recetas_chericitos.json', recipes);
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
          const json = await readJsonFile<any>(file);
          if (Array.isArray(json)) {
              const validDishes = json.filter((item: any) => item.name);
              if (validDishes.length > 0) {
                  onImportRecipes(validDishes);
              } else {
                  alert("No valid recipes found.");
              }
          } else {
              alert("Invalid format.");
          }
      } catch (error) {
          console.error(error);
          alert("Error reading JSON.");
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Header Actions */}
      <div className="flex justify-end gap-2">
           <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
           <button onClick={handleImportClick} className="flex items-center gap-2 bg-dark-card border border-dark-border px-3 py-2 rounded-md text-sm font-semibold text-dark-text-secondary hover:text-brand-light hover:border-brand-primary transition-colors">
               <UploadIcon className="h-4 w-4" /> {t('import')}
           </button>
           <button onClick={handleExport} className="flex items-center gap-2 bg-dark-card border border-dark-border px-3 py-2 rounded-md text-sm font-semibold text-dark-text-secondary hover:text-brand-light hover:border-brand-primary transition-colors">
               <DownloadIcon className="h-4 w-4" /> {t('export')}
           </button>
      </div>

      {/* Add/Edit Recipe Form using component */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-dark-text mb-4">{editingRecipe ? t('edit_recipe') : t('add_recipe')}</h2>
        <RecipeForm 
            editingRecipe={editingRecipe}
            onSave={handleSave}
            onCancel={handleCancelEdit}
            categories={categories}
            t={t}
            ingredientStoreMap={ingredientStoreMap}
            onAddCategory={onAddCategory}
            onDeleteCategory={onDeleteCategory}
        />
      </div>

      {/* Recipe List */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-2xl font-bold text-dark-text">{t('my_recipes')}</h2>
            <input 
                type="search"
                placeholder={t('search_placeholder')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full md:w-64 bg-dark-card border border-dark-border rounded-md px-3 py-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary"
            />
        </div>
        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} dish={recipe} onEdit={setEditingRecipe} t={t} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-dark-card rounded-lg border-2 border-dashed border-dark-border">
            <p className="text-dark-text-secondary">Empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeBookView;

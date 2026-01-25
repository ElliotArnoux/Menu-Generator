
import React from 'react';
import { Dish } from '../types';
import { XIcon, BookOpenIcon, BookmarkIcon, EditIcon } from './icons';

interface RecipeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: Dish | null;
  onSaveRecipe: (dish: Dish | Omit<Dish, 'id'>) => void;
  isRecipeSaved: boolean;
  onEditRecipe: (dish: Dish) => void;
  t: (key: string) => string;
  isDarkMode: boolean;
}

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ isOpen, onClose, dish, onSaveRecipe, isRecipeSaved, onEditRecipe, t, isDarkMode }) => {
  if (!isOpen || !dish) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50 p-0 sm:items-center sm:p-4">
      <div className="bg-dark-bg w-full max-w-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col transform transition-transform duration-300 ease-in-out translate-y-full sm:translate-y-0 animate-slide-up">
        <header className="flex items-center justify-between p-4 border-b border-dark-border sticky top-0 bg-dark-bg rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="h-6 w-6 text-brand-light" />
            <div>
              <h2 className="text-xl font-bold text-dark-text">{dish.name}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-dark-card transition-colors">
            <XIcon className="h-6 w-6 text-dark-text-secondary" />
          </button>
        </header>

        <div className="overflow-y-auto flex-grow p-6">
            {(dish.ingredients?.length || dish.instructions) ? (
                 <div className="space-y-6">
                    {dish.ingredients && dish.ingredients.length > 0 && (
                        <div>
                        <h4 className="font-semibold text-dark-text text-lg mb-2">{t('ingredients')}</h4>
                        <ul className="list-disc list-inside text-dark-text-secondary space-y-1">
                            {dish.ingredients.map((ing, index) => (
                                <li key={index}>
                                    {ing.quantity ? <span className="font-bold text-brand-light mr-1">{ing.quantity}</span> : ''}
                                    {ing.text}
                                </li>
                            ))}
                        </ul>
                        </div>
                    )}
                    {dish.instructions && (
                        <div>
                        <h4 className="font-semibold text-dark-text text-lg mb-2">{t('instructions')}</h4>
                        <p className="text-dark-text-secondary whitespace-pre-wrap leading-relaxed">{dish.instructions}</p>
                        </div>
                    )}
                 </div>
            ) : (
                <div className="text-center text-dark-text-secondary py-10">
                    No details.
                </div>
            )}
        </div>
        <footer className="p-4 border-t border-dark-border">
          {isRecipeSaved ? (
            <button
                onClick={() => onEditRecipe(dish)}
                className="w-full flex items-center justify-center gap-2 bg-dark-card hover:bg-gray-700 text-brand-light font-bold py-3 px-4 rounded-md transition-colors"
            >
                <EditIcon className="h-5 w-5" />
                <span>{t('edit_recipe')}</span>
            </button>
          ) : (
            <button
                onClick={() => onSaveRecipe(dish)}
                className="w-full flex items-center justify-center gap-2 bg-dark-card hover:bg-gray-700 text-brand-light font-bold py-3 px-4 rounded-md transition-colors"
            >
                <BookmarkIcon className="h-5 w-5" />
                <span>{t('save')}</span>
            </button>
          )}
        </footer>
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

export default RecipeDetailModal;

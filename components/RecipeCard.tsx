
import React, { useState } from 'react';
import { Dish } from '../types';
import { EditIcon } from './icons';
import { getCategoryColor } from '../constants';

interface RecipeCardProps {
  dish: Dish;
  onEdit?: (dish: Dish) => void;
  t?: (key: string) => string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ dish, onEdit, t }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(onEdit) {
      onEdit(dish);
    }
  }

  const displayCategories = dish.categories || (dish.category ? [dish.category] : []);

  return (
    <div className="bg-dark-card rounded-xl shadow-lg overflow-hidden border border-dark-border transition-all duration-300 flex flex-col">
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-dark-text text-xl">{dish.name}</h3>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
            {displayCategories.map(cat => {
                const colors = getCategoryColor(cat);
                return (
                    <span 
                        key={cat} 
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    >
                        {t ? t(cat) : cat}
                    </span>
                );
            })}
        </div>
        <p className="text-dark-text-secondary text-sm mt-1">{dish.description}</p>
      </div>
      {(dish.ingredients?.length || dish.instructions) && (
        <>
          <div className="px-4 pb-4 flex items-center gap-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm font-semibold text-brand-light hover:text-brand-primary transition-colors"
            >
              {isExpanded ? (t ? t('hide_details') : 'Hide Details') : (t ? t('view_details') : 'View Details')}
            </button>
            {onEdit && (
                <button onClick={handleEditClick} className="flex items-center gap-1 text-sm font-semibold text-dark-text-secondary hover:text-brand-light transition-colors">
                    <EditIcon className="h-4 w-4" />
                    <span>{t ? t('edit') : 'Edit'}</span>
                </button>
            )}
          </div>
          {isExpanded && (
            <div className="p-4 border-t border-dark-border bg-gray-800/50">
              {dish.ingredients && dish.ingredients.length > 0 && (
                <div>
                  <h4 className="font-semibold text-dark-text mb-2">{t ? t('ingredients') : 'Ingredients'}</h4>
                  <ul className="list-disc list-inside text-dark-text-secondary space-y-1 text-sm">
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
                <div className="mt-4">
                  <h4 className="font-semibold text-dark-text mb-2">{t ? t('instructions') : 'Instructions'}</h4>
                  <p className="text-dark-text-secondary whitespace-pre-wrap text-sm">{dish.instructions}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecipeCard;

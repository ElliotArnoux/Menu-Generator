import React from 'react';
import { Dish } from '../types';
import { BookmarkIcon } from './icons';

interface DishCardProps {
  dish: Dish;
  onSelect: (dish: Dish) => void;
  onSave?: (dish: Dish) => void;
  isSaved?: boolean;
  saveDisabled?: boolean;
}

const DishCard: React.FC<DishCardProps> = ({ dish, onSelect, onSave, isSaved, saveDisabled }) => {
  
  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      onSave(dish);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onSelect(dish)}
        className="flex-grow bg-dark-card border border-dark-border rounded-lg p-4 text-left transition-all duration-200 hover:bg-gray-700 hover:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
      >
        <h3 className="font-bold text-dark-text text-lg">{dish.name}</h3>
        <p className="text-dark-text-secondary text-sm mt-1">{dish.description}</p>
      </button>
      {onSave && (
        <button 
          onClick={handleSaveClick} 
          disabled={isSaved || saveDisabled}
          className="p-3 rounded-lg bg-dark-card border border-dark-border text-dark-text-secondary transition-colors hover:bg-gray-700 hover:text-brand-light disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-dark-card"
          aria-label={isSaved ? "Guardado" : "Guardar receta"}
        >
            <BookmarkIcon className="h-6 w-6" isFilled={isSaved} />
        </button>
      )}
    </div>
  );
};

export default DishCard;
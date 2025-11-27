
import React from 'react';
import { Day, Dish } from '../types';
import MealSlot from './MealSlot';
import { PlusIcon } from './icons';

interface DayCardProps {
  day: Day;
  dayIndex: number;
  onSelectSlot: (dayIndex: number, mealIndex: number, subMealId: string) => void;
  onViewRecipe: (dish: Dish) => void;
  onAddSubMeal: (dayIndex: number, mealIndex: number) => void;
  onRenameSubMeal: (dayIndex: number, mealIndex: number, subMealId: string, newName: string) => void;
  onRemoveSubMeal: (dayIndex: number, mealIndex: number, subMealId: string) => void;
  onRemoveDish: (dayIndex: number, mealIndex: number, subMealId: string) => void;
  onRemoveMeal: (dayIndex: number, mealIndex: number) => void;
  onAddMeal: (dayIndex: number) => void;
  onMoveMeal: (dayIndex: number, mealIndex: number, direction: 'up' | 'down') => void;
  onMoveSubMeal: (dayIndex: number, mealIndex: number, subMealIndex: number, direction: 'up' | 'down') => void;
  t: (key: string) => string;
  isPrint?: boolean;
}

const DayCard: React.FC<DayCardProps> = ({ 
    day, dayIndex, onSelectSlot, onViewRecipe, onAddSubMeal, 
    onRenameSubMeal, onRemoveSubMeal, onRemoveDish, onRemoveMeal, onAddMeal, 
    onMoveMeal, onMoveSubMeal, t, isPrint = false 
}) => {
  // Mobile: h-auto to grow. Desktop/Print: h-full to fit grid.
  // Mobile: No overflow hidden so sections can be seen. Desktop: Overflow hidden to stay in box.
  const containerClass = isPrint 
    ? "bg-white rounded-none border border-gray-300 h-full flex flex-col overflow-hidden" 
    : "bg-dark-card rounded-xl shadow-lg border border-dark-border flex flex-col h-auto lg:h-full lg:overflow-hidden";

  return (
    <div className={containerClass}>
      <div className={`flex justify-between items-center flex-shrink-0 ${isPrint ? 'bg-gray-100 text-black p-1' : 'bg-gray-800 text-dark-text p-2'}`}>
          <h3 className={`font-bold text-center flex-grow pl-6 ${isPrint ? 'text-xs' : 'text-base md:text-lg'}`}>{day.name}</h3>
          {!isPrint && (
              <button 
                onClick={() => onAddMeal(dayIndex)}
                className="text-dark-text-secondary hover:text-brand-light transition-colors p-1 flex-shrink-0"
                title="Añadir comida"
              >
                  <PlusIcon className="h-5 w-5" />
              </button>
          )}
      </div>
      <div className={`flex-1 flex flex-col ${isPrint || 'lg:overflow-hidden'}`}>
        {day.meals.length > 0 ? (
            day.meals.map((meal, mealIndex) => (
            <div key={`${meal.name}-${mealIndex}`} className={`flex-1 border-t ${isPrint ? 'border-gray-200' : 'border-dark-border'} first:border-t-0 min-h-0`}>
                <MealSlot
                    meal={meal}
                    dayIndex={dayIndex}
                    mealIndex={mealIndex}
                    onSelectSlot={onSelectSlot}
                    onViewRecipe={onViewRecipe}
                    onAddSubMeal={onAddSubMeal}
                    onRenameSubMeal={onRenameSubMeal}
                    onRemoveSubMeal={onRemoveSubMeal}
                    onRemoveDish={onRemoveDish}
                    onRemoveMeal={onRemoveMeal}
                    onMoveMeal={onMoveMeal}
                    onMoveSubMeal={onMoveSubMeal}
                    isFirst={mealIndex === 0}
                    isLast={mealIndex === day.meals.length - 1}
                    t={t}
                    isPrint={isPrint}
                />
            </div>
            ))
        ) : (
            <div className="flex-1 flex items-center justify-center p-4 text-dark-text-secondary text-sm italic min-h-[100px]">
                {!isPrint ? (
                    <button 
                        onClick={() => onAddMeal(dayIndex)}
                        className="flex flex-col items-center gap-2 hover:text-brand-light transition-colors p-4 rounded-lg border border-dashed border-dark-border hover:border-brand-primary"
                    >
                        <PlusIcon className="h-6 w-6" />
                        <span>Add Meal</span>
                    </button>
                ) : (
                    <span>-</span>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default DayCard;

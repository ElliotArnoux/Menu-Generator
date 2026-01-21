
import React from 'react';
import { Dish, Meal } from '../types';
import { PlusIcon, Trash2Icon, ChevronUpIcon, ChevronDownIcon } from './icons';
import SubMealSlot from './SubMealSlot';

interface MealSlotProps {
  meal: Meal;
  dayIndex: number;
  mealIndex: number;
  onSelectSlot: (dayIndex: number, mealIndex: number, subMealId: string) => void;
  onViewRecipe: (dish: Dish) => void;
  onAddSubMeal: (dayIndex: number, mealIndex: number) => void;
  onRenameSubMeal: (dayIndex: number, mealIndex: number, subMealId: string, newName: string) => void;
  onRemoveSubMeal: (dayIndex: number, mealIndex: number, subMealId: string) => void;
  onRemoveDish: (dayIndex: number, mealIndex: number, subMealId: string) => void;
  onRemoveMeal: (dayIndex: number, mealIndex: number) => void;
  onMoveMeal: (dayIndex: number, mealIndex: number, direction: 'up' | 'down') => void;
  onMoveSubMeal: (dayIndex: number, mealIndex: number, subMealIndex: number, direction: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
  t: (key: string) => string;
  isPrint?: boolean;
}

const MealSlot: React.FC<MealSlotProps> = ({ 
    meal, dayIndex, mealIndex, onSelectSlot, onViewRecipe,
    onAddSubMeal, onRenameSubMeal, onRemoveSubMeal, onRemoveDish, onRemoveMeal, 
    onMoveMeal, onMoveSubMeal, isFirst, isLast, t, isPrint = false
}) => {

  return (
    <div className={`flex flex-col gap-1 min-h-[80px] lg:min-h-[100px] h-full ${isPrint ? 'p-0.5' : 'p-1 md:p-2'}`}>
      <div className="flex justify-between items-center px-1 flex-shrink-0">
          <div className="flex items-center gap-1">
             <h4 className={`font-bold text-dark-text-secondary uppercase tracking-wider ${isPrint ? 'text-[8px]' : 'text-10px md:text-xs'}`}>{meal.name}</h4>
             {!isPrint && (
                 <div className="flex flex-col ml-1">
                     {!isFirst && (
                        <button onClick={() => onMoveMeal(dayIndex, mealIndex, 'up')} className="text-dark-text-secondary hover:text-brand-light p-0.5">
                            <ChevronUpIcon className="h-2 w-2 md:h-2.5 md:w-2.5" />
                        </button>
                     )}
                     {!isLast && (
                        <button onClick={() => onMoveMeal(dayIndex, mealIndex, 'down')} className="text-dark-text-secondary hover:text-brand-light p-0.5">
                            <ChevronDownIcon className="h-2 w-2 md:h-2.5 md:w-2.5" />
                        </button>
                     )}
                 </div>
             )}
          </div>
          {!isPrint && (
              <div className="flex items-center gap-1">
                  <button
                    onClick={() => onRemoveMeal(dayIndex, mealIndex)}
                    className="text-dark-text-secondary hover:text-red-400 transition-colors p-0.5"
                    title="Eliminar sección"
                  >
                    <Trash2Icon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onAddSubMeal(dayIndex, mealIndex)}
                    className="text-dark-text-secondary hover:text-brand-light transition-colors p-0.5"
                    title="Añadir sub-sección"
                  >
                    <PlusIcon className="h-3 w-3" />
                  </button>
              </div>
          )}
      </div>
      
      <div className="flex flex-col gap-1 flex-grow">
        {meal.subMeals.map((subMeal, subMealIndex) => (
            <div 
                key={subMeal.id} 
                className="flex flex-col"
            >
                <SubMealSlot 
                    subMeal={subMeal}
                    dayIndex={dayIndex}
                    mealIndex={mealIndex}
                    subMealIndex={subMealIndex}
                    totalSubMeals={meal.subMeals.length}
                    onSelectSlot={onSelectSlot}
                    onViewRecipe={onViewRecipe}
                    onRename={onRenameSubMeal}
                    onRemove={onRemoveSubMeal}
                    onRemoveDish={onRemoveDish}
                    onMoveSubMeal={onMoveSubMeal}
                    canRemove={meal.subMeals.length > 1}
                    t={t}
                    isPrint={isPrint}
                />
            </div>
        ))}
      </div>
    </div>
  );
};

export default MealSlot;

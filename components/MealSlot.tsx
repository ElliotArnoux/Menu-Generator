
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
  onAddMeal: (dayIndex: number) => void;
  onMoveMeal: (dayIndex: number, mealIndex: number, direction: 'up' | 'down') => void;
  onMoveSubMeal: (dayIndex: number, mealIndex: number, subMealIndex: number, direction: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
  t: (key: string) => string;
  isPrint?: boolean;
  isDarkMode: boolean;
}

const MealSlot: React.FC<MealSlotProps> = ({ 
    meal, dayIndex, mealIndex, onSelectSlot, onViewRecipe,
    onAddSubMeal, onRenameSubMeal, onRemoveSubMeal, onRemoveDish, onRemoveMeal, onAddMeal,
    onMoveMeal, onMoveSubMeal, isFirst, isLast, t, isPrint = false, isDarkMode
}) => {

  const labelClass = `font-bold uppercase tracking-wider ${isPrint ? 'text-[8px]' : 'text-10px md:text-xs'} ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'}`;

  return (
    <div className={`flex flex-col gap-1 min-h-[80px] lg:min-h-[100px] h-full ${isPrint ? 'p-0.5' : 'p-1 md:p-2'}`}>
      <div className="flex justify-between items-center px-1 flex-shrink-0">
          <div className="flex items-center gap-1">
             <h4 className={labelClass}>{meal.name}</h4>
             {!isPrint && (
                 <div className="flex flex-col ml-1" data-html2canvas-ignore>
                     {!isFirst && (
                        <button onClick={() => onMoveMeal(dayIndex, mealIndex, 'up')} className={`${isDarkMode ? 'text-dark-text-secondary hover:text-brand-light' : 'text-gray-400 hover:text-brand-primary'} p-0.5`}>
                            <ChevronUpIcon className="h-2 w-2 md:h-2.5 md:w-2.5" />
                        </button>
                     )}
                     {!isLast && (
                        <button onClick={() => onMoveMeal(dayIndex, mealIndex, 'down')} className={`${isDarkMode ? 'text-dark-text-secondary hover:text-brand-light' : 'text-gray-400 hover:text-brand-primary'} p-0.5`}>
                            <ChevronDownIcon className="h-2 w-2 md:h-2.5 md:w-2.5" />
                        </button>
                     )}
                 </div>
             )}
          </div>
          {!isPrint && (
              <div className="flex items-center gap-1" data-html2canvas-ignore>
                  <button
                    onClick={() => onRemoveMeal(dayIndex, mealIndex)}
                    className={`${isDarkMode ? 'text-dark-text-secondary hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition-colors p-0.5`}
                    title="Eliminar sección"
                  >
                    <Trash2Icon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onAddSubMeal(dayIndex, mealIndex)}
                    className={`${isDarkMode ? 'text-dark-text-secondary hover:text-brand-light' : 'text-gray-400 hover:text-brand-primary'} transition-colors p-0.5`}
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
                    isDarkMode={isDarkMode}
                />
            </div>
        ))}
      </div>
    </div>
  );
};

export default MealSlot;


import React from 'react';
import { Day, Dish } from '../types';
import MealSlot from './MealSlot';
import { PlusIcon, XIcon } from './icons';

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
  isDarkMode: boolean;
  onDeleteDay?: () => void;
}

const DayCard: React.FC<DayCardProps> = ({ 
    day, dayIndex, onSelectSlot, onViewRecipe, onAddSubMeal, 
    onRenameSubMeal, onRemoveSubMeal, onRemoveDish, onRemoveMeal, onAddMeal, 
    onMoveMeal, onMoveSubMeal, t, isPrint = false, isDarkMode, onDeleteDay
}) => {
  const containerClass = isPrint 
    ? "bg-white rounded-none border border-gray-300 h-full flex flex-col overflow-hidden" 
    : `rounded-xl shadow-lg border flex flex-col h-full overflow-hidden group/day bg-transparent ${isDarkMode ? 'border-dark-border' : 'border-gray-200'}`;

  const headerClass = `flex justify-between items-center flex-shrink-0 relative h-10 px-2 border-b bg-transparent ${isPrint ? 'text-black' : (isDarkMode ? 'border-dark-border text-dark-text' : 'border-gray-100 text-gray-900')}`;

  return (
    <div className={containerClass}>
      <div className={headerClass}>
          {onDeleteDay && !isPrint && (
              <button 
                onClick={onDeleteDay}
                className={`p-1 rounded-md transition-all ${isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' : 'text-gray-400 hover:text-red-500 hover:bg-gray-200'}`}
                title="Quitar día del menú"
                data-html2canvas-ignore
              >
                  <XIcon className="h-4 w-4" />
              </button>
          )}
          
          <h3 className={`font-bold text-center flex-grow capitalize truncate px-2 ${isPrint ? 'text-xs' : 'text-sm md:text-base'}`}>{day.name}</h3>
          
          {!isPrint && (
              <button 
                onClick={() => onAddMeal(dayIndex)}
                className={`${isDarkMode ? 'text-dark-text-secondary hover:text-brand-light' : 'text-gray-500 hover:text-brand-primary'} transition-colors p-1 flex-shrink-0`}
                title="Añadir comida"
                data-html2canvas-ignore
              >
                  <PlusIcon className="h-5 w-5" />
              </button>
          )}
      </div>
      <div className={`flex flex-col flex-grow bg-transparent ${isPrint ? '' : 'gap-0'} overflow-y-auto overflow-x-hidden scrollbar-thin`}>
        {day.meals.length > 0 ? (
            day.meals.map((meal, mealIndex) => (
            <div key={`${meal.name}-${mealIndex}`} className={`border-t first:border-t-0 flex-grow bg-transparent ${isPrint ? 'border-gray-200' : (isDarkMode ? 'border-dark-border' : 'border-gray-100')}`}>
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
                    onAddMeal={onAddMeal}
                    onMoveMeal={onMoveMeal}
                    onMoveSubMeal={onMoveSubMeal}
                    isFirst={mealIndex === 0}
                    isLast={mealIndex === day.meals.length - 1}
                    t={t}
                    isPrint={isPrint}
                    isDarkMode={isDarkMode}
                />
            </div>
            ))
        ) : (
            <div className={`flex flex-col items-center justify-center p-4 text-sm italic min-h-[100px] flex-grow bg-transparent ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-400'}`}>
                {!isPrint ? (
                    <button 
                        onClick={() => onAddMeal(dayIndex)}
                        className={`flex flex-col items-center gap-2 transition-colors p-4 rounded-lg border border-dashed text-xs bg-transparent ${isDarkMode ? 'border-dark-border hover:text-brand-light hover:border-brand-primary' : 'border-gray-200 hover:text-brand-primary hover:border-brand-primary'}`}
                        data-html2canvas-ignore
                    >
                        <PlusIcon className="h-5 w-5" />
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

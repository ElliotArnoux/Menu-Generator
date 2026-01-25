
import React, { useState, useRef, useEffect } from 'react';
import { Dish, SubMeal } from '../types';
import { BookOpenIcon, EditIcon, Trash2Icon, MinusCircleIcon, ChevronUpIcon, ChevronDownIcon } from './icons';
import { getCategoryColor, CATEGORY_BORDER_COLOR_MAP } from '../constants';

interface SubMealSlotProps {
  subMeal: SubMeal;
  dayIndex: number;
  mealIndex: number;
  subMealIndex: number;
  totalSubMeals: number;
  canRemove: boolean;
  onSelectSlot: (dayIndex: number, mealIndex: number, subMealId: string) => void;
  onViewRecipe: (dish: Dish) => void;
  onRename: (dayIndex: number, mealIndex: number, subMealId: string, newName: string) => void;
  onRemove: (dayIndex: number, mealIndex: number, subMealId: string) => void;
  onRemoveDish: (dayIndex: number, mealIndex: number, subMealId: string) => void;
  onMoveSubMeal: (dayIndex: number, mealIndex: number, subMealIndex: number, direction: 'up' | 'down') => void;
  t: (key: string) => string;
  isPrint?: boolean;
  isDarkMode: boolean;
}

const SubMealSlot: React.FC<SubMealSlotProps> = ({ 
    subMeal, dayIndex, mealIndex, subMealIndex, totalSubMeals, canRemove, 
    onSelectSlot, onViewRecipe, onRename, onRemove, onRemoveDish, onMoveSubMeal, t, isPrint = false, isDarkMode
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(subMeal.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);
  
  const handleNameBlur = () => {
    setIsRenaming(false);
    if (name.trim() && name !== subMeal.name) {
      onRename(dayIndex, mealIndex, subMeal.id, name);
    } else {
        setName(subMeal.name);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setName(subMeal.name);
      setIsRenaming(false);
    }
  };

  const handleSelectClick = () => {
    if (!isPrint) {
        onSelectSlot(dayIndex, mealIndex, subMeal.id);
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (subMeal.dish) {
      onViewRecipe(subMeal.dish);
    }
  };

  const handleRemoveDishClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveDish(dayIndex, mealIndex, subMeal.id);
  };

  const mainCategory = subMeal.dish?.category || subMeal.dish?.categories?.[0];
  const borderColorClass = mainCategory 
        ? CATEGORY_BORDER_COLOR_MAP[mainCategory] || (isDarkMode ? 'border-gray-700' : 'border-gray-300')
        : (isDarkMode ? 'border-gray-700' : 'border-gray-300');

  const dishCategories = subMeal.dish?.categories || (subMeal.dish?.category ? [subMeal.dish.category] : []);

  // PRINT MODE STYLES
  const containerClasses = isPrint 
    ? `h-full flex flex-col pl-1 border-l-2 ${borderColorClass} overflow-hidden`
    : `min-h-[70px] lg:min-h-[80px] flex flex-col pl-2 border-l-2 md:border-l-4 ${borderColorClass} transition-colors overflow-hidden`;

  const titleClasses = isPrint
    ? `text-[8px] font-bold truncate leading-none mb-0.5 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'}`
    : `text-[10px] md:text-xs font-semibold transition-colors truncate ${isDarkMode ? 'text-dark-text-secondary group-hover:text-dark-text' : 'text-gray-500 group-hover:text-gray-900'}`;

  const dishNameClasses = isPrint
    ? "font-bold text-brand-light text-[9px] truncate leading-tight w-full"
    : `font-semibold text-xs truncate max-w-full ${isDarkMode ? 'text-brand-light' : 'text-brand-secondary'}`;

  const dishDescClasses = isPrint
    ? "hidden"
    : `text-[9px] md:text-[10px] leading-tight line-clamp-2 md:line-clamp-3 overflow-hidden text-ellipsis ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'}`;

  // Removed solid backgrounds, replaced with bg-transparent and subtle border on hover
  const cardClasses = isPrint
    ? `flex-1 flex flex-col h-full p-1 rounded-sm text-left overflow-hidden justify-center bg-transparent`
    : `flex-1 flex flex-col min-h-[50px] p-1.5 md:p-2 rounded-md text-left transition overflow-hidden relative group/card bg-transparent border border-transparent hover:border-brand-primary/30`;
  
  const cardContentClasses = isPrint
    ? "flex flex-col items-start gap-0.5 w-full"
    : "flex items-center gap-1 mb-0.5 flex-wrap w-full";

  // Updated empty classes to be bg-transparent
  const emptyClasses = `flex-1 w-full flex items-center justify-center gap-1 text-center border border-dashed rounded-md transition-colors ${isPrint ? 'p-0.5 min-h-[15px]' : 'p-1 min-h-[30px]'} ${isDarkMode ? 'bg-transparent border-dark-border text-dark-text-secondary hover:border-brand-primary hover:text-brand-light' : 'bg-transparent border-gray-200 text-gray-400 hover:border-brand-primary hover:text-brand-primary'}`;

  return (
    <div className={containerClasses}>
        <div className="flex items-center justify-between flex-shrink-0">
            {isRenaming ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleNameBlur}
                    onKeyDown={handleKeyDown}
                    className={`text-xs font-semibold rounded px-1 py-0.5 w-full ${isDarkMode ? 'text-dark-text bg-gray-700' : 'text-gray-900 bg-gray-200'}`}
                />
            ) : (
                <div className="flex items-center gap-1 group w-full">
                    <h5 className={titleClasses}>{subMeal.name}</h5>
                    {!isPrint && (
                        <div className="flex flex-col ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity" data-html2canvas-ignore>
                             {subMealIndex > 0 && (
                                <button onClick={() => onMoveSubMeal(dayIndex, mealIndex, subMealIndex, 'up')} className={`${isDarkMode ? 'text-dark-text-secondary hover:text-brand-light' : 'text-gray-400 hover:text-brand-primary'} p-0.5 leading-none`}>
                                    <ChevronUpIcon className="h-2 w-2" />
                                </button>
                             )}
                             {subMealIndex < totalSubMeals - 1 && (
                                <button onClick={() => onMoveSubMeal(dayIndex, mealIndex, subMealIndex, 'down')} className={`${isDarkMode ? 'text-dark-text-secondary hover:text-brand-light' : 'text-gray-400 hover:text-brand-primary'} p-0.5 leading-none`}>
                                    <ChevronDownIcon className="h-2 w-2" />
                                </button>
                             )}
                        </div>
                    )}

                    {!isPrint && (
                        <button onClick={() => setIsRenaming(true)} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1" data-html2canvas-ignore>
                            <EditIcon className={`h-3 w-3 ${isDarkMode ? 'text-dark-text-secondary hover:text-brand-light' : 'text-gray-400 hover:text-brand-primary'}`} />
                        </button>
                    )}
                    {!isPrint && canRemove && (
                         <button onClick={() => onRemove(dayIndex, mealIndex, subMeal.id)} className={`ml-auto opacity-0 group-hover:opacity-100 flex-shrink-0 ${isDarkMode ? 'text-dark-text-secondary hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`} data-html2canvas-ignore>
                            <Trash2Icon className="h-3 w-3" />
                        </button>
                    )}
                </div>
            )}
        </div>

      {subMeal.dish ? (
        <div className="flex-1 flex items-start gap-1 overflow-hidden min-h-0">
            <div role="button" onClick={handleSelectClick} className={cardClasses} aria-disabled={isPrint}>
              {!isPrint && (
                 <button 
                    onClick={handleRemoveDishClick}
                    className={`absolute top-1 right-1 p-0.5 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity z-10 ${isDarkMode ? 'bg-dark-bg/80 text-dark-text-secondary hover:text-red-400' : 'bg-white/80 text-gray-400 hover:text-red-500'}`}
                    title="Remove Dish"
                    data-html2canvas-ignore
                 >
                     <MinusCircleIcon className="h-3 w-3" />
                 </button>
              )}
              <div className={cardContentClasses}>
                  <span className={dishNameClasses}>{subMeal.dish.name}</span>
                  {!isPrint && (
                    <div className="flex flex-wrap gap-0.5" data-html2canvas-ignore>
                        {dishCategories.map(cat => {
                            const colors = getCategoryColor(cat);
                            return (
                                <span 
                                    key={cat} 
                                    style={{ backgroundColor: colors.bg, color: colors.text }}
                                    className="text-[8px] md:text-[9px] font-bold px-1 rounded-full whitespace-nowrap flex-shrink-0"
                                >
                                    {t(cat)}
                                </span>
                            );
                        })}
                    </div>
                  )}
              </div>
              <p className={dishDescClasses}>
                  {subMeal.dish.description}
              </p>
            </div>
            {!isPrint && (
                <button onClick={handleViewClick} className={`self-center p-1 rounded-md transition flex-shrink-0 ${isDarkMode ? 'bg-dark-card/50 text-dark-text-secondary hover:bg-dark-card hover:text-brand-light' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-brand-primary'}`} aria-label="Ver receta" data-html2canvas-ignore>
                    <BookOpenIcon className="h-3.5 w-3.5"/>
                </button>
            )}
        </div>
      ) : (
        <button
          onClick={handleSelectClick}
          className={emptyClasses}
          disabled={isPrint}
        >
          <span className={isPrint ? 'text-[8px]' : 'text-[10px]'}>Empty</span>
        </button>
      )}
    </div>
  );
};

export default SubMealSlot;

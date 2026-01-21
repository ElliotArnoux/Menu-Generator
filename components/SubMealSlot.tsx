
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
}

const SubMealSlot: React.FC<SubMealSlotProps> = ({ 
    subMeal, dayIndex, mealIndex, subMealIndex, totalSubMeals, canRemove, 
    onSelectSlot, onViewRecipe, onRename, onRemove, onRemoveDish, onMoveSubMeal, t, isPrint = false 
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
        ? CATEGORY_BORDER_COLOR_MAP[mainCategory] || 'border-gray-700'
        : 'border-gray-700';

  const dishCategories = subMeal.dish?.categories || (subMeal.dish?.category ? [subMeal.dish.category] : []);

  // PRINT MODE STYLES
  const containerClasses = isPrint 
    ? `h-full flex flex-col pl-1 border-l-2 ${borderColorClass} overflow-hidden`
    : `min-h-[70px] lg:min-h-[80px] flex flex-col pl-2 border-l-2 md:border-l-4 ${borderColorClass} transition-colors overflow-hidden`;

  const titleClasses = isPrint
    ? "text-[8px] font-bold text-dark-text-secondary truncate leading-none mb-0.5"
    : "text-[10px] md:text-xs font-semibold text-dark-text-secondary group-hover:text-dark-text transition-colors truncate";

  const dishNameClasses = isPrint
    ? "font-bold text-brand-light text-[9px] truncate leading-tight w-full"
    : "font-semibold text-brand-light text-xs truncate max-w-full";

  const dishDescClasses = isPrint
    ? "hidden"
    : "text-[9px] md:text-[10px] text-dark-text-secondary leading-tight line-clamp-2 md:line-clamp-3 overflow-hidden text-ellipsis";

  const cardClasses = isPrint
    ? "flex-1 flex flex-col h-full bg-dark-card/50 p-1 rounded-sm text-left overflow-hidden justify-center"
    : "flex-1 flex flex-col min-h-[50px] bg-dark-card/50 p-1.5 md:p-2 rounded-md text-left transition hover:bg-dark-card overflow-hidden relative group/card";
  
  const cardContentClasses = isPrint
    ? "flex flex-col items-start gap-0.5 w-full"
    : "flex items-center gap-1 mb-0.5 flex-wrap w-full";

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
                    className="text-xs font-semibold text-dark-text bg-gray-700 rounded px-1 py-0.5 w-full"
                />
            ) : (
                <div className="flex items-center gap-1 group w-full">
                    <h5 className={titleClasses}>{subMeal.name}</h5>
                    {!isPrint && (
                        <div className="flex flex-col ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                             {subMealIndex > 0 && (
                                <button onClick={() => onMoveSubMeal(dayIndex, mealIndex, subMealIndex, 'up')} className="text-dark-text-secondary hover:text-brand-light p-0.5 leading-none">
                                    <ChevronUpIcon className="h-2 w-2" />
                                </button>
                             )}
                             {subMealIndex < totalSubMeals - 1 && (
                                <button onClick={() => onMoveSubMeal(dayIndex, mealIndex, subMealIndex, 'down')} className="text-dark-text-secondary hover:text-brand-light p-0.5 leading-none">
                                    <ChevronDownIcon className="h-2 w-2" />
                                </button>
                             )}
                        </div>
                    )}

                    {!isPrint && (
                        <button onClick={() => setIsRenaming(true)} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1">
                            <EditIcon className="h-3 w-3 text-dark-text-secondary hover:text-brand-light" />
                        </button>
                    )}
                    {!isPrint && canRemove && (
                         <button onClick={() => onRemove(dayIndex, mealIndex, subMeal.id)} className="ml-auto opacity-0 group-hover:opacity-100 text-dark-text-secondary hover:text-red-400 flex-shrink-0">
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
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-dark-bg/80 text-dark-text-secondary hover:text-red-400 opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                    title="Remove Dish"
                 >
                     <MinusCircleIcon className="h-3 w-3" />
                 </button>
              )}
              <div className={cardContentClasses}>
                  <span className={dishNameClasses}>{subMeal.dish.name}</span>
                  {!isPrint && (
                    <div className="flex flex-wrap gap-0.5">
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
                <button onClick={handleViewClick} className="self-center p-1 rounded-md bg-dark-card/50 text-dark-text-secondary transition hover:bg-dark-card hover:text-brand-light flex-shrink-0" aria-label="Ver receta">
                    <BookOpenIcon className="h-3.5 w-3.5"/>
                </button>
            )}
        </div>
      ) : (
        <button
          onClick={handleSelectClick}
          className={`flex-1 w-full flex items-center justify-center gap-1 text-center border border-dashed border-dark-border rounded-md text-dark-text-secondary ${isPrint ? 'p-0.5 min-h-[15px]' : 'p-1 hover:bg-dark-card hover:border-brand-primary hover:text-brand-light transition-colors min-h-[30px]'}`}
          disabled={isPrint}
        >
          <span className={isPrint ? 'text-[8px]' : 'text-[10px]'}>Empty</span>
        </button>
      )}
    </div>
  );
};

export default SubMealSlot;

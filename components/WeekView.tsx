
import React from 'react';
import { Day, Dish } from '../types';
import DayCard from './DayCard';
import { BookmarkIcon } from './icons';

interface WeekViewProps {
  weekMenu: Day[];
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
  weekNotes: string;
  setWeekNotes: (notes: string) => void;
  appliedRuleNames: string[];
  t: (key: string) => string;
  isPrint?: boolean;
}

const WeekView: React.FC<WeekViewProps> = ({ 
    weekMenu, onSelectSlot, onViewRecipe, 
    onAddSubMeal, onRenameSubMeal, onRemoveSubMeal, onRemoveDish, onRemoveMeal, onAddMeal,
    onMoveMeal, onMoveSubMeal,
    weekNotes, setWeekNotes, appliedRuleNames, t, isPrint = false
}) => {
  return (
    <div id="week-view-container" className={`w-full flex flex-col gap-4 ${isPrint ? 'week-view-print' : 'lg:h-[calc(100vh-5rem)] min-h-[calc(100vh-100px)]'}`}>
      {/* 
        Fixed Layout Strategy for A4 Landscape coherence on Desktop:
        - Grid: 5 columns.
        - Rows: grid-rows-2 makes both rows equal height (50% 50%)
        - Mobile: Auto height, flow layout
      */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${isPrint ? 'h-full grid-rows-[55%_42%]' : 'lg:h-full lg:grid-rows-2 auto-rows-auto'}`}>
          {/* Monday to Friday (Indices 0-4) */}
          {weekMenu.slice(0, 5).map((day, dayIndex) => (
            <div key={day.name} className={`col-span-1 ${isPrint ? 'h-full overflow-hidden' : 'lg:h-full'}`}>
                <DayCard
                    day={day}
                    dayIndex={dayIndex}
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
                    t={t}
                    isPrint={isPrint}
                />
            </div>
          ))}

          {/* Saturday (Index 5) */}
          {weekMenu.length > 5 && (
              <div className={`col-span-1 ${isPrint ? 'h-full overflow-hidden' : 'lg:h-full'}`}>
                  <DayCard
                    day={weekMenu[5]}
                    dayIndex={5}
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
                    t={t}
                    isPrint={isPrint}
                />
              </div>
          )}
          
          {/* Sunday (Index 6) */}
          {weekMenu.length > 6 && (
              <div className={`col-span-1 ${isPrint ? 'h-full overflow-hidden' : 'lg:h-full'}`}>
                  <DayCard
                    day={weekMenu[6]}
                    dayIndex={6}
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
                    t={t}
                    isPrint={isPrint}
                />
              </div>
          )}

          {/* Info Box Container (Spans 3 columns) */}
          <div className={`col-span-1 md:col-span-1 lg:col-span-3 flex flex-col bg-dark-card rounded-xl shadow-lg border border-dark-border ${isPrint ? 'h-full overflow-hidden' : 'lg:h-full min-h-[300px]'}`}>
            <div className={`bg-gray-800 border-b border-dark-border flex items-center gap-2 flex-shrink-0 ${isPrint ? 'p-1.5' : 'p-2 md:p-3'}`}>
                <BookmarkIcon className={`${isPrint ? 'h-4 w-4' : 'h-5 w-5'} text-brand-primary`} />
                <h3 className={`text-dark-text font-bold ${isPrint ? 'text-sm' : 'text-lg'}`}>{t('week_info')}</h3>
            </div>
            <div className={`flex flex-col md:flex-row gap-6 h-full ${isPrint ? 'p-2 overflow-hidden' : 'p-4'}`}>
                <div className="flex-1 space-y-1 flex flex-col h-full">
                    <h4 className={`font-bold text-dark-text-secondary uppercase tracking-wide flex-shrink-0 ${isPrint ? 'text-[10px]' : 'text-sm'}`}>{t('notes')}</h4>
                    <textarea
                        value={weekNotes}
                        onChange={(e) => setWeekNotes(e.target.value)}
                        placeholder={t('week_notes_placeholder')}
                        className={`w-full h-full bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:ring-brand-primary focus:border-brand-primary resize-none placeholder-gray-600 ${isPrint ? 'p-2 text-xs' : 'p-3 text-sm md:text-base'}`}
                    />
                </div>
                {appliedRuleNames.length > 0 && (
                    <div className={`md:w-1/3 bg-gray-900/50 rounded-lg border border-dark-border/50 flex-shrink-0 overflow-y-auto max-h-full ${isPrint ? 'p-2' : 'p-4'}`}>
                        <h4 className={`font-bold text-dark-text-secondary uppercase tracking-wide mb-2 ${isPrint ? 'text-[10px]' : 'text-sm'}`}>{t('applied_rules')}</h4>
                        <ul className="space-y-1">
                            {appliedRuleNames.map((ruleName, idx) => (
                                <li key={idx} className={`flex items-start gap-2 text-brand-light ${isPrint ? 'text-[9px]' : 'text-xs md:text-sm'}`}>
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0"></span>
                                    <span>{ruleName}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
          </div>
      </div>
    </div>
  );
};

export default WeekView;


import React, { useState } from 'react';
import { Day, Dish } from '../types';
import DayCard from './DayCard';
import { BookmarkIcon, PlusIcon, XIcon, FolderIcon } from './icons';
import { DAYS_OF_WEEK_KEYS } from '../constants';

interface WeekViewProps {
  weekMenu: (Day & { originalIndex: number })[];
  hiddenDayKeys: Set<string>;
  onToggleDayVisibility: (dayKey: string) => void;
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
  isDarkMode: boolean;
  activeWeekName: string;
}

const WeekView: React.FC<WeekViewProps> = ({ 
    weekMenu, hiddenDayKeys, onToggleDayVisibility, onSelectSlot, onViewRecipe, 
    onAddSubMeal, onRenameSubMeal, onRemoveSubMeal, onRemoveDish, onRemoveMeal, onAddMeal,
    onMoveMeal, onMoveSubMeal,
    weekNotes, setWeekNotes, appliedRuleNames, t, isPrint = false, isDarkMode, activeWeekName
}) => {
  const [showRestoreMenu, setShowRestoreMenu] = useState(false);

  const visibleDays = weekMenu.filter(day => !hiddenDayKeys.has(DAYS_OF_WEEK_KEYS[day.originalIndex]));
  const hiddenKeys = Array.from(hiddenDayKeys);

  return (
    <div id="week-view-container" className={`w-full flex flex-col min-h-[calc(100vh-80px)] ${isPrint ? 'week-view-print' : ''}`}>
      
      {/* Horizontal Days Row - Scrollable on mobile, Grid on desktop */}
      <div className="flex-grow overflow-x-auto w-full px-2 py-4 scrollbar-thin">
          <div className="flex gap-4 min-w-max h-full md:grid md:grid-cols-7 lg:grid-cols-7 xl:grid-cols-7 md:min-w-0">
              {visibleDays.map((day) => (
                <div key={day.name} className="w-[300px] md:w-auto h-full flex flex-col">
                    <DayCard
                        day={day}
                        dayIndex={day.originalIndex}
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
                        isDarkMode={isDarkMode}
                        onDeleteDay={() => onToggleDayVisibility(DAYS_OF_WEEK_KEYS[day.originalIndex])}
                    />
                </div>
              ))}
              
              {/* Restoration Slot if any hidden */}
              {!isPrint && hiddenKeys.length > 0 && (
                  <div className="w-[80px] md:w-auto h-full flex items-start justify-center pt-10" data-html2canvas-ignore>
                       <div className="relative">
                            <button 
                                onClick={() => setShowRestoreMenu(!showRestoreMenu)}
                                className={`p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center gap-2 ${isDarkMode ? 'border-dark-border text-dark-text-secondary hover:border-brand-primary hover:text-brand-light bg-dark-card/30' : 'border-gray-200 text-gray-400 hover:border-brand-primary hover:text-brand-primary bg-gray-50'}`}
                                title="Restaurar días"
                            >
                                <PlusIcon className="h-6 w-6" />
                            </button>
                            
                            {showRestoreMenu && (
                                <div className={`absolute bottom-full left-0 mb-2 w-48 rounded-lg shadow-xl border z-30 animate-fade-in ${isDarkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'}`}>
                                    <div className="p-2 border-b border-inherit flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase text-brand-light">Restaurar día</span>
                                        <button onClick={() => setShowRestoreMenu(false)}><XIcon className="h-4 w-4" /></button>
                                    </div>
                                    <div className="p-1 max-h-48 overflow-y-auto">
                                        {hiddenKeys.map(key => (
                                            <button 
                                                key={key} 
                                                onClick={() => { onToggleDayVisibility(key); setShowRestoreMenu(false); }}
                                                className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-brand-primary hover:text-white transition-colors capitalize ${isDarkMode ? 'text-dark-text' : 'text-gray-900'}`}
                                            >
                                                {t(key)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                       </div>
                  </div>
              )}
          </div>
      </div>

      {/* Very Reduced Height Info Section at Bottom - Full Width */}
      <div className={`w-full flex-shrink-0 border-t sticky bottom-0 z-10 ${isDarkMode ? 'bg-dark-bg/95 border-dark-border' : 'bg-white/95 border-gray-200 shadow-lg'}`}>
          <div className="max-w-full flex flex-col md:flex-row h-auto md:h-16 divide-y md:divide-y-0 md:divide-x divide-inherit">
              
              {/* Menu Name & Notes Container */}
              <div className="flex-1 flex flex-col min-h-[40px]">
                  <div className="flex items-center justify-between px-3 py-0.5 bg-inherit border-b border-inherit/20">
                      <div className="flex items-center gap-2">
                        <BookmarkIcon className="h-3 w-3 text-brand-primary" />
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{t('notes')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 bg-brand-primary/10 rounded-full">
                         <FolderIcon className="h-2.5 w-2.5 text-brand-light" />
                         <span className="text-[8px] font-bold uppercase tracking-tighter text-brand-light">{activeWeekName}</span>
                      </div>
                  </div>
                  <textarea
                      value={weekNotes}
                      onChange={(e) => setWeekNotes(e.target.value)}
                      placeholder={t('week_notes_placeholder')}
                      className={`w-full h-full px-4 py-0 text-xs md:text-sm outline-none resize-none bg-transparent overflow-y-auto ${isDarkMode ? 'text-dark-text' : 'text-gray-900'}`}
                  />
              </div>

              {/* Rules Container */}
              <div className="w-full md:w-1/4 flex flex-col min-h-[40px]" data-html2canvas-ignore>
                  <div className="flex items-center gap-2 px-3 py-0.5 bg-inherit border-b border-inherit/20">
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{t('applied_rules')}</span>
                  </div>
                  <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 py-1 scrollbar-hide">
                      <div className="flex flex-wrap gap-1 h-full content-start">
                          {appliedRuleNames.length > 0 ? (
                              appliedRuleNames.map((ruleName, idx) => (
                                  <span key={idx} className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-bold transition-all whitespace-nowrap ${isDarkMode ? 'bg-brand-primary/10 text-brand-light' : 'bg-brand-primary/10 text-brand-secondary border border-brand-primary/20'}`}>
                                      {ruleName}
                                  </span>
                              ))
                          ) : (
                              <p className="text-[9px] italic opacity-40">No rules</p>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      </div>
      
      <style>{`
        .scrollbar-thin::-webkit-scrollbar { height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default WeekView;

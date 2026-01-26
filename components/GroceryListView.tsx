
import React, { useMemo } from 'react';
import { Day } from '../types';
import { XIcon, ShoppingCartIcon, PrinterIcon } from './icons';
import { compileGroceryItems, consolidateGroceryItems } from '../groceryUtils';

interface GroceryItem {
    id: string;
    text: string;
    store: string;
    count: number;
    days: string[];
}

interface GroceryListViewProps {
  isOpen: boolean;
  onClose: () => void;
  weekMenu: Day[];
  ingredientStoreMap: Record<string, string>;
  onPrint: () => void;
  t: (key: string) => string;
  checkedItems: Record<string, boolean>;
  onToggleItem: (id: string) => void;
  isDarkMode: boolean;
}

const GroceryListView: React.FC<GroceryListViewProps> = ({ 
    isOpen, onClose, weekMenu, ingredientStoreMap, onPrint, t, checkedItems, onToggleItem, isDarkMode
}) => {
  // Calculate raw items needed using utility
  const compiledItems = useMemo(() => {
    return compileGroceryItems(weekMenu, ingredientStoreMap);
  }, [weekMenu, ingredientStoreMap]);

  const groceryList = useMemo(() => {
    // Consolidate duplicates using utility
    const consolidated = consolidateGroceryItems(compiledItems);
    
    // Map to GroceryItem
    return consolidated.map(item => ({
        id: `${item.text}::${item.store}`,
        text: item.text,
        store: item.store,
        count: item.count,
        days: item.days
    })).sort((a, b) => {
        if (a.store === b.store) {
            return a.text.localeCompare(b.text);
        }
        return a.store.localeCompare(b.store);
    });
  }, [compiledItems]);

  // Group items for render
  const groupedItems = useMemo(() => {
      const groups: Record<string, GroceryItem[]> = {};
      groceryList.forEach(item => {
          if (!groups[item.store]) groups[item.store] = [];
          groups[item.store].push(item);
      });
      // Sort keys: Uncategorized last
      const keys = Object.keys(groups).sort((a, b) => {
          if (a === 'Uncategorized') return 1;
          if (b === 'Uncategorized') return -1;
          return a.localeCompare(b);
      });
      return keys.map(key => ({ store: key, items: groups[key] }));
  }, [groceryList]);

  if (!isOpen) return null;
  
  const checkedCount = groceryList.filter(item => checkedItems[item.id]).length;
  const totalCount = groceryList.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50 p-0 sm:items-center sm:p-4">
      <div className="bg-dark-bg w-full max-w-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col transform transition-transform duration-300 ease-in-out translate-y-full sm:translate-y-0 animate-slide-up">
        <header className="flex items-center justify-between p-4 border-b border-dark-border sticky top-0 bg-dark-bg rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <ShoppingCartIcon className="h-6 w-6 text-brand-light" />
            <div>
                <h2 className="text-xl font-bold text-dark-text">{t('grocery_list')}</h2>
                <p className="text-sm text-dark-text-secondary">{`${checkedCount} / ${totalCount}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onPrint} className="p-2 rounded-full hover:bg-dark-card transition-colors text-dark-text-secondary hover:text-white" title={t('print')}>
                <PrinterIcon className="h-6 w-6" />
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-dark-card transition-colors">
                <XIcon className="h-6 w-6 text-dark-text-secondary" />
            </button>
          </div>
        </header>

        <div className="overflow-y-auto flex-grow p-4">
          {groceryList.length > 0 ? (
            <div className="space-y-6">
              {groupedItems.map((group) => (
                  <div key={group.store}>
                      <h3 className="text-brand-light font-bold text-sm uppercase tracking-wide mb-2 px-1">
                          {group.store === 'Uncategorized' ? t('uncategorized') : group.store}
                      </h3>
                      <div className="space-y-2">
                        {group.items.map((item) => {
                            const isChecked = !!checkedItems[item.id];
                            return (
                                <label 
                                key={item.id} 
                                className="flex items-center p-3 bg-dark-card rounded-md cursor-pointer hover:bg-gray-700 transition-colors group"
                                >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => onToggleItem(item.id)}
                                    className="h-5 w-5 rounded bg-gray-800 border-dark-border text-brand-primary focus:ring-brand-primary focus:ring-2"
                                />
                                <div className={`ml-3 flex-grow ${isChecked ? 'opacity-50' : ''}`}>
                                    <span className={`text-dark-text ${isChecked ? 'line-through' : ''}`}>
                                        {item.text}
                                        {item.count > 0 && item.count !== 1 && (
                                            <span className="ml-1 text-brand-light font-bold">({item.count})</span>
                                        )}
                                    </span>
                                </div>
                                </label>
                            );
                        })}
                      </div>
                  </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCartIcon className="h-12 w-12 text-dark-border mb-4" />
                <h3 className="font-semibold text-dark-text">{t('empty_list')}</h3>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default GroceryListView;

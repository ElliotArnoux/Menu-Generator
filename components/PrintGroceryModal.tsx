
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { XIcon, PrinterIcon } from './icons';
import { Day } from '../types';
import html2canvas from 'html2canvas';
import { compileGroceryItems, consolidateGroceryItems } from '../groceryUtils';

interface PrintGroceryModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekMenu: Day[];
  t: (key: string) => string;
  ingredientStoreMap: Record<string, string>;
  checkedItems: Record<string, boolean>;
  isDarkMode: boolean;
}

const PrintGroceryModal: React.FC<PrintGroceryModalProps> = ({ 
    isOpen, onClose, weekMenu, t, ingredientStoreMap, checkedItems, isDarkMode
}) => {
  const [imgData, setImgData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  // Generate Grocery List Items
  const groceryGroups = useMemo(() => {
    const compiled = compileGroceryItems(weekMenu, ingredientStoreMap);
    const consolidated = consolidateGroceryItems(compiled);
    
    // Filter out items that are checked in the main view
    const filtered = consolidated.filter(item => {
        const id = `${item.text}::${item.store}`;
        return !checkedItems[id];
    });

    // Grouping for Display
    const groups: Record<string, {text: string, count: number}[]> = {};
    filtered.forEach(item => {
        if (!groups[item.store]) groups[item.store] = [];
        groups[item.store].push(item);
    });
    
    const result: { store: string, items: {text: string, count: number}[] }[] = [];
    
    // Sort keys, ignoring uncategorized for now
    const sortedKeys = Object.keys(groups).filter(k => k !== 'Uncategorized').sort((a, b) => a.localeCompare(b));
    
    // Add regular groups
    // We break regular groups too if they are too large, to ensure they respect column breaks nicely
    const REGULAR_CHUNK_SIZE = 15; 

    sortedKeys.forEach(key => {
        const items = groups[key].sort((a,b) => a.text.localeCompare(b.text));
        
        // Chunk regular items if they are huge to prevent column overflow issues
        if (items.length > REGULAR_CHUNK_SIZE) {
             for (let i = 0; i < items.length; i += REGULAR_CHUNK_SIZE) {
                const chunk = items.slice(i, i + REGULAR_CHUNK_SIZE);
                const name = i === 0 ? key : `${key} (cont.)`;
                result.push({ store: name, items: chunk });
            }
        } else {
            result.push({ store: key, items });
        }
    });

    // Handle Uncategorized Logic: Split into groups of 10 as requested
    if (groups['Uncategorized'] && groups['Uncategorized'].length > 0) {
        const uncategorizedItems = groups['Uncategorized'].sort((a,b) => a.text.localeCompare(b.text));
        const chunkSize = 10;
        
        for (let i = 0; i < uncategorizedItems.length; i += chunkSize) {
            const chunk = uncategorizedItems.slice(i, i + chunkSize);
            // Use specific translation logic for Uncategorized
            const name = i === 0 ? 'Uncategorized' : 'Uncategorized (cont.)';
            result.push({ store: name, items: chunk });
        }
    }

    return result;
  }, [weekMenu, ingredientStoreMap, checkedItems]);

  useEffect(() => {
    if (isOpen) {
        setIsLoading(true);
        setTimeout(() => {
            if (captureRef.current) {
                // A4 Landscape dimensions: 1123px x 794px
                const width = 1123;
                const height = 794;

                html2canvas(captureRef.current, {
                    backgroundColor: '#ffffff', 
                    scale: 2, 
                    useCORS: true,
                    width: width,
                    // FORCE A4 height to prevent overflow and force column breaks
                    height: height, 
                    windowWidth: width + 50,
                    windowHeight: height + 50,
                    scrollY: 0
                }).then(canvas => {
                    setImgData(canvas.toDataURL('image/png'));
                    setIsLoading(false);
                }).catch(err => {
                    console.error("Screenshot failed", err);
                    setIsLoading(false);
                });
            } else {
                setIsLoading(false);
            }
        }, 800);
    } else {
        setImgData(null);
    }
  }, [isOpen]);

  const handlePrintClick = () => {
    if (imgData) {
        const width = 1150;
        const height = 800;
        
        const printWindow = window.open('', '', `width=${width},height=${height}`);
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${t('print_preview')}</title>
                        <style>
                            body { margin: 0; display: flex; justify-content: center; align-items: flex-start; background: #fff; }
                            img { width: 100%; max-width: 1123px; height: auto; }
                            @media print {
                                @page { size: landscape; margin: 0; }
                                body { margin: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        <img src="${imgData}" onload="window.print(); window.close();" />
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    }
  };

  const getStoreDisplayName = (storeKey: string) => {
      if (storeKey === 'Uncategorized') return t('uncategorized');
      if (storeKey === 'Uncategorized (cont.)') return `${t('uncategorized')} (cont.)`;
      return storeKey;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-bg w-full max-w-6xl h-[95vh] rounded-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-scale-up border border-dark-border">
        <header className="flex items-center justify-between p-4 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <PrinterIcon className="h-6 w-6 text-brand-light" />
            <h2 className="text-xl font-bold text-dark-text">{t('print_preview')} - {t('grocery_list')}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-dark-card transition-colors">
            <XIcon className="h-6 w-6 text-dark-text-secondary" />
          </button>
        </header>

        <div className="flex-grow overflow-auto p-4 bg-gray-900 flex justify-center items-start relative">
            {isLoading ? (
                <div className="flex flex-col items-center gap-4 mt-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                    <p className="text-dark-text-secondary">Generating preview...</p>
                </div>
            ) : imgData ? (
                <img src={imgData} alt="Preview" className="max-w-full shadow-2xl rounded-lg border border-dark-border" />
            ) : (
                <p className="text-red-400">Could not generate preview.</p>
            )}

            <div className="absolute top-0 left-0 overflow-hidden w-0 h-0 opacity-0 pointer-events-none">
                <div 
                    ref={captureRef} 
                    style={{ 
                        width: '1123px', 
                        height: '794px' // Strict 1-page height
                    }} 
                    className="bg-white text-black font-sans flex flex-col relative"
                >
                    {/* LANDSCAPE GROCERY LAYOUT */}
                    <div className="p-6 h-full flex flex-col bg-white box-border overflow-hidden">
                        <div className="flex justify-between items-center mb-4 border-b-2 border-gray-800 pb-2 flex-shrink-0">
                            <div>
                                <h1 className="text-2xl font-extrabold text-gray-900">{t('grocery_list')}</h1>
                                <p className="text-gray-500 text-xs mt-1">{t('app_title')}</p>
                            </div>
                        </div>
                        {/* 
                           Layout Logic:
                           - columns-3: Creates 3 columns.
                           - h-[660px]: Explicit fixed height is REQUIRED for column-fill: auto to work correctly and trigger wrapping.
                           - column-fill: auto: Fills column 1 completely, then breaks to column 2, etc.
                        */}
                        <div className="columns-3 gap-6 h-[660px]" style={{ columnFill: 'auto' }}>
                            {groceryGroups.map((group, idx) => (
                                <div 
                                    key={`${group.store}-${idx}`} 
                                    // break-inside-avoid prevents the group from being split across columns
                                    // If a group is too big for the remaining space, it moves to the next column.
                                    className="mb-4 break-inside-avoid bg-white"
                                >
                                    <h3 
                                        className="text-black font-bold text-xs uppercase tracking-wide mb-1 border-b border-black pb-0.5"
                                    >
                                        {getStoreDisplayName(group.store)}
                                    </h3>
                                    <ul className="text-[10px] text-black space-y-0.5">
                                        {group.items.map((item, idx) => (
                                            <li key={idx} className="flex gap-1.5 items-start">
                                                <span className="text-gray-400 mt-0.5">•</span>
                                                <span className="flex-grow font-medium leading-tight">{item.text}</span>
                                                {item.count > 1 && <span className="font-bold text-gray-800 bg-gray-200 px-1 rounded text-[8px] flex-shrink-0">x{item.count}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer className="p-4 border-t border-dark-border flex justify-end gap-4 bg-dark-bg rounded-b-2xl">
          <button
            onClick={onClose}
            className="bg-dark-card hover:bg-gray-700 text-dark-text-secondary font-bold py-3 px-6 rounded-md transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handlePrintClick}
            disabled={!imgData}
            className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <PrinterIcon className="h-5 w-5" />
            <span>{t('confirm_print')}</span>
          </button>
        </footer>
      </div>
       <style>{`
        @keyframes scale-up {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up { animation: scale-up 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PrintGroceryModal;

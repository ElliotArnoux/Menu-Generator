
import React, { useState, useEffect, useRef } from 'react';
import { XIcon, PrinterIcon } from './icons';
import { Day } from '../types';
import html2canvas from 'html2canvas';

interface PrintWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekMenu: Day[];
  t: (key: string) => string;
  weekNotes: string;
  appliedRuleNames: string[];
  isDarkMode: boolean;
}

const PrintWeekModal: React.FC<PrintWeekModalProps> = ({ 
    isOpen, onClose, weekMenu, t, weekNotes, isDarkMode
}) => {
  const [imgData, setImgData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        setIsLoading(true);
        // Delay slightly to ensure render
        setTimeout(() => {
            if (captureRef.current) {
                // A4 Portrait dimensions: 794px x 1100px (approx 96 DPI)
                const width = 794;
                const height = 1100;

                html2canvas(captureRef.current, {
                    backgroundColor: '#ffffff', 
                    scale: 2, 
                    useCORS: true,
                    width: width,
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
        const width = 794;
        const height = 1000;
        
        const printWindow = window.open('', '', `width=${width},height=${height}`);
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${t('print_preview')}</title>
                        <style>
                            body { margin: 0; display: flex; justify-content: center; align-items: flex-start; background: #fff; }
                            img { width: 100%; max-width: ${width}px; height: auto; }
                            @media print {
                                @page { size: portrait; margin: 0; }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-bg w-full max-w-4xl h-[95vh] rounded-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-scale-up border border-dark-border">
        <header className="flex items-center justify-between p-4 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <PrinterIcon className="h-6 w-6 text-brand-light" />
            <h2 className="text-xl font-bold text-dark-text">{t('print_preview')} - {t('generate_week')}</h2>
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

            {/* Hidden container for HTML2Canvas capture with fixed dimensions */}
            <div className="absolute top-0 left-0 overflow-hidden w-0 h-0 opacity-0 pointer-events-none">
                <div 
                    ref={captureRef} 
                    style={{ 
                        width: '794px', 
                        height: '1000px' 
                    }} 
                    className="bg-white text-black font-sans flex flex-col relative"
                >
                    {/* PORTRAIT WEEK LAYOUT */}
                    {/* Reduced padding from p-12 to p-8 to save space and avoid 2nd page issues */}
                    <div className="flex flex-col h-full p-8 box-border overflow-hidden">
                        {/* Header: Title + Notes - Fixed Height */}
                        <div className="flex justify-between items-start mb-2 border-b-2 border-gray-800 pb-2 flex-shrink-0 h-[80px]">
                            <div className="w-1/3">
                                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{t('app_title')}</h1>
                                <p className="text-gray-500 text-xs">{t('app_subtitle')}</p>
                            </div>
                            <div className="w-2/3 pl-4 border-l border-gray-300 h-full overflow-hidden">
                                <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">
                                    📝 {t('notes')}
                                </p>
                                <p className="text-xs text-gray-800 leading-tight whitespace-pre-wrap">
                                    {weekNotes || "..."}
                                </p>
                            </div>
                        </div>

                        {/* Main Content: All 7 Days */}
                        {/* min-h-0 ensures it shrinks to fit the container without overflowing */}
                        <div className="flex-grow flex flex-col justify-start min-h-0">
                            {weekMenu.map((day) => (
                                <div key={day.name} className="border-b border-gray-300 py-0.5 flex-1 flex flex-col min-h-0">
                                    {/* Day Header - Reduced Height */}
                                    <div className="w-full bg-gray-100 mb-0.5 rounded-sm flex items-center justify-center h-5 flex-shrink-0">
                                        <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-wide text-center m-0 leading-none">
                                            {day.name}
                                        </h3>
                                    </div>
                                    <div 
                                        className="grid gap-2 flex-1 items-start mt-0 min-h-0"
                                        style={{ gridTemplateColumns: `repeat(${Math.max(1, day.meals.length)}, minmax(0, 1fr))` }}
                                    >
                                        {day.meals.map((meal) => (
                                            <div key={meal.name} className="flex flex-col h-full bg-white min-h-0 overflow-hidden">
                                                <span className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 border-b border-gray-100 pb-0.5 flex-shrink-0">{meal.name}</span>
                                                <div className="flex-1 flex flex-col gap-0 overflow-hidden">
                                                    {meal.subMeals.map(sub => (
                                                        <div key={sub.id} className="mb-0.5 last:mb-0 flex-shrink-0">
                                                            <p className="text-[8px] font-bold text-gray-400 uppercase leading-none mb-0.5">{sub.name}</p>
                                                            {sub.dish ? (
                                                                <div>
                                                                    <p className="text-[11px] font-bold text-black leading-tight break-words mb-0.5">{sub.dish.name}</p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-[8px] text-gray-300 italic">-</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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

export default PrintWeekModal;

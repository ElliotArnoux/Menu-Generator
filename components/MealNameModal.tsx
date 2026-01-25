
import React, { useState } from 'react';
import { XIcon, PlusIcon } from './icons';

interface MealNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  suggestions: string[];
  t: (key: string) => string;
  isDarkMode: boolean;
}

const MealNameModal: React.FC<MealNameModalProps> = ({ isOpen, onClose, onConfirm, suggestions, t, isDarkMode }) => {
  const [customName, setCustomName] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-bg w-full max-w-sm rounded-2xl flex flex-col border border-dark-border animate-scale-up overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-dark-border bg-dark-bg">
          <h2 className="text-xl font-bold text-dark-text">{t('add')} Meal</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-dark-card transition-colors">
            <XIcon className="h-6 w-6 text-dark-text-secondary" />
          </button>
        </header>
        <div className="p-6 space-y-3 bg-dark-bg">
             <p className="text-dark-text-secondary text-sm mb-2">Select a meal type to add:</p>
             <div className="flex flex-col gap-2">
                 {suggestions.map(s => (
                     <button 
                        key={s} 
                        onClick={() => onConfirm(s)}
                        className="p-3 bg-dark-card border border-dark-border rounded-lg text-dark-text font-semibold hover:bg-brand-primary hover:text-white transition-all text-left flex items-center justify-between group"
                     >
                        <span>{s}</span>
                        <PlusIcon className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                     </button>
                 ))}
                 
                 {!showCustom ? (
                     <button 
                        onClick={() => setShowCustom(true)}
                        className="p-3 border border-dashed border-dark-border rounded-lg text-dark-text-secondary font-semibold hover:border-brand-primary hover:text-brand-light transition-all text-left"
                     >
                        + Custom Meal Name
                     </button>
                 ) : (
                     <div className="animate-fade-in space-y-2 pt-2 border-t border-dark-border mt-2">
                        <input 
                            autoFocus
                            type="text" 
                            value={customName}
                            onChange={e => setCustomName(e.target.value)}
                            placeholder="Custom meal name..."
                            className="w-full bg-dark-card border border-dark-border rounded-md px-3 py-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary"
                        />
                        <button 
                            onClick={() => { if(customName.trim()) onConfirm(customName.trim()); }}
                            disabled={!customName.trim()}
                            className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 rounded-md transition-colors disabled:opacity-50"
                        >
                            Add
                        </button>
                     </div>
                 )}
             </div>
        </div>
      </div>
      <style>{`
        @keyframes scale-up { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-up { animation: scale-up 0.2s ease-out forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default MealNameModal;

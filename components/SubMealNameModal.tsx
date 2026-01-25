
import React, { useState } from 'react';
import { XIcon } from './icons';

interface SubMealNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  history: string[];
  t: (key: string) => string;
  isDarkMode: boolean;
}

const SubMealNameModal: React.FC<SubMealNameModalProps> = ({ isOpen, onClose, onConfirm, history, t, isDarkMode }) => {
  const [name, setName] = useState('');

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim());
      setName('');
    }
  };
  
  const handleHistoryClick = (histName: string) => {
    setName(histName);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-bg w-full max-w-md rounded-2xl flex flex-col transform transition-transform duration-300 ease-in-out scale-95 animate-scale-up">
        <header className="flex items-center justify-between p-4 border-b border-dark-border">
          <h2 className="text-xl font-bold text-dark-text">{t('add_section_title')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-dark-card transition-colors">
            <XIcon className="h-6 w-6 text-dark-text-secondary" />
          </button>
        </header>

        <div className="p-6 space-y-4">
          <p className="text-dark-text-secondary">
            {t('section_name_prompt')}
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('section_name_placeholder')}
            className="w-full bg-dark-card border border-dark-border rounded-md px-3 py-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary placeholder-gray-500"
          />
          {history.length > 0 && (
            <div>
              <p className="text-xs text-dark-text-secondary mb-2">{t('suggestions')}:</p>
              <div className="flex flex-wrap gap-2">
                {history.map(hist => (
                  <button key={hist} onClick={() => handleHistoryClick(hist)} className="px-3 py-1 bg-gray-700 text-sm text-dark-text-secondary rounded-full hover:bg-brand-primary hover:text-white transition-colors">
                    {hist}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="p-4 border-t border-dark-border flex gap-4">
          <button
            onClick={onClose}
            className="flex-grow bg-dark-card hover:bg-gray-700 text-dark-text-secondary font-bold py-3 px-4 rounded-md transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!name.trim()}
            className="flex-grow bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('add')}
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

export default SubMealNameModal;

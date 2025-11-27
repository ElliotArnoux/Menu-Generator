
import React from 'react';
import { AppLanguage, SavedWeek } from '../types';
import { 
  FolderIcon, GlobeIcon, CalendarIcon, UtensilsIcon, ClipboardListIcon, 
  ShoppingCartIcon, Wand2Icon, PrinterIcon 
} from './icons';

interface HeaderProps {
  t: (key: string) => string;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  savedWeeks: SavedWeek[];
  handleWeekSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  setIsSavedWeeksModalOpen: (isOpen: boolean) => void;
  setIsGroceryListOpen: (isOpen: boolean) => void;
  setIsGenerateModalOpen: (isOpen: boolean) => void;
  handlePrintClick: (mode: 'week' | 'grocery') => void;
  currentView: 'planner' | 'recipes' | 'rules';
  setCurrentView: (view: 'planner' | 'recipes' | 'rules') => void;
}

const Header: React.FC<HeaderProps> = ({
  t, language, setLanguage, savedWeeks, handleWeekSelectChange,
  setIsSavedWeeksModalOpen, setIsGroceryListOpen, setIsGenerateModalOpen, handlePrintClick,
  currentView, setCurrentView
}) => {
  
  const NavButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
  }> = ({ isActive, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center p-3 rounded-full transition-colors font-semibold ${
        isActive ? 'bg-brand-primary text-white' : 'bg-dark-card text-dark-text-secondary hover:bg-gray-700'
        }`}
    >
        {icon}
    </button>
  );

  return (
    <header className="sticky top-0 bg-dark-bg/90 backdrop-blur-sm z-20 px-4 py-4 border-b border-dark-border">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-extrabold text-dark-text">
                {t('app_title')}
            </h1>
            <p className="text-dark-text-secondary text-xs md:text-sm">
                {t('app_subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
             {/* Saved Weeks Dropdown */}
             <div className="flex items-center bg-dark-card rounded-md border border-dark-border px-2">
                <FolderIcon className="h-4 w-4 text-dark-text-secondary" />
                <select 
                    onChange={handleWeekSelectChange}
                    className="bg-dark-card text-sm text-dark-text py-1 px-2 outline-none cursor-pointer max-w-[120px] md:max-w-none [&>option]:bg-dark-card [&>option]:text-dark-text"
                    defaultValue=""
                >
                    <option value="" disabled>{t('load')}...</option>
                    {/* Force Default New Menu to top if present */}
                    {savedWeeks.filter(w => w.id === 'default-new-menu').map(week => (
                        <option key={week.id} value={week.id}>{week.name}</option>
                    ))}
                    {/* Other saved weeks */}
                    {savedWeeks.filter(w => w.id !== 'default-new-menu').map(week => (
                        <option key={week.id} value={week.id}>{week.name}</option>
                    ))}
                </select>
             </div>

             {/* Language Selector */}
             <div className="flex items-center bg-dark-card rounded-md border border-dark-border px-2">
                <GlobeIcon className="h-4 w-4 text-dark-text-secondary" />
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as AppLanguage)}
                    className="bg-dark-card text-sm text-dark-text py-1 px-2 outline-none cursor-pointer [&>option]:bg-dark-card [&>option]:text-dark-text"
                >
                    <option value="es">ES</option>
                    <option value="en">EN</option>
                    <option value="fr">FR</option>
                </select>
             </div>

             <nav className="flex justify-center gap-2 bg-dark-card/50 p-1 rounded-full">
                <NavButton
                    isActive={currentView === 'planner'}
                    onClick={() => setCurrentView('planner')}
                    icon={<CalendarIcon className="h-5 w-5" />}
                />
                <NavButton
                    isActive={currentView === 'recipes'}
                    onClick={() => setCurrentView('recipes')}
                    icon={<UtensilsIcon className="h-5 w-5" />}
                />
                <NavButton
                    isActive={currentView === 'rules'}
                    onClick={() => setCurrentView('rules')}
                    icon={<ClipboardListIcon className="h-5 w-5" />}
                />
             </nav>

             <div className="flex flex-wrap justify-center gap-2">
                <button
                    onClick={() => setIsSavedWeeksModalOpen(true)}
                    className="p-3 rounded-full transition-colors bg-dark-card text-dark-text-secondary hover:bg-gray-700 hover:text-white"
                    title={t('manage_weeks')}
                >
                    <FolderIcon className="h-5 w-5" />
                </button>
                <button
                    onClick={() => setIsGroceryListOpen(true)}
                    className="p-3 rounded-full transition-colors bg-dark-card text-dark-text-secondary hover:bg-gray-700 hover:text-white"
                    title={t('grocery_list')}
                >
                    <ShoppingCartIcon className="h-5 w-5" />
                </button>
                <button
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="flex items-center justify-center p-3 rounded-full transition-colors font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                    title={t('generate_week')}
                >
                    <Wand2Icon className="h-5 w-5" />
                </button>
                <button
                    onClick={() => handlePrintClick('week')}
                    className="p-3 rounded-full transition-colors bg-dark-card text-dark-text-secondary hover:bg-gray-700 hover:text-white"
                    title={t('print')}
                >
                    <PrinterIcon className="h-5 w-5" />
                </button>
             </div>
          </div>
      </div>
    </header>
  );
};

export default Header;

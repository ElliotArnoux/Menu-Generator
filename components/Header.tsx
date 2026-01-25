
import React from 'react';
import { AppLanguage } from '../types';
import { 
  GlobeIcon, CalendarIcon, UtensilsIcon, ClipboardListIcon, 
  ShoppingCartIcon, Wand2Icon, PrinterIcon, SaveFloppyIcon, SunIcon, MoonIcon, FolderIcon, CameraIcon
} from './icons';

interface HeaderProps {
  t: (key: string) => string;
  language: AppLanguage;
  toggleLanguage: () => void;
  activeWeekId: string | null;
  handleQuickSave: () => void;
  setIsSavedWeeksModalOpen: (isOpen: boolean) => void;
  setIsGroceryListOpen: (isOpen: boolean) => void;
  setIsGenerateModalOpen: (isOpen: boolean) => void;
  handlePrintClick: (mode: 'week' | 'grocery') => void;
  handleScreenshot: () => void;
  currentView: 'planner' | 'recipes' | 'rules';
  setCurrentView: (view: 'planner' | 'recipes' | 'rules') => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({
  t, language, toggleLanguage, activeWeekId, handleQuickSave, 
  setIsSavedWeeksModalOpen, setIsGroceryListOpen, setIsGenerateModalOpen, handlePrintClick,
  handleScreenshot, currentView, setCurrentView, isDarkMode, toggleTheme
}) => {
  
  const NavButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
  }> = ({ isActive, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center p-3 rounded-full transition-all duration-200 font-semibold ${
        isActive ? 'bg-brand-primary text-white scale-110 shadow-lg' : (isDarkMode ? 'bg-dark-card text-dark-text-secondary hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
        }`}
    >
        {icon}
    </button>
  );

  return (
    <header className={`sticky top-0 backdrop-blur-sm z-20 px-4 py-4 border-b ${isDarkMode ? 'bg-dark-bg/90 border-dark-border' : 'bg-white/90 border-gray-200'}`}>
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className={`text-2xl md:text-3xl font-extrabold ${isDarkMode ? 'text-dark-text' : 'text-gray-900'}`}>
                {t('app_title')}
            </h1>
            <p className={`text-xs md:text-sm ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'}`}>
                {t('app_subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
             <button 
                onClick={toggleLanguage}
                className={`flex items-center gap-1 rounded-md border px-3 py-2 text-sm font-bold transition-colors ${isDarkMode ? 'bg-dark-card border-dark-border text-dark-text hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-100'}`}
                title="Cambiar idioma"
             >
                <GlobeIcon className="h-4 w-4" />
                <span>{language.toUpperCase()}</span>
             </button>

             <nav className={`flex justify-center gap-2 p-1 rounded-full ${isDarkMode ? 'bg-dark-card/50' : 'bg-gray-100'}`}>
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
                    onClick={toggleTheme}
                    className={`p-3 rounded-full transition-colors ${isDarkMode ? 'bg-dark-card text-yellow-400 hover:bg-gray-700' : 'bg-white text-indigo-600 border border-gray-200 hover:bg-gray-100'}`}
                    title="Tema"
                >
                    {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                </button>
                <button
                    onClick={handleQuickSave}
                    className={`p-3 rounded-full transition-all relative ${isDarkMode ? 'bg-dark-card text-brand-light border border-brand-primary/30 hover:bg-gray-700' : 'bg-white text-brand-secondary border border-brand-primary/30 hover:bg-brand-50'}`}
                    title={t('save')}
                >
                    <SaveFloppyIcon className="h-5 w-5" />
                    {activeWeekId && <div className="absolute top-2 right-2 w-2 h-2 bg-brand-primary rounded-full border border-white"></div>}
                </button>
                <button
                    onClick={() => setIsSavedWeeksModalOpen(true)}
                    className={`p-3 rounded-full transition-colors ${isDarkMode ? 'bg-dark-card text-dark-text-secondary hover:bg-gray-700' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                    title={t('manage_weeks')}
                >
                    <FolderIcon className="h-5 w-5" />
                </button>
                <button
                    onClick={() => setIsGroceryListOpen(true)}
                    className={`p-3 rounded-full transition-colors ${isDarkMode ? 'bg-dark-card text-dark-text-secondary hover:bg-gray-700' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                    title={t('grocery_list')}
                >
                    <ShoppingCartIcon className="h-5 w-5" />
                </button>
                <button
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="flex items-center justify-center p-3 rounded-full transition-all duration-200 font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg hover:scale-105"
                    title={t('generate_week')}
                >
                    <Wand2Icon className="h-5 w-5" />
                </button>
                <button
                    onClick={handleScreenshot}
                    className={`p-3 rounded-full transition-colors ${isDarkMode ? 'bg-dark-card text-dark-text-secondary hover:bg-gray-700' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                    title="Tomar captura"
                >
                    <CameraIcon className="h-5 w-5" />
                </button>
                <button
                    onClick={() => handlePrintClick('week')}
                    className={`p-3 rounded-full transition-colors ${isDarkMode ? 'bg-dark-card text-dark-text-secondary hover:bg-gray-700' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
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


import React, { useState, useRef, useMemo } from 'react';
import { SavedWeek } from '../types';
import { XIcon, SaveFloppyIcon, Trash2Icon, DownloadIcon, UploadIcon, RefreshCwIcon } from './icons';
import { downloadJson, readJsonFile } from '../fileUtils';

interface SavedWeeksModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedWeeks: SavedWeek[];
  activeWeekId: string | null;
  onSave: (name: string) => void;
  onLoad: (week: SavedWeek) => void;
  onOverwrite: (id: string) => void;
  onDelete: (id: string) => void;
  onImport: (weeks: SavedWeek[]) => void;
  t: (key: string) => string;
  isDarkMode: boolean;
}

const SavedWeeksModal: React.FC<SavedWeeksModalProps> = ({ 
    isOpen, onClose, savedWeeks, activeWeekId, onSave, onLoad, onOverwrite, onDelete, onImport, t, isDarkMode
}) => {
  const [weekName, setWeekName] = useState('');
  const [activeTab, setActiveTab] = useState<'save' | 'load'>('load');
  const [overwriteTargetId, setOverwriteTargetId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeWeek = useMemo(() => savedWeeks.find(w => w.id === activeWeekId), [savedWeeks, activeWeekId]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (weekName.trim()) {
      onSave(weekName.trim());
      setWeekName('');
      setActiveTab('load'); 
    }
  };

  const handleOverwriteConfirm = () => {
    const id = overwriteTargetId || activeWeekId;
    if (id) {
      const week = savedWeeks.find(w => w.id === id);
      if (week && confirm(`${t('overwrite_confirm')} ("${week.name}")`)) {
        onOverwrite(id);
        onClose();
      }
    }
  };

  const handleExport = (week: SavedWeek) => {
      const filename = `week_plan_${week.name.replace(/\s+/g, '_').toLowerCase()}.json`;
      downloadJson(filename, [week]);
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
          const json = await readJsonFile<any>(file);
          if (Array.isArray(json)) {
              const validWeeks = json.filter((item: any) => item.name && item.menu);
              if (validWeeks.length > 0) onImport(validWeeks);
              else alert("No valid saved weeks found.");
          } else if (json.name && json.menu) {
              onImport([json]);
          } else {
              alert("Invalid format.");
          }
      } catch (error) {
          console.error(error);
          alert("Error reading JSON.");
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-dark-bg border-dark-border' : 'bg-white border-gray-200'} w-full max-w-lg rounded-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-scale-up border max-h-[90vh]`}>
        <header className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-dark-border' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <RefreshCwIcon className="h-6 w-6 text-brand-light" />
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-dark-text' : 'text-gray-900'}`}>{t('manage_weeks')}</h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-dark-card' : 'hover:bg-gray-100'}`}>
            <XIcon className={`h-6 w-6 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'}`} />
          </button>
        </header>

        <div className={`flex border-b ${isDarkMode ? 'border-dark-border bg-dark-card/30' : 'border-gray-100 bg-gray-50'}`}>
            <button 
                onClick={() => setActiveTab('load')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'load' ? 'text-brand-light border-b-2 border-brand-light' : (isDarkMode ? 'text-dark-text-secondary hover:bg-dark-card' : 'text-gray-500 hover:bg-gray-200')}`}
            >
                {t('saved_weeks')}
            </button>
            <button 
                onClick={() => setActiveTab('save')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'save' ? 'text-brand-light border-b-2 border-brand-light' : (isDarkMode ? 'text-dark-text-secondary hover:bg-dark-card' : 'text-gray-500 hover:bg-gray-200')}`}
            >
                {t('save')} / {t('overwrite')}
            </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
            {activeTab === 'save' && (
                <div className="space-y-6">
                    {activeWeekId && activeWeekId !== 'default-new-menu' && (
                        <div className={`p-4 rounded-xl border-2 border-brand-primary ${isDarkMode ? 'bg-brand-primary/10' : 'bg-brand-primary/5'} animate-fade-in`}>
                             <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-brand-light' : 'text-brand-secondary'}`}>
                                <SaveFloppyIcon className="h-5 w-5" />
                                {t('save')} cambios en "{activeWeek?.name}"
                             </h3>
                             <p className={`text-xs mb-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'}`}>
                                Sobrescribirá el menú guardado con lo que ves en pantalla actualmente.
                             </p>
                             <button
                                onClick={handleOverwriteConfirm}
                                className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg active:scale-95"
                             >
                                Confirmar Sobrescribir
                             </button>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-dark-text' : 'text-gray-900'}`}>
                            {activeWeekId ? 'O guardar como copia nueva' : t('save_current_week')}
                        </h3>
                        <div>
                            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'}`}>{t('week_name')}</label>
                            <input
                                type="text"
                                value={weekName}
                                onChange={(e) => setWeekName(e.target.value)}
                                placeholder={t('week_name_placeholder')}
                                className={`w-full border rounded-md px-3 py-2 outline-none focus:ring-brand-primary focus:border-brand-primary ${isDarkMode ? 'bg-dark-card border-dark-border text-dark-text' : 'bg-white border-gray-300 text-gray-900'}`}
                                autoFocus={!activeWeekId}
                            />
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={!weekName.trim()}
                            className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                        >
                            <SaveFloppyIcon className="h-5 w-5" />
                            <span>{t('save')}</span>
                        </button>
                    </div>

                    {!activeWeekId && (
                        <div className="space-y-4">
                            <div className={`relative flex py-2 items-center ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-400'}`}>
                                <div className="flex-grow border-t border-current opacity-20"></div>
                                <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-widest">O</span>
                                <div className="flex-grow border-t border-current opacity-20"></div>
                            </div>
                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-dark-text' : 'text-gray-900'}`}>{t('overwrite')}</h3>
                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'}`}>Seleccionar plantilla para reemplazar</label>
                                <select
                                    value={overwriteTargetId}
                                    onChange={(e) => setOverwriteTargetId(e.target.value)}
                                    className={`w-full border rounded-md px-3 py-2 outline-none focus:ring-brand-primary focus:border-brand-primary ${isDarkMode ? 'bg-dark-card border-dark-border text-dark-text' : 'bg-white border-gray-300 text-gray-900'}`}
                                >
                                    <option value="">-- {t('saved_weeks')} --</option>
                                    {savedWeeks.filter(w => w.id !== 'default-new-menu').map(week => (
                                        <option key={week.id} value={week.id}>{week.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleOverwriteConfirm}
                                disabled={!overwriteTargetId}
                                className={`w-full font-bold py-3 px-4 rounded-md transition-all flex items-center justify-center gap-2 shadow-md ${overwriteTargetId ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'}`}
                            >
                                <SaveFloppyIcon className="h-5 w-5" />
                                <span>{t('overwrite')}</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'load' && (
                <div className="space-y-3">
                    <div className="flex justify-end mb-4">
                         <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                         <button onClick={handleImportClick} className={`flex items-center gap-2 border px-3 py-2 rounded-md text-sm font-semibold transition-colors ${isDarkMode ? 'bg-dark-card border-dark-border text-dark-text-secondary hover:text-brand-light hover:border-brand-primary' : 'bg-white border-gray-300 text-gray-600 hover:text-brand-primary hover:border-brand-primary'}`}>
                            <UploadIcon className="h-4 w-4" /> {t('import_week')}
                         </button>
                    </div>

                    {savedWeeks.length > 0 ? (
                        savedWeeks.map(week => (
                            <div 
                                key={week.id} 
                                className={`border rounded-lg p-3 flex justify-between items-center group transition-all ${
                                    week.id === activeWeekId 
                                        ? (isDarkMode ? 'border-brand-primary bg-brand-primary/10 shadow-lg' : 'border-brand-primary bg-brand-primary/5 shadow-lg') 
                                        : (isDarkMode ? 'bg-dark-card border-dark-border hover:border-brand-primary/50' : 'bg-white border-gray-200 hover:border-brand-primary/50')
                                }`}
                            >
                                <div className="overflow-hidden mr-3">
                                    <h4 className={`font-bold truncate ${isDarkMode ? 'text-dark-text' : 'text-gray-900'}`}>{week.name}</h4>
                                    <p className={`text-xs truncate ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'}`}>{week.notes || "..."}</p>
                                    {week.id === activeWeekId && (
                                        <span className="text-[10px] font-bold text-brand-primary uppercase mt-1 inline-block">Cargado</span>
                                    )}
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    <button 
                                        onClick={() => onLoad(week)}
                                        className="flex items-center gap-1 bg-brand-primary/20 text-brand-light px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-colors text-sm font-semibold"
                                        title={t('load')}
                                    >
                                        <DownloadIcon className="h-4 w-4" />
                                    </button>
                                    
                                    {week.id !== 'default-new-menu' && (
                                        <button 
                                            onClick={() => {
                                                if(confirm(`${t('overwrite_confirm')} ("${week.name}")`)) {
                                                    onOverwrite(week.id);
                                                }
                                            }}
                                            className={`p-2 rounded-md transition-colors ${isDarkMode ? 'text-dark-text-secondary hover:text-brand-light bg-gray-800 hover:bg-gray-700' : 'text-gray-500 hover:text-brand-primary bg-gray-100 hover:bg-gray-200'}`}
                                            title={t('overwrite')}
                                        >
                                            <SaveFloppyIcon className="h-4 w-4" />
                                        </button>
                                    )}

                                     <button 
                                        onClick={() => handleExport(week)}
                                        className={`p-2 rounded-md transition-colors ${isDarkMode ? 'text-dark-text-secondary hover:text-brand-light bg-gray-800 hover:bg-gray-700' : 'text-gray-500 hover:text-brand-primary bg-gray-100 hover:bg-gray-200'}`}
                                        title={t('export_week')}
                                    >
                                        <UploadIcon className="h-4 w-4 rotate-180" />
                                    </button>
                                    
                                    {week.id !== 'default-new-menu' && (
                                        <button 
                                            onClick={() => onDelete(week.id)}
                                            className={`p-2 rounded-md transition-colors ${isDarkMode ? 'text-dark-text-secondary hover:text-red-400 bg-gray-800 hover:bg-gray-700' : 'text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-gray-200'}`}
                                            title={t('delete')}
                                        >
                                            <Trash2Icon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-dark-text-secondary">
                            {t('empty_list')}
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
       <style>{`
        @keyframes scale-up {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up { animation: scale-up 0.2s ease-out forwards; }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SavedWeeksModal;

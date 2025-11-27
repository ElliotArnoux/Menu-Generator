
import React, { useState, useRef } from 'react';
import { SavedWeek } from '../types';
import { XIcon, SaveFloppyIcon, FolderIcon, Trash2Icon, DownloadIcon, UploadIcon } from './icons';
import { downloadJson, readJsonFile } from '../fileUtils';

interface SavedWeeksModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedWeeks: SavedWeek[];
  onSave: (name: string) => void;
  onLoad: (week: SavedWeek) => void;
  onDelete: (id: string) => void;
  onImport?: (weeks: SavedWeek[]) => void;
  t: (key: string) => string;
}

const SavedWeeksModal: React.FC<SavedWeeksModalProps> = ({ 
    isOpen, onClose, savedWeeks, onSave, onLoad, onDelete, onImport, t 
}) => {
  const [weekName, setWeekName] = useState('');
  const [activeTab, setActiveTab] = useState<'save' | 'load'>('load');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (weekName.trim()) {
      onSave(weekName.trim());
      setWeekName('');
      setActiveTab('load'); // Switch to list view after save
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
      if (!file || !onImport) return;

      try {
          const json = await readJsonFile<any>(file);
          if (Array.isArray(json)) {
              const validWeeks = json.filter((item: any) => item.name && item.menu);
              if (validWeeks.length > 0) {
                  onImport(validWeeks);
              } else {
                  alert("No valid saved weeks found in file.");
              }
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
      <div className="bg-dark-bg w-full max-w-lg rounded-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-scale-up border border-dark-border max-h-[90vh]">
        <header className="flex items-center justify-between p-4 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <FolderIcon className="h-6 w-6 text-brand-light" />
            <h2 className="text-xl font-bold text-dark-text">{t('manage_weeks')}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-dark-card transition-colors">
            <XIcon className="h-6 w-6 text-dark-text-secondary" />
          </button>
        </header>

        <div className="flex border-b border-dark-border bg-dark-card/30">
            <button 
                onClick={() => setActiveTab('load')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'load' ? 'text-brand-light border-b-2 border-brand-light' : 'text-dark-text-secondary hover:bg-dark-card'}`}
            >
                {t('saved_weeks')}
            </button>
            <button 
                onClick={() => setActiveTab('save')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'save' ? 'text-brand-light border-b-2 border-brand-light' : 'text-dark-text-secondary hover:bg-dark-card'}`}
            >
                {t('save_current_week')}
            </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
            {activeTab === 'save' && (
                <div className="space-y-4">
                    <p className="text-dark-text-secondary text-sm">
                        {t('save_current_week')} to reuse later. This saves the menu, notes, and rules configuration.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">{t('week_name')}</label>
                        <input
                            type="text"
                            value={weekName}
                            onChange={(e) => setWeekName(e.target.value)}
                            placeholder={t('week_name_placeholder')}
                            className="w-full bg-dark-card border border-dark-border rounded-md px-3 py-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary"
                            autoFocus
                        />
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={!weekName.trim()}
                        className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <SaveFloppyIcon className="h-5 w-5" />
                        <span>{t('save')}</span>
                    </button>
                </div>
            )}

            {activeTab === 'load' && (
                <div className="space-y-3">
                     {/* Import Button */}
                    <div className="flex justify-end mb-4">
                         <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                         <button onClick={handleImportClick} className="flex items-center gap-2 bg-dark-card border border-dark-border px-3 py-2 rounded-md text-sm font-semibold text-dark-text-secondary hover:text-brand-light hover:border-brand-primary transition-colors">
                            <UploadIcon className="h-4 w-4" /> {t('import_week')}
                         </button>
                    </div>

                    {savedWeeks.length > 0 ? (
                        savedWeeks.map(week => (
                            <div key={week.id} className="bg-dark-card border border-dark-border rounded-lg p-3 flex justify-between items-center group hover:border-brand-primary/50 transition-colors">
                                <div className="overflow-hidden mr-3">
                                    <h4 className="font-bold text-dark-text truncate">{week.name}</h4>
                                    <p className="text-xs text-dark-text-secondary truncate">{week.notes || "No notes"}</p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button 
                                        onClick={() => onLoad(week)}
                                        className="flex items-center gap-1 bg-brand-primary/20 text-brand-light px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-colors text-sm font-semibold"
                                        title={t('load')}
                                    >
                                        <DownloadIcon className="h-4 w-4" />
                                    </button>
                                     <button 
                                        onClick={() => handleExport(week)}
                                        className="p-2 text-dark-text-secondary hover:text-brand-light bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                                        title={t('export_week')}
                                    >
                                        <UploadIcon className="h-4 w-4 rotate-180" /> {/* Reuse upload icon rotated as export/download external */}
                                    </button>
                                    <button 
                                        onClick={() => onDelete(week.id)}
                                        className="p-2 text-dark-text-secondary hover:text-red-400 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                                        title={t('delete')}
                                    >
                                        <Trash2Icon className="h-4 w-4" />
                                    </button>
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
      `}</style>
    </div>
  );
};

export default SavedWeeksModal;

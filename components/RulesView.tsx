
import React, { useState, useRef } from 'react';
import { SavedRule, RuleCategory } from '../types';
import { PlusIcon, Trash2Icon, EditIcon, SaveIcon, XIcon, DownloadIcon, UploadIcon } from './icons';
import { downloadJson, readJsonFile } from '../fileUtils';

interface RulesViewProps {
    rules: SavedRule[];
    categories: RuleCategory[];
    onAddRule: (rule: Omit<SavedRule, 'id'>) => void;
    onUpdateRule: (rule: SavedRule) => void;
    onDeleteRule: (id: string) => void;
    onAddCategory: (name: string) => void;
    onUpdateCategory: (category: RuleCategory) => void;
    onDeleteCategory: (id: string) => void;
    onImportRules: (data: { rules: SavedRule[], categories: RuleCategory[] }) => void;
    t: (key: string) => string;
    isDarkMode: boolean;
}

const RulesView: React.FC<RulesViewProps> = ({
    rules, categories, onAddRule, onUpdateRule, onDeleteRule,
    onAddCategory, onUpdateCategory, onDeleteCategory, onImportRules, t, isDarkMode
}) => {
    const [activeCategoryId, setActiveCategoryId] = useState<string>('ALL');
    
    // Category Management State
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<RuleCategory | null>(null);

    // Rule Management State
    const [editingRule, setEditingRule] = useState<SavedRule | null>(null);
    const [isCreatingRule, setIsCreatingRule] = useState(false);
    
    // Form State
    const [ruleFormName, setRuleFormName] = useState('');
    const [ruleFormText, setRuleFormText] = useState('');
    const [ruleFormCategory, setRuleFormCategory] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCategorySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        onAddCategory(newCategoryName);
        setNewCategoryName('');
    };

    const handleUpdateCategory = () => {
        if(editingCategory && editingCategory.name.trim()) {
            onUpdateCategory(editingCategory);
            setEditingCategory(null);
        }
    }

    const startEditingRule = (rule: SavedRule) => {
        setEditingRule(rule);
        setRuleFormName(rule.name);
        setRuleFormText(rule.text);
        setRuleFormCategory(rule.categoryId || '');
        setIsCreatingRule(true);
    };

    const startCreatingRule = () => {
        setEditingRule(null);
        setRuleFormName('');
        setRuleFormText('');
        setRuleFormCategory(activeCategoryId !== 'ALL' ? activeCategoryId : '');
        setIsCreatingRule(true);
    }

    const cancelRuleEdit = () => {
        setIsCreatingRule(false);
        setEditingRule(null);
    }

    const handleRuleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!ruleFormName.trim() || !ruleFormText.trim()) return;

        if (editingRule) {
            onUpdateRule({
                ...editingRule,
                name: ruleFormName,
                text: ruleFormText,
                categoryId: ruleFormCategory
            });
        } else {
            onAddRule({
                name: ruleFormName,
                text: ruleFormText,
                categoryId: ruleFormCategory
            });
        }
        cancelRuleEdit();
    };

    const handleExport = () => {
        downloadJson('rules_chericitos.json', { rules, categories });
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const json = await readJsonFile<any>(file);
            if (json.rules && Array.isArray(json.rules) && json.categories && Array.isArray(json.categories)) {
                onImportRules(json);
            } else {
                alert("Invalid format.");
            }
        } catch (error) {
            console.error(error);
            alert("Error reading JSON.");
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const filteredRules = activeCategoryId === 'ALL' 
        ? rules 
        : rules.filter(r => r.categoryId === activeCategoryId);

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex justify-end gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                <button onClick={handleImportClick} className="flex items-center gap-2 bg-dark-card border border-dark-border px-3 py-2 rounded-md text-sm font-semibold text-dark-text-secondary hover:text-brand-light hover:border-brand-primary transition-colors">
                    <UploadIcon className="h-4 w-4" /> {t('import')}
                </button>
                <button onClick={handleExport} className="flex items-center gap-2 bg-dark-card border border-dark-border px-3 py-2 rounded-md text-sm font-semibold text-dark-text-secondary hover:text-brand-light hover:border-brand-primary transition-colors">
                    <DownloadIcon className="h-4 w-4" /> {t('export')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sidebar: Categories */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-dark-card rounded-xl border border-dark-border p-4">
                        <h3 className="text-lg font-bold text-dark-text mb-4">{t('categories')}</h3>
                        
                        <form onSubmit={handleCategorySubmit} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder={t('new_category')}
                                className="flex-grow bg-gray-800 border border-dark-border rounded-md px-2 py-1.5 text-sm text-dark-text focus:ring-brand-primary focus:border-brand-primary"
                            />
                            <button type="submit" className="bg-brand-primary text-white p-2 rounded-md hover:bg-brand-secondary transition-colors" disabled={!newCategoryName.trim()}>
                                <PlusIcon className="h-4 w-4" />
                            </button>
                        </form>

                        <div className="space-y-1">
                            <button
                                onClick={() => setActiveCategoryId('ALL')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeCategoryId === 'ALL' ? 'bg-brand-primary text-white' : 'text-dark-text-secondary hover:bg-gray-700'}`}
                            >
                                {t('Any')}
                            </button>
                            {categories.map(cat => (
                                <div key={cat.id} className="group flex items-center">
                                    {editingCategory?.id === cat.id ? (
                                        <div className="flex-grow flex gap-1 items-center px-1">
                                            <input 
                                                value={editingCategory.name}
                                                onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                                                className="w-full bg-gray-900 border border-brand-primary rounded px-2 py-1 text-sm text-white"
                                                autoFocus
                                            />
                                            <button onClick={handleUpdateCategory} className="text-green-400"><SaveIcon className="h-4 w-4"/></button>
                                            <button onClick={() => setEditingCategory(null)} className="text-red-400"><XIcon className="h-4 w-4"/></button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setActiveCategoryId(cat.id)}
                                            className={`flex-grow text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between items-center ${activeCategoryId === cat.id ? 'bg-brand-primary text-white' : 'text-dark-text-secondary hover:bg-gray-700'}`}
                                        >
                                            <span>{cat.name}</span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span 
                                                    onClick={(e) => { e.stopPropagation(); setEditingCategory(cat); }}
                                                    className={`p-1 hover:text-white cursor-pointer ${activeCategoryId === cat.id ? 'text-white' : 'text-gray-400'}`}
                                                >
                                                    <EditIcon className="h-3 w-3" />
                                                </span>
                                                <span 
                                                    onClick={(e) => { e.stopPropagation(); onDeleteCategory(cat.id); }}
                                                    className={`p-1 hover:text-red-300 cursor-pointer ${activeCategoryId === cat.id ? 'text-white' : 'text-red-400'}`}
                                                >
                                                    <Trash2Icon className="h-3 w-3" />
                                                </span>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Area: Rules */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-dark-text">
                            {activeCategoryId === 'ALL' ? t('rules_title') : categories.find(c => c.id === activeCategoryId)?.name}
                        </h2>
                        {!isCreatingRule && (
                            <button onClick={startCreatingRule} className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2 rounded-md font-semibold transition-colors">
                                <PlusIcon className="h-5 w-5" /> {t('add')}
                            </button>
                        )}
                    </div>

                    {isCreatingRule && (
                        <div className="bg-dark-card border border-brand-primary rounded-xl p-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-dark-text mb-4">{editingRule ? t('edit') : t('add')}</h3>
                            <form onSubmit={handleRuleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">{t('rule_name')}</label>
                                    <input
                                        type="text"
                                        value={ruleFormName}
                                        onChange={(e) => setRuleFormName(e.target.value)}
                                        className="w-full bg-gray-800 border border-dark-border rounded-md px-3 py-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">{t('rule_prompt')}</label>
                                    <textarea
                                        value={ruleFormText}
                                        onChange={(e) => setRuleFormText(e.target.value)}
                                        rows={3}
                                        className="w-full bg-gray-800 border border-dark-border rounded-md px-3 py-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">{t('categories')}</label>
                                    <select
                                        value={ruleFormCategory}
                                        onChange={(e) => setRuleFormCategory(e.target.value)}
                                        className="w-full bg-gray-800 border border-dark-border rounded-md px-3 py-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary"
                                    >
                                        <option value="">{t('Any')}</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={cancelRuleEdit} className="px-4 py-2 text-dark-text-secondary hover:text-white transition-colors">{t('cancel')}</button>
                                    <button type="submit" className="bg-brand-primary text-white px-6 py-2 rounded-md font-semibold hover:bg-brand-secondary transition-colors">{t('save')}</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-3">
                        {filteredRules.length > 0 ? (
                            filteredRules.map(rule => (
                                <div key={rule.id} className="bg-dark-card border border-dark-border rounded-lg p-4 hover:border-brand-primary/50 transition-colors flex justify-between items-start group">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-dark-text text-lg">{rule.name}</h4>
                                            {rule.categoryId && (
                                                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                                                    {categories.find(c => c.id === rule.categoryId)?.name}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-dark-text-secondary text-sm">{rule.text}</p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => startEditingRule(rule)} 
                                            className="p-2 text-dark-text-secondary hover:text-brand-light bg-gray-800/50 rounded-md"
                                            title={t('edit')}
                                        >
                                            <EditIcon className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => onDeleteRule(rule.id)} 
                                            className="p-2 text-dark-text-secondary hover:text-red-400 bg-gray-800/50 rounded-md"
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
                </div>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default RulesView;

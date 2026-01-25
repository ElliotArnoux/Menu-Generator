
import React, { useState } from 'react';
import { XIcon, Wand2Icon } from './icons';
import { SavedRule, RuleCategory } from '../types';

interface GenerateWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (rulesPrompt: string, ruleNames: string[]) => void;
  isLoading: boolean;
  savedRules: SavedRule[];
  ruleCategories: RuleCategory[];
  t: (key: string) => string;
  isDarkMode: boolean;
}

const GenerateWeekModal: React.FC<GenerateWeekModalProps> = ({ 
    isOpen, onClose, onGenerate, isLoading, savedRules, ruleCategories, t, isDarkMode 
}) => {
  const [customRules, setCustomRules] = useState('');
  const [selectedRuleIds, setSelectedRuleIds] = useState<Set<string>>(new Set());
  const [includeCustomRules, setIncludeCustomRules] = useState(true);

  const toggleRule = (id: string) => {
      const newSet = new Set(selectedRuleIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedRuleIds(newSet);
  };

  const handleGenerate = () => {
    let finalPrompt = "";
    const selectedRules = savedRules.filter(r => selectedRuleIds.has(r.id));
    const selectedRulesTexts = selectedRules.map(r => r.text);
    
    // Create list of rule names for display
    const ruleNames = selectedRules.map(r => r.name);
    
    if (selectedRulesTexts.length > 0) {
        finalPrompt += selectedRulesTexts.join(" ");
    }
    if (includeCustomRules && customRules.trim()) {
        finalPrompt += " " + customRules.trim();
        ruleNames.push("Custom Instructions"); // Add indicator for custom instructions
    }
    onGenerate(finalPrompt, ruleNames);
  };

  const uncategorizedRules = savedRules.filter(r => !r.categoryId || !ruleCategories.find(c => c.id === r.categoryId));
  const groupedRules = ruleCategories.map(cat => ({
      category: cat,
      rules: savedRules.filter(r => r.categoryId === cat.id)
  })).filter(group => group.rules.length > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-bg w-full max-w-2xl rounded-2xl flex flex-col transform transition-transform duration-300 ease-in-out scale-95 animate-scale-up max-h-[90vh]">
        <header className="flex items-center justify-between p-4 border-b border-dark-border bg-dark-bg rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <Wand2Icon className="h-6 w-6 text-brand-light" />
            <h2 className="text-xl font-bold text-dark-text">{t('generate_week')}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-dark-card transition-colors">
            <XIcon className="h-6 w-6 text-dark-text-secondary" />
          </button>
        </header>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="font-semibold text-dark-text">{t('select_rules')}:</h3>
            
            {groupedRules.map(group => (
                <div key={group.category.id} className="mb-4">
                    <h4 className="text-sm font-bold text-brand-light mb-2 uppercase tracking-wider">{group.category.name}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.rules.map(rule => (
                            <label key={rule.id} className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-all ${selectedRuleIds.has(rule.id) ? 'bg-brand-primary/20 border-brand-primary' : 'bg-dark-card border-dark-border hover:bg-gray-700'}`}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedRuleIds.has(rule.id)}
                                    onChange={() => toggleRule(rule.id)}
                                    className="mt-1 h-4 w-4 rounded bg-gray-800 border-gray-500 text-brand-primary focus:ring-brand-primary"
                                />
                                <div>
                                    <span className="block font-semibold text-dark-text text-sm">{rule.name}</span>
                                    <span className="block text-xs text-dark-text-secondary mt-0.5 line-clamp-2">{rule.text}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            {uncategorizedRules.length > 0 && (
                 <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('Any')}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {uncategorizedRules.map(rule => (
                            <label key={rule.id} className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-all ${selectedRuleIds.has(rule.id) ? 'bg-brand-primary/20 border-brand-primary' : 'bg-dark-card border-dark-border hover:bg-gray-700'}`}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedRuleIds.has(rule.id)}
                                    onChange={() => toggleRule(rule.id)}
                                    className="mt-1 h-4 w-4 rounded bg-gray-800 border-gray-500 text-brand-primary focus:ring-brand-primary"
                                />
                                <div>
                                    <span className="block font-semibold text-dark-text text-sm">{rule.name}</span>
                                    <span className="block text-xs text-dark-text-secondary mt-0.5 line-clamp-2">{rule.text}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            )}
          </div>
          
          <hr className="border-dark-border" />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    id="useCustom"
                    checked={includeCustomRules}
                    onChange={(e) => setIncludeCustomRules(e.target.checked)}
                    className="h-4 w-4 rounded bg-gray-800 border-gray-500 text-brand-primary focus:ring-brand-primary"
                />
                <label htmlFor="useCustom" className="text-sm font-semibold text-dark-text">{t('add_instructions')}</label>
            </div>
            {includeCustomRules && (
                <textarea
                    value={customRules}
                    onChange={(e) => setCustomRules(e.target.value)}
                    rows={3}
                    placeholder={t('custom_instructions_placeholder')}
                    className="w-full bg-dark-card border border-dark-border rounded-md px-3 py-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary placeholder-gray-500"
                    disabled={isLoading}
                />
            )}
          </div>
        </div>

        <footer className="p-4 border-t border-dark-border">
          <button
            onClick={handleGenerate}
            disabled={isLoading || (!selectedRuleIds.size && (!includeCustomRules || !customRules.trim()))}
            className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{t('generating')}</span>
              </>
            ) : (
              <>
                <Wand2Icon className="h-5 w-5" />
                <span>{t('generate_menu')}</span>
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default GenerateWeekModal;

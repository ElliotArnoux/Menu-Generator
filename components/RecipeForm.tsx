
import React, { useState, useEffect, useRef } from 'react';
import { Dish, Ingredient } from '../types';
import { PlusIcon, XIcon, SettingsIcon } from './icons';

interface RecipeFormProps {
    editingRecipe: Dish | null;
    onSave: (dish: Omit<Dish, 'id'> | Dish) => void;
    onCancel: () => void;
    categories: string[];
    t: (key: string) => string;
    ingredientStoreMap: Record<string, string>;
    onAddCategory: (name: string) => void;
    onDeleteCategory: (name: string) => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({
    editingRecipe, onSave, onCancel, categories, t, ingredientStoreMap,
    onAddCategory, onDeleteCategory
}) => {
    const [name, setName] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([{ text: '', store: '', quantity: 0 }]);
    const [instructions, setInstructions] = useState('');
    const [isManagingCategories, setIsManagingCategories] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    // Load recipe data when editingRecipe changes
    useEffect(() => {
        if (editingRecipe) {
            setName(editingRecipe.name);
            const cats = editingRecipe.categories 
                ? editingRecipe.categories 
                : (editingRecipe.category ? [editingRecipe.category] : []);
            setSelectedCategories(cats);
            
            setIngredients(editingRecipe.ingredients && editingRecipe.ingredients.length > 0 
                ? JSON.parse(JSON.stringify(editingRecipe.ingredients)) 
                : [{ text: '', store: '', quantity: 0 }]
            );
            setInstructions(editingRecipe.instructions || '');
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Reset if switching to Add mode
            setName('');
            setSelectedCategories([]);
            setIngredients([{ text: '', store: '', quantity: 0 }]);
            setInstructions('');
        }
    }, [editingRecipe]);

    const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        
        // Auto-fill store if text matches known ingredient
        if (field === 'text' && typeof value === 'string' && !newIngredients[index].store) {
            const knownStore = ingredientStoreMap[value.trim().toLowerCase()];
            if (knownStore) {
                newIngredients[index].store = knownStore;
            }
        }
        setIngredients(newIngredients);
    };

    const addIngredientField = () => {
        setIngredients([...ingredients, { text: '', store: '', quantity: 0 }]);
    };

    const removeIngredientField = (index: number) => {
        const newIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(newIngredients);
    };

    const toggleCategory = (cat: string) => {
        setSelectedCategories(prev => 
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const handleAddNewCategory = () => {
        if (newCatName.trim()) {
            onAddCategory(newCatName.trim());
            setNewCatName('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            alert('Please fill recipe name.');
            return;
        }
        const finalIngredients = ingredients.filter(ing => ing.text.trim() !== '');
        
        const recipeData = { 
            name, 
            description: '', // Kept as empty string for compatibility
            categories: selectedCategories, 
            ingredients: finalIngredients, 
            instructions 
        };

        if (editingRecipe) {
            onSave({ ...recipeData, id: editingRecipe.id });
        } else {
            onSave(recipeData);
        }
        
        // Clear form if saving new
        if (!editingRecipe) {
            setName('');
            setSelectedCategories([]);
            setIngredients([{ text: '', store: '', quantity: 0 }]);
            setInstructions('');
        }
    };

    // Combine global categories with any category currently present (in case of AI imports)
    const displayCategories = Array.from(new Set([...categories, ...selectedCategories]));

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="bg-dark-card p-6 rounded-lg border border-dark-border space-y-4">
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-dark-text-secondary mb-1">{t('recipe_name')}</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-800 border border-dark-border rounded-md px-3 py-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary"
                        required
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-dark-text-secondary">{t('categories')}</label>
                        <button type="button" onClick={() => setIsManagingCategories(!isManagingCategories)} className="text-xs text-brand-light flex items-center gap-1 hover:underline">
                            <SettingsIcon className="h-3 w-3" /> {t('manage_categories')}
                        </button>
                    </div>
                    
                    {isManagingCategories && (
                        <div className="mb-4 p-3 bg-gray-800/50 rounded-md border border-dark-border animate-fade-in">
                            <div className="flex gap-2 mb-2">
                                <input 
                                    value={newCatName}
                                    onChange={e => setNewCatName(e.target.value)}
                                    placeholder={t('new_category')}
                                    className="flex-grow bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm text-dark-text"
                                />
                                <button type="button" onClick={handleAddNewCategory} className="bg-brand-primary px-3 py-1 rounded text-white text-sm hover:bg-brand-secondary"><PlusIcon className="h-4 w-4"/></button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <div key={cat} className="flex items-center gap-1 bg-dark-bg border border-dark-border px-2 py-1 rounded-full text-xs text-dark-text-secondary">
                                        {t(cat)}
                                        <button type="button" onClick={() => onDeleteCategory(cat)} className="text-red-400 hover:text-red-300"><XIcon className="h-3 w-3"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {displayCategories.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => toggleCategory(cat)}
                                className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                                    selectedCategories.includes(cat)
                                        ? 'bg-brand-primary border-brand-primary text-white'
                                        : 'bg-gray-800 border-dark-border text-dark-text-secondary hover:border-gray-500'
                                }`}
                            >
                                {t(cat)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-dark-text-secondary mb-1">{t('ingredients')}</label>
                <div className="space-y-2">
                    <div className="flex gap-2 text-xs text-dark-text-secondary mb-1 px-1">
                        <span className="w-8"></span>
                    </div>
                    {ingredients.map((ing, index) => (
                        <div key={index} className="flex gap-2">
                            <div className="flex-grow-[3]">
                                <input
                                type="text"
                                placeholder={t('ingredients')}
                                value={ing.text}
                                onChange={(e) => handleIngredientChange(index, 'text', e.target.value)}
                                className="w-full bg-gray-800 border border-dark-border rounded-md px-3 py-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary"
                                />
                            </div>
                             <div className="w-20">
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    placeholder="Qty"
                                    value={ing.quantity || ''}
                                    onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-gray-800 border border-dark-border rounded-md px-2 py-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary text-center"
                                />
                            </div>
                            <div className="flex-grow-[1]">
                                    <input
                                    type="text"
                                    placeholder={t('store')}
                                    value={ing.store || ''}
                                    onChange={(e) => handleIngredientChange(index, 'store', e.target.value)}
                                    className="w-full bg-gray-800 border border-dark-border rounded-md px-3 py-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary"
                                    list="store-suggestions"
                                />
                                <datalist id="store-suggestions">
                                    {Array.from(new Set(Object.values(ingredientStoreMap))).map(store => (
                                        <option key={store} value={store} />
                                    ))}
                                </datalist>
                            </div>
                            <button type="button" onClick={() => removeIngredientField(index)} className="p-2 text-dark-text-secondary hover:text-red-400">
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addIngredientField} className="mt-2 flex items-center gap-2 text-sm font-semibold text-brand-light hover:text-brand-primary transition-colors">
                    <PlusIcon className="h-4 w-4" /> {t('add')}
                </button>
            </div>
            <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-dark-text-secondary mb-1">{t('instructions')}</label>
                <textarea
                    id="instructions"
                    rows={6}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full bg-gray-800 border border-dark-border rounded-md px-3 py-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary"
                />
            </div>
            <div className="flex gap-4">
                <button type="submit" className="flex-grow bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-md transition-colors">
                    {editingRecipe ? t('save') : t('save')}
                </button>
                {editingRecipe && (
                    <button type="button" onClick={onCancel} className="bg-dark-card hover:bg-gray-700 text-dark-text-secondary font-bold py-3 px-4 rounded-md transition-colors">
                        {t('cancel')}
                    </button>
                )}
            </div>
        </form>
    );
};

export default RecipeForm;


import { Day } from './types';

export interface CompiledGroceryItem {
    text: string;
    store: string;
    quantity: number;
}

export const compileGroceryItems = (weekMenu: Day[], ingredientStoreMap: Record<string, string>): CompiledGroceryItem[] => {
    const rawItems: CompiledGroceryItem[] = [];
    weekMenu.forEach(day => {
        day.meals.forEach(meal => {
            meal.subMeals.forEach(subMeal => {
                if (subMeal.dish && subMeal.dish.ingredients) {
                    subMeal.dish.ingredients.forEach(ingredient => {
                        if (ingredient.text.trim()) {
                            const cleanName = ingredient.text.trim();
                            // Prioritize specific store, then map, then Uncategorized
                            const store = ingredient.store || ingredientStoreMap[cleanName.toLowerCase()] || 'Uncategorized';
                            const quantity = ingredient.quantity || 1; // Default to 1 if no quantity provided
                            rawItems.push({ text: cleanName, store, quantity });
                        }
                    });
                }
            });
        });
    });
    return rawItems;
};

export const consolidateGroceryItems = (items: CompiledGroceryItem[]) => {
    const consolidatedMap = new Map<string, {text: string, count: number, store: string}>();
    
    items.forEach(item => {
        const id = `${item.text}::${item.store}`;
        if (consolidatedMap.has(id)) {
            consolidatedMap.get(id)!.count += item.quantity;
        } else {
            consolidatedMap.set(id, { text: item.text, count: item.quantity, store: item.store });
        }
    });

    return Array.from(consolidatedMap.values());
};

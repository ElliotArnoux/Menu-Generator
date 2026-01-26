
import { Day } from './types';

export interface CompiledGroceryItem {
    text: string;
    store: string;
    quantity: number;
    day: string;
}

export interface ConsolidatedGroceryItem {
    text: string;
    count: number;
    store: string;
    days: string[];
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
                            rawItems.push({ 
                                text: cleanName, 
                                store, 
                                quantity,
                                day: day.name // Capture the day name (e.g., "Monday" or translated equivalent)
                            });
                        }
                    });
                }
            });
        });
    });
    return rawItems;
};

export const consolidateGroceryItems = (items: CompiledGroceryItem[]): ConsolidatedGroceryItem[] => {
    // Map stores: ID -> { text, count, store, daysSet }
    const consolidatedMap = new Map<string, {text: string, count: number, store: string, days: Set<string>}>();
    
    items.forEach(item => {
        const id = `${item.text}::${item.store}`;
        if (consolidatedMap.has(id)) {
            const existing = consolidatedMap.get(id)!;
            existing.count += item.quantity;
            existing.days.add(item.day);
        } else {
            consolidatedMap.set(id, { 
                text: item.text, 
                count: item.quantity, 
                store: item.store,
                days: new Set([item.day])
            });
        }
    });

    return Array.from(consolidatedMap.values()).map(item => ({
        text: item.text,
        count: item.count,
        store: item.store,
        // Convert Set to Array and sort based on original week order if possible, 
        // but simple sort is fine for display
        days: Array.from(item.days) 
    }));
};

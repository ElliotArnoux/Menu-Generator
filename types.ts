
export type AppLanguage = 'es' | 'en' | 'fr';

// We now use strings for categories to allow dynamic user addition
export type MealCategory = string; 

export interface Ingredient {
    text: string;
    store?: string;
    quantity?: number;
}

export interface Dish {
    id?: string;
    name: string;
    description?: string;
    categories?: string[];
    ingredients?: Ingredient[];
    instructions?: string;
    // Backwards compatibility
    category?: string; 
}

export interface SubMeal {
    id: string;
    name: string;
    dish: Dish | null;
}

export interface Meal {
    name: string; // This is the key (e.g., 'breakfast'), we translate on render
    subMeals: SubMeal[];
}

export interface Day {
    name: string; // This is the key (e.g., 'monday'), we translate on render
    meals: Meal[];
}

export interface RuleCategory {
    id: string;
    name: string;
}

export interface SavedRule {
    id: string;
    name: string;
    text: string;
    categoryId: string;
}

export interface SavedWeek {
    id: string;
    name: string;
    menu: Day[];
    notes: string;
    ruleNames: string[];
}

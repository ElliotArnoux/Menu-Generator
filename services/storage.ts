
import { Dish, SavedRule, RuleCategory, SavedWeek, Day } from '../types';
import { initialRecipes } from '../initialRecipes';

// Centralized keys to avoid magic strings
const KEYS = {
    THEME: 'theme',
    ACTIVE_WEEK_ID: 'active_week_id',
    HIDDEN_DAY_KEYS: 'hidden_day_keys',
    DISH_CATEGORIES: 'dish_categories',
    SAVED_RECIPES: 'saved_recipes',
    SAVED_WEEKS: 'saved_weeks',
    SAVED_RULES: 'saved_rules_v2',
    RULE_CATEGORIES: 'rule_categories',
    INGREDIENT_STORES: 'ingredient_stores',
};

/**
 * Storage Service
 * Acts as an abstraction layer for data persistence.
 * Currently uses LocalStorage, but structured to be easily replaced by an API client.
 */
export const storage = {
    theme: {
        get: (): boolean => {
            const saved = localStorage.getItem(KEYS.THEME);
            return saved ? saved === 'dark' : true; // Default to dark
        },
        set: (isDark: boolean) => localStorage.setItem(KEYS.THEME, isDark ? 'dark' : 'light'),
    },
    
    activeWeekId: {
        get: (): string | null => localStorage.getItem(KEYS.ACTIVE_WEEK_ID),
        set: (id: string | null) => {
            if (id) localStorage.setItem(KEYS.ACTIVE_WEEK_ID, id);
            else localStorage.removeItem(KEYS.ACTIVE_WEEK_ID);
        }
    },

    hiddenDays: {
        get: (): Set<string> => {
            const saved = localStorage.getItem(KEYS.HIDDEN_DAY_KEYS);
            return saved ? new Set(JSON.parse(saved)) : new Set();
        },
        set: (keys: Set<string>) => localStorage.setItem(KEYS.HIDDEN_DAY_KEYS, JSON.stringify(Array.from(keys)))
    },

    dishCategories: {
        get: (): string[] => {
            const saved = localStorage.getItem(KEYS.DISH_CATEGORIES);
            return saved ? JSON.parse(saved) : [];
        },
        set: (categories: string[]) => localStorage.setItem(KEYS.DISH_CATEGORIES, JSON.stringify(categories))
    },

    recipes: {
        get: (): Dish[] => {
            const saved = localStorage.getItem(KEYS.SAVED_RECIPES);
            return saved ? JSON.parse(saved) : initialRecipes;
        },
        set: (recipes: Dish[]) => localStorage.setItem(KEYS.SAVED_RECIPES, JSON.stringify(recipes))
    },

    weeks: {
        get: (initialWeek: Day[]): SavedWeek[] => {
            const saved = localStorage.getItem(KEYS.SAVED_WEEKS);
            if (saved) return JSON.parse(saved);
            // Default initial state
            return [{
                id: 'default-new-menu',
                name: 'New Menu', 
                menu: initialWeek,
                notes: '',
                ruleNames: []
            }];
        },
        set: (weeks: SavedWeek[]) => localStorage.setItem(KEYS.SAVED_WEEKS, JSON.stringify(weeks))
    },

    rules: {
        getRules: (): SavedRule[] => {
            const saved = localStorage.getItem(KEYS.SAVED_RULES);
            return saved ? JSON.parse(saved) : [];
        },
        setRules: (rules: SavedRule[]) => localStorage.setItem(KEYS.SAVED_RULES, JSON.stringify(rules)),
        
        getCategories: (): RuleCategory[] => {
            const saved = localStorage.getItem(KEYS.RULE_CATEGORIES);
            return saved ? JSON.parse(saved) : [];
        },
        setCategories: (cats: RuleCategory[]) => localStorage.setItem(KEYS.RULE_CATEGORIES, JSON.stringify(cats))
    },

    ingredients: {
        getStoreMap: (): Record<string, string> => {
            const saved = localStorage.getItem(KEYS.INGREDIENT_STORES);
            return saved ? JSON.parse(saved) : {};
        },
        setStoreMap: (map: Record<string, string>) => localStorage.setItem(KEYS.INGREDIENT_STORES, JSON.stringify(map))
    }
};

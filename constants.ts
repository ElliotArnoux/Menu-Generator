
import { AppLanguage } from './types';

export const DAYS_OF_WEEK_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export const MEAL_NAMES_KEYS = ['breakfast', 'lunch', 'dinner'];

// Keys for the "Default" choices. We use keys so we can translate them on the fly.
export const DEFAULT_DISH_CATEGORIES = [
    'cat_meal', 'cat_fish', 'cat_vegetable', 'cat_gluten_free', 
    'cat_carbs', 'cat_legume', 'cat_dessert', 'cat_groups', 
    'cat_in_advance', 'cat_freezer', 'cat_cold', 'cat_breakfast', 
    'cat_sauce', 'cat_thermomix', 'cat_fruit',
    'cat_spicy', 'cat_festive', 'cat_under30', 'cat_bbq', 'cat_cocktail'
];

export const DEFAULT_SECTION_SUGGESTIONS = [
    'section_starter', 'section_main_dish', 'section_first_plate', 
    'section_second_plate', 'section_sides', 'section_dessert', 
    'section_kids', 'section_diet', 'section_cheese', 'section_aperitif',
    'section_cocktail'
];

// Backwards compatibility for older saves, though we try to use keys now
export const DEFAULT_CATEGORIES = ['Meat', 'Fish', 'Vegetable', 'Quick & Easy'];

export const CATEGORY_BORDER_COLOR_MAP: Record<string, string> = {
    // Legacy keys
    'Meat': 'border-red-400',
    'Fish': 'border-blue-400',
    'Vegetable': 'border-green-400',
    'Quick & Easy': 'border-yellow-400',
    
    // New keys
    'cat_meal': 'border-red-500',
    'cat_fish': 'border-blue-400',
    'cat_vegetable': 'border-green-500',
    'cat_gluten_free': 'border-orange-400',
    'cat_carbs': 'border-yellow-600',
    'cat_legume': 'border-amber-700',
    'cat_dessert': 'border-pink-400',
    'cat_groups': 'border-purple-500',
    'cat_in_advance': 'border-teal-500',
    'cat_freezer': 'border-cyan-600',
    'cat_cold': 'border-sky-300',
    'cat_breakfast': 'border-yellow-300',
    'cat_sauce': 'border-red-800',
    'cat_thermomix': 'border-emerald-600',
    'cat_fruit': 'border-lime-400',
    'cat_spicy': 'border-red-600',
    'cat_festive': 'border-gold-500',
    'cat_under30': 'border-indigo-400',
    'cat_bbq': 'border-orange-700',
    'cat_cocktail': 'border-fuchsia-500',
};

export const TRANSLATIONS: Record<string, Record<AppLanguage, string>> = {
    // General
    'app_title': { es: 'Planificador Semanal', en: 'Weekly Planner', fr: 'Planificateur Hebdomadaire' },
    'app_subtitle': { es: 'Planifica las comidas de tu familia con facilidad.', en: 'Plan your family meals with ease.', fr: 'Planifiez les repas de votre famille en toute simplicité.' },
    'generate_week': { es: 'Generar Semana', en: 'Generate Week', fr: 'Générer la Semaine' },
    'generate_menu': { es: 'Generar Menú', en: 'Generate Menu', fr: 'Générer le Menu' },
    'generating': { es: 'Generando...', en: 'Generating...', fr: 'Génération...' },
    
    // Tabs
    'tab_planner': { es: 'Planificador', en: 'Planner', fr: 'Planning' },
    'tab_recipes': { es: 'Recetas', en: 'Recipes', fr: 'Recettes' },
    'tab_rules': { es: 'Reglas', en: 'Rules', fr: 'Règles' },
    'tab_create': { es: 'Crear', en: 'Create', fr: 'Créer' },

    // Actions
    'save': { es: 'Guardar', en: 'Save', fr: 'Enregistrer' },
    'save_success': { es: 'Modificaciones guardadas con éxito.', en: 'Changes saved successfully.', fr: 'Modifications enregistrées avec succès.' },
    'overwrite': { es: 'Sobrescribir', en: 'Overwrite', fr: 'Écraser' },
    'cancel': { es: 'Cancelar', en: 'Cancel', fr: 'Annuler' },
    'edit': { es: 'Editar', en: 'Edit', fr: 'Modifier' },
    'delete': { es: 'Eliminar', en: 'Delete', fr: 'Supprimer' },
    'add': { es: 'Añadir', en: 'Add', fr: 'Ajouter' },
    'print': { es: 'Imprimir', en: 'Print', fr: 'Imprimer' },
    'view_details': { es: 'Ver Detalles', en: 'View Details', fr: 'Voir Détails' },
    'hide_details': { es: 'Ocultar Detalles', en: 'Hide Details', fr: 'Masquer Détails' },
    'search_placeholder': { es: 'Buscar...', en: 'Search...', fr: 'Rechercher...' },
    'export': { es: 'Exportar JSON', en: 'Export JSON', fr: 'Exporter JSON' },
    'import': { es: 'Importar JSON', en: 'Import JSON', fr: 'Importer JSON' },
    'load': { es: 'Cargar', en: 'Load', fr: 'Charger' },
    'new_menu': { es: 'Nuevo Menú', en: 'New Menu', fr: 'Nouveau Menu' },
    'confirm_new_week': { es: '¿Crear un nuevo menú? Se perderá la configuración actual.', en: 'Create new menu? Current configuration will be lost.', fr: 'Créer un nuevo menu ? La configuration actuelle será perdue.' },
    'clear_week': { es: 'Limpiar Semana', en: 'Clear Week', fr: 'Effacer la Semaine' },
    'confirm_clear_week': { es: '¿Estás seguro de que quieres borrar todo el menú de la semana?', en: 'Are you sure you want to clear the entire week menu?', fr: 'Êtes-vous sûr de vouloir effacer tout le menu de la semana ?' },
    'import_week': { es: 'Importar Semana', en: 'Import Week', fr: 'Importer Semaine' },
    'export_week': { es: 'Exportar Semana', en: 'Export Week', fr: 'Exporter Semaine' },
    'overwrite_confirm': { es: '¿Sobrescribir este menú con los cambios actuales?', en: 'Overwrite this menu with current changes?', fr: 'Écraser ce menu avec les changements actuels ?' },
    'clear_recipes': { es: 'Borrar todas las recetas', en: 'Clear all recipes', fr: 'Effacer toutes les recettes' },
    'confirm_clear_recipes': { es: '¿Estás seguro de que quieres borrar TODAS tus recetas? Esta acción no se puede deshacer.', en: 'Are you sure you want to delete ALL your recipes? This action cannot be undone.', fr: 'Êtes-vous sûr de vouloir supprimer TOUTES vos recettes ? Cette action est irréversible.' },

    // Dish Selector
    'free_text': { es: 'Texto Libre', en: 'Free Text', fr: 'Texte Libre' },
    'free_text_placeholder': { es: 'Ej: Sobras, Comer fuera...', en: 'Ex: Leftovers, Dining out...', fr: 'Ex: Restes, Restaurant...' },
    'add_free_text': { es: 'Añadir Texto', en: 'Add Text', fr: 'Ajouter Texte' },
    'ai_custom_prompt': { es: 'Instrucción personalizada (opcional)', en: 'Custom prompt (optional)', fr: 'Instruction personnalisée (optionnel)' },
    'ai_custom_placeholder': { es: 'Ej: Algo con pollo...', en: 'Ex: Something with chicken...', fr: 'Ex: Quelque chose avec du poulet...' },
    'select_rules_optional': { es: 'Aplicar reglas (opcional)', en: 'Apply rules (optional)', fr: 'Appliquer des reglas (optionnel)' },
    'search_recipes': { es: 'Buscar Recetas', en: 'Search Recipes', fr: 'Chercher Recettes' },
    'refresh': { es: 'Refrescar', en: 'Refresh', fr: 'Actualiser' },
    'click_search_ai': { es: 'Pulsa "Buscar Recetas" para obtener sugerencias.', en: 'Click "Search Recipes" to get AI suggestions.', fr: 'Cliquez sur "Chercher Recettes" pour obtenir des suggestions.' },

    // Default Categories (Legacy & New Keys)
    'Meat': { es: 'Carne', en: 'Meat', fr: 'Viande' },
    'Fish': { es: 'Pescado', en: 'Fish', fr: 'Poisson' },
    'Vegetable': { es: 'Verdura', en: 'Vegetable', fr: 'Légumes' },
    'Quick & Easy': { es: 'Rápido y Fácil', en: 'Quick & Easy', fr: 'Rapide & Facile' },
    'Any': { es: 'Cualquiera', en: 'Any', fr: 'Tout' },

    // NEW CATEGORY KEYS
    'cat_meal': { es: 'Plato Principal', en: 'Meal', fr: 'Plat' },
    'cat_fish': { es: 'Pescado', en: 'Fish', fr: 'Poisson' },
    'cat_vegetable': { es: 'Verdura', en: 'Vegetable', fr: 'Légumes' },
    'cat_gluten_free': { es: 'Sin Gluten', en: 'Gluten-Free', fr: 'Sans Gluten' },
    'cat_carbs': { es: 'Carbohidratos', en: 'Carbs', fr: 'Féculents' },
    'cat_legume': { es: 'Legumbres', en: 'Legume', fr: 'Légumineuses' },
    'cat_dessert': { es: 'Postre', en: 'Dessert', fr: 'Dessert' },
    'cat_groups': { es: 'Grandes Grupos', en: 'Groups', fr: 'Grands Groupes' },
    'cat_in_advance': { es: 'Por Adelantado', en: 'In Advance', fr: 'À l\'avance' },
    'cat_freezer': { es: 'Congelable', en: 'Keep in Freezer', fr: 'Congélateur' },
    'cat_cold': { es: 'Plato Frío', en: 'Cold', fr: 'Froid' },
    'cat_breakfast': { es: 'Desayuno', en: 'Breakfast', fr: 'Petit Déj' },
    'cat_sauce': { es: 'Salsa', en: 'Sauce', fr: 'Sauce' },
    'cat_thermomix': { es: 'Thermomix', en: 'Thermomix', fr: 'Thermomix' },
    'cat_fruit': { es: 'Fruta', en: 'Fruit', fr: 'Fruits' },
    'cat_spicy': { es: 'Picante', en: 'Spicy', fr: 'Épicé' },
    'cat_festive': { es: 'Festivo', en: 'Festive', fr: 'Festif' },
    'cat_under30': { es: 'Menos de 30min', en: 'Under 30min', fr: 'Moins de 30min' },
    'cat_bbq': { es: 'Barbacoa', en: 'BBQ', fr: 'Barbecue' },
    'cat_cocktail': { es: 'Cóctel', en: 'Cocktail', fr: 'Cocktail' },

    // NEW SECTION SUGGESTIONS KEYS
    'section_starter': { es: 'Entrante', en: 'Starter', fr: 'Entrée' },
    'section_main_dish': { es: 'Plato Principal', en: 'Main Dish', fr: 'Plat Principal' },
    'section_first_plate': { es: 'Primer Plato', en: 'First Plate', fr: 'Premier Plat' },
    'section_second_plate': { es: 'Segundo Plato', en: 'Second Plate', fr: 'Second Plat' },
    'section_sides': { es: 'Acompañamiento', en: 'Sides', fr: 'Accompagnement' },
    'section_dessert': { es: 'Postre', en: 'Dessert', fr: 'Dessert' },
    'section_kids': { es: 'Niños', en: 'Kids', fr: 'Enfants' },
    'section_diet': { es: 'Dieta', en: 'Diet', fr: 'Régime' },
    'section_cheese': { es: 'Tabla de Quesos', en: 'Cheese Plate', fr: 'Plateau de fromages' },
    'section_aperitif': { es: 'Aperitivo', en: 'Aperitif', fr: 'Apéritif' },
    'section_cocktail': { es: 'Cóctel', en: 'Cocktail', fr: 'Cocktail' },

    // Days
    'monday': { es: 'Lunes', en: 'Monday', fr: 'Lundi' },
    'tuesday': { es: 'Martes', en: 'Tuesday', fr: 'Mardi' },
    'wednesday': { es: 'Miércoles', en: 'Wednesday', fr: 'Mercredi' },
    'thursday': { es: 'Jueves', en: 'Thursday', fr: 'Jeudi' },
    'friday': { es: 'Viernes', en: 'Friday', fr: 'Vendredi' },
    'saturday': { es: 'Sábado', en: 'Saturday', fr: 'Samedi' },
    'sunday': { es: 'Domingo', en: 'Sunday', fr: 'Dimanche' },

    // Meals
    'breakfast': { es: 'Desayuno', en: 'Breakfast', fr: 'Petit Déjeuner' },
    'lunch': { es: 'Almuerzo', en: 'Lunch', fr: 'Déjeuner' },
    'snack': { es: 'Merienda', en: 'Snack', fr: 'Goûter' },
    'dinner': { es: 'Cena', en: 'Dinner', fr: 'Dîner' },

    // Recipe Book
    'my_recipes': { es: 'Mis Recetas', en: 'My Recipes', fr: 'Mes Recettes' },
    'add_recipe': { es: 'Añadir Nueva Receta', en: 'Add New Recipe', fr: 'Ajouter una Recette' },
    'edit_recipe': { es: 'Editar Receta', en: 'Edit Recipe', fr: 'Modifier la Recette' },
    'recipe_name': { es: 'Nombre de la Receta', en: 'Recipe Name', fr: 'Nom de la Recette' },
    'description': { es: 'Descripción', en: 'Description', fr: 'Description' },
    'categories': { es: 'Categorías', en: 'Categories', fr: 'Catégories' },
    'ingredients': { es: 'Ingredientes', en: 'Ingredients', fr: 'Ingrédients' },
    'store': { es: 'Tienda', en: 'Store', fr: 'Magasin' },
    'store_placeholder': { es: 'Tienda (ej: Super, Frutería)', en: 'Store (e.g., Supermarket)', fr: 'Magasin (ex: Supermarché)' },
    'instructions': { es: 'Instructions', en: 'Instructions', fr: 'Instructions' },
    'manage_categories': { es: 'Gestionar Categorías', en: 'Manage Categories', fr: 'Gérer les Catégories' },
    'new_category': { es: 'Nueva Categoría', en: 'New Category', fr: 'Nouvelle Catégorie' },

    // Rules
    'rules_title': { es: 'Gestión de Reglas', en: 'Rules Management', fr: 'Gestion des Règles' },
    'rule_name': { es: 'Nombre', en: 'Name', fr: 'Nom' },
    'rule_prompt': { es: 'Contenido (Prompt)', en: 'Content (Prompt)', fr: 'Contenu (Prompt)' },
    
    // Generator
    'select_rules': { es: 'Selecciona tus reglas', en: 'Select your rules', fr: 'Sélectionnez vos règles' },
    'add_instructions': { es: 'Añadir instrucciones adicionales', en: 'Add additional instructions', fr: 'Ajouter des instructions supplémentaires' },
    'custom_instructions_placeholder': { es: 'Ej: Tenemos invitados el sábado...', en: 'Ex: We have guests on Saturday...', fr: 'Ex: Nous avons des invitados sábado...' },
    
    // Grocery List
    'grocery_list': { es: 'Lista de la Compra', en: 'Grocery List', fr: 'Liste de Courses' },
    'empty_list': { es: 'Tu lista está vacía', en: 'Your list is empty', fr: 'Votre liste est vide' },
    'uncategorized': { es: 'Sin Categoría', en: 'Uncategorized', fr: 'Non classé' },
    'item_count': { es: 'platos', en: 'dishes', fr: 'plats' },

    // Print
    'print_preview': { es: 'Vista Previa de Impresión', en: 'Print Preview', fr: 'Aperçu antes de la impresión' },
    'select_start_date': { es: 'Selecciona fecha de inicio', en: 'Select start date', fr: 'Sélectionnez la date de début' },
    'confirm_print': { es: 'Imprimir', en: 'Print', fr: 'Imprimir' },

    // Week View
    'week_notes_placeholder': { es: 'Notas de la semana (ej: Semana del 12 de Octubre)...', en: 'Week notes (e.g. Week of October 12th)...', fr: 'Notes de la semaine (ex: Semaine du 12 octobre)...' },
    'applied_rules': { es: 'Reglas aplicadas', en: 'Applied rules', fr: 'Règles appliquées' },
    'week_info': { es: 'Info Semana', en: 'Week Info', fr: 'Info Semaine' },
    'notes': { es: 'Notas', en: 'Notes', fr: 'Notes' },
    'manage_weeks': { es: 'Gestión de Semanas', en: 'Manage Weeks', fr: 'Gestion des Semaines' },
    'save_current_week': { es: 'Guardar Semana Actual', en: 'Save Current Week', fr: 'Enregistrer la Semaine Actuelle' },
    'saved_weeks': { es: 'Semanas Guardadas', en: 'Saved Weeks', fr: 'Semaines Enregistrées' },
    'week_name': { es: 'Nombre de la Semana', en: 'Week Name', fr: 'Nom de la Semaine' },
    'week_name_placeholder': { es: 'Ej: Menú Verano, Semana 42...', en: 'Ex: Summer Menu, Week 42...', fr: 'Ex: Menu Été, Semaine 42...' },

    // SubMealNameModal
    'add_section_title': { es: 'Añadir Nueva Sección', en: 'Add New Section', fr: 'Ajouter Nouvelle Section' },
    'section_name_prompt': { es: 'Dale un nombre a esta sección (ej: Primer Plato, Para los niños, Postre...).', en: 'Name this section (e.g., First Course, Kids, Dessert...).', fr: 'Nommez cette section (ex: Entrée, Enfants, Dessert...).' },
    'section_name_placeholder': { es: 'Nombre de la sección', en: 'Section Name', fr: 'Nom de la section' },
    'suggestions': { es: 'Sugerencias', en: 'Suggestions', fr: 'Suggestions' },
};

export const getCategoryColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return {
        bg: `hsl(${hue}, 70%, 20%)`,
        text: `hsl(${hue}, 80%, 80%)`
    };
};

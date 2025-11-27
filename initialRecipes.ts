
import { Dish } from './types';

export const initialRecipes: Dish[] = [
    {
        id: "1",
        name: "Tortilla Española",
        description: "Clásica tortilla de patatas y huevo, jugosa por dentro.",
        categories: ["cat_vegetable", "cat_meal", "cat_gluten_free"],
        ingredients: [
            { text: "huevos grandes", store: "Supermarket", quantity: 6 },
            { text: "Patatas (kg)", store: "Greengrocer", quantity: 1 },
            { text: "Cebolla grande", store: "Greengrocer", quantity: 1 },
            { text: "Aceite de oliva (ml)", store: "Supermarket", quantity: 250 },
            { text: "Sal (pizca)", store: "Supermarket", quantity: 1 }
        ],
        instructions: "1. Pelar y cortar las patatas en láminas finas. Cortar la cebolla en juliana.\n2. Freír las patatas y la cebolla en abundante aceite a fuego medio hasta que estén tiernas.\n3. Escurrir bien el aceite. Batir los huevos en un bol grande, añadir sal.\n4. Mezclar las patatas con el huevo batido.\n5. Cuajar la tortilla en una sartén a fuego medio por ambos lados."
    },
    {
        id: "2",
        name: "Paella de Marisco",
        description: "Un sabroso arroz con mariscos frescos, el plato icónico de Valencia.",
        categories: ["cat_fish", "cat_meal"],
        ingredients: [
            { text: "Arroz bomba (g)", store: "Supermarket", quantity: 400 },
            { text: "Gambones", store: "Fishmonger", quantity: 8 },
            { text: "Calamares (g)", "store": "Fishmonger", quantity: 200 },
            { text: "Mejillones (g)", "store": "Fishmonger", quantity: 250 },
            { text: "Pimiento rojo", "store": "Greengrocer", quantity: 1 },
            { text: "Dientes de ajo", "store": "Greengrocer", quantity: 2 },
            { text: "Tomate maduro", "store": "Greengrocer", quantity: 1 },
            { text: "Hebras de azafrán", "store": "Supermarket", quantity: 1 },
            { text: "Caldo de pescado (litros)", "store": "Supermarket", quantity: 1 }
        ],
        instructions: "1. Sofreír el pimiento y el ajo. Añadir los calamares y el tomate.\n2. Incorporar el arroz y el azafrán, nacarar durante un minuto.\n3. Verter el caldo de pescado caliente (el doble de volumen que de arroz).\n4. Cocer 10 min a fuego fuerte, luego 8 min a fuego bajo.\n5. Colocar los gambones y mejillones por encima en los últimos minutos.\n6. Dejar reposar 5 minutos tapada antes de servir."
    }
];

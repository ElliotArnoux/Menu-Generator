
import { GoogleGenAI, Type } from "@google/genai";
import { Dish, Day, AppLanguage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: 'The concise name of the dish.',
      },
      categories: {
        type: Type.ARRAY,
        description: "List of categories this dish belongs to (e.g., 'Meat', 'Vegetable').",
        items: { type: Type.STRING }
      },
      ingredients: {
        type: Type.ARRAY,
        description: "A list of ingredients for the dish.",
        items: {
            type: Type.OBJECT,
            properties: {
                text: { 
                    type: Type.STRING,
                    description: 'A single ingredient name (include unit if necessary, e.g. "Flour (grams)").'
                },
                quantity: {
                    type: Type.NUMBER,
                    description: 'The numeric quantity needed for a family of 4.'
                }
            },
            required: ['text']
        }
      }
    },
    required: ['name'],
  },
};

export const getMealSuggestions = async (
    category: string, 
    mealName: string, 
    language: AppLanguage, 
    availableCategories: string[] = [],
    customContext: string = ""
): Promise<Dish[]> => {
  try {
    const langNames = { es: 'Spanish', en: 'English', fr: 'French' };
    const langName = langNames[language];
    
    const catList = availableCategories.length > 0 ? `Use these categories if they apply: ${availableCategories.join(', ')}.` : '';

    const prompt = `Suggest 5 simple and family-friendly dish ideas for ${mealName} that fit the category "${category}". 
    Prioritize Iberian style cuisine (Spanish/Portuguese). 
    Include a list of ingredients for each dish with estimated numeric quantities for 4 people.
    Assign appropriate categories to each dish. ${catList}
    
    ADDITIONAL USER INSTRUCTIONS (Priority): ${customContext}

    IMPORTANT: The output JSON must be in ${langName}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const suggestions = JSON.parse(jsonText) as Dish[];
    return suggestions;
  } catch (error) {
    console.error("Error fetching meal suggestions:", error);
    return [
        {name: 'Error', ingredients: []}
    ];
  }
};

const fullWeekMenuSchema = {
    type: Type.ARRAY,
    description: "An array of 7 day objects, from Monday to Sunday.",
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Day of the week (e.g., 'Monday')." },
        meals: {
          type: Type.ARRAY,
          description: "An array of meal objects: Breakfast, Lunch, and Dinner.",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Meal name (e.g., 'Breakfast')." },
              subMeals: {
                type: Type.ARRAY,
                description: "An array of sub-meal objects for this meal.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "Sub-meal name (e.g., 'Primer Plato')." },
                        dish: {
                            type: Type.OBJECT,
                            nullable: true,
                            description: "The dish for the sub-meal. The entire object for this key should be JSON `null` if the meal is empty or skipped.",
                            properties: {
                              name: { type: Type.STRING, description: "Name of the dish." },
                              categories: {
                                type: Type.ARRAY,
                                description: "List of categories this dish belongs to.",
                                items: { type: Type.STRING }
                              },
                              ingredients: {
                                type: Type.ARRAY,
                                description: "List of ingredients.",
                                items: {
                                  type: Type.OBJECT,
                                  properties: {
                                    text: { type: Type.STRING, description: "A single ingredient name." },
                                    quantity: { type: Type.NUMBER, description: "Numeric quantity for 4 people." }
                                  },
                                  required: ['text']
                                }
                              }
                            },
                            required: ['name']
                        }
                    },
                    required: ['name', 'dish']
                }
              }
            },
            required: ['name', 'subMeals']
          }
        }
      },
      required: ['name', 'meals']
    }
  };


export const generateFullWeekMenu = async (rules: string, weekMenu: Day[], recipeBook: Dish[], language: AppLanguage, availableCategories: string[] = []): Promise<Day[]> => {
    try {
        const langNames = { es: 'Spanish', en: 'English', fr: 'French' };
        const langName = langNames[language];
        
        const catList = availableCategories.length > 0 ? `Use these categories if they apply: ${availableCategories.join(', ')}.` : '';

        // Build a strict structure description
        let structureDescription = '';
        weekMenu.forEach(day => {
            structureDescription += `Day: ${day.name}\n`;
            if (day.meals.length === 0) {
                 structureDescription += `  (No meals, return empty meals array)\n`;
            }
            day.meals.forEach(meal => {
                structureDescription += `  Meal: "${meal.name}"\n`;
                meal.subMeals.forEach(sm => {
                    if (sm.dish) {
                        structureDescription += `    - Section "${sm.name}": [SKIP] Already filled with "${sm.dish.name}". Return null for dish.\n`;
                    } else {
                        structureDescription += `    - Section "${sm.name}": [GENERATE] Needs a dish.\n`;
                    }
                });
            });
        });

        const myRecipesContext = recipeBook.length > 0 
            ? `\nYOU HAVE PRIORITY to use these user's personal recipes IF they fit the rules:\n${recipeBook.map(d => `- ${d.name}`).join('\n')}\n`
            : '';

        const prompt = `
Generate a meal plan by filling ONLY the empty slots in the provided schedule.
Meals should be simple, family-friendly, and varied, with a focus on Iberian style cuisine.

Follow these specific user rules: "${rules}".

${myRecipesContext}

STRUCTURE INSTRUCTIONS (STRICT):
${structureDescription}

1. You must output a JSON array representing the week.
2. The structure of Days, Meals, and Sub-meals in your JSON MUST MATCH EXACTLY the structure described above.
3. DO NOT add meals that are not listed.
4. If a section is marked [SKIP], the 'dish' field MUST be null.
5. If a section is marked [GENERATE], provide a dish object with name, categories, and ingredients (including estimated numeric quantity for 4 people).

${catList}

Output as valid JSON array strictly adhering to schema.
EXTREMELY IMPORTANT: The content (Dish names, ingredients) MUST BE IN ${langName}.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: fullWeekMenuSchema,
            },
        });

        const jsonText = response.text.trim();
        const generatedMenu = JSON.parse(jsonText);

        if (!Array.isArray(generatedMenu) || generatedMenu.length !== 7) {
            throw new Error("Invalid menu format received from API.");
        }
        
        return generatedMenu as Day[];

    } catch (error) {
        console.error("Error generating full week menu:", error);
        throw new Error("Could not generate week menu. The model might be overloaded. Please try again.");
    }
};

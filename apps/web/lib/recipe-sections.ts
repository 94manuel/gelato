import { BalanceSummary, IngredientDefinition, RecipeIngredientInput, RecipeInput, RecipeIngredientSection } from "@gelato/gelato-core";

export interface RecipeSectionSummary {
  baseWeightGrams: number;
  flavorWeightGrams: number;
  basePercent: number;
  flavorPercent: number;
}

const FLAVOR_KEYWORDS = [
  "cafe",
  "coffee",
  "lulo",
  "chocolate",
  "cacao",
  "vainilla",
  "vanilla",
  "fresa",
  "strawberry",
  "mango",
  "pistacho",
  "pistachio",
  "fruta",
  "fruit",
  "maracuya",
  "passion",
  "limon",
  "lemon",
  "naranja",
  "orange"
];

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function percent(valueGrams: number, totalGrams: number): number {
  if (!Number.isFinite(totalGrams) || totalGrams <= 0) return 0;
  return round((valueGrams / totalGrams) * 100, 2);
}

function inferSection(
  item: RecipeIngredientInput,
  catalog: IngredientDefinition[] = []
): RecipeIngredientSection {
  if (item.section === "base" || item.section === "flavor") return item.section;

  const catalogIngredient = catalog.find((ingredient) => ingredient.id === item.ingredientId);
  if (catalogIngredient?.category === "flavor") return "flavor";

  const value = `${item.ingredientId ?? ""} ${item.name ?? ""}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return FLAVOR_KEYWORDS.some((keyword) => value.includes(keyword)) ? "flavor" : "base";
}

export function calculateRecipeSectionSummary(
  recipe: RecipeInput,
  balance: Partial<BalanceSummary>,
  catalog: IngredientDefinition[] = []
): RecipeSectionSummary {
  if (balance.sections) {
    return {
      baseWeightGrams: Number(balance.sections.baseWeightGrams ?? 0),
      flavorWeightGrams: Number(balance.sections.flavorWeightGrams ?? 0),
      basePercent: Number(balance.sections.basePercent ?? 0),
      flavorPercent: Number(balance.sections.flavorPercent ?? 0)
    };
  }

  const targetWeightGrams = Number(balance.totalWeightGrams || recipe.targetWeightGrams || 1000);
  const formulaWeightGrams = recipe.ingredients.reduce((sum, item) => sum + Number(item.grams || 0), 0);
  const scaleFactor = Number(balance.scaleFactor || (formulaWeightGrams > 0 ? targetWeightGrams / formulaWeightGrams : 1));

  let baseWeightGrams = 0;
  let flavorWeightGrams = 0;

  recipe.ingredients.forEach((item, index) => {
    const scaledGrams = Number(balance.scaledIngredients?.[index]?.scaledGrams ?? Number(item.grams || 0) * scaleFactor);
    if (inferSection(item, catalog) === "flavor") flavorWeightGrams += scaledGrams;
    else baseWeightGrams += scaledGrams;
  });

  return {
    baseWeightGrams: round(baseWeightGrams, 2),
    flavorWeightGrams: round(flavorWeightGrams, 2),
    basePercent: percent(baseWeightGrams, targetWeightGrams),
    flavorPercent: percent(flavorWeightGrams, targetWeightGrams)
  };
}

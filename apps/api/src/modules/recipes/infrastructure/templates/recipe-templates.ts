import type { RecipeInput, RecipeIngredientInput, RecipeType } from "@gelato/gelato-core";

const DEFAULT_BASE_MILK = [
  { ingredientId: "leche-entera", grams: 545, section: "base" as const },
  { ingredientId: "crema-35", grams: 140, section: "base" as const },
  { ingredientId: "leche-polvo-descremada", grams: 70, section: "base" as const },
  { ingredientId: "sacarosa", grams: 125, section: "base" as const },
  { ingredientId: "dextrosa", grams: 55, section: "base" as const },
  { ingredientId: "neutro-comercial", grams: 5, section: "base" as const }
];

function withBase(name: string, type: RecipeType, targetWeightGrams: number, base: RecipeIngredientInput[], flavor: RecipeIngredientInput[]): RecipeInput {
  return { name, type, targetWeightGrams, ingredients: [...base, ...flavor] };
}

export function localRecipeTemplateForType(type: RecipeType, targetWeightGrams = 1000): RecipeInput {
  switch (type) {
    case "fiordilatte":
      return withBase("Gelato fiordilatte balanceado", type, targetWeightGrams, [
        { ingredientId: "leche-entera", grams: 570, section: "base" },
        { ingredientId: "crema-35", grams: 160, section: "base" },
        { ingredientId: "leche-polvo-descremada", grams: 80, section: "base" },
        { ingredientId: "sacarosa", grams: 125, section: "base" },
        { ingredientId: "dextrosa", grams: 60, section: "base" },
        { ingredientId: "neutro-comercial", grams: 5, section: "base" }
      ], []);
    case "vanilla":
      return withBase("Gelato de vainilla balanceado", type, targetWeightGrams, DEFAULT_BASE_MILK, [
        { ingredientId: "vainilla-extracto", grams: 60, section: "flavor" }
      ]);
    case "coffee":
      return withBase("Gelato de café balanceado", type, targetWeightGrams, [
        { ingredientId: "leche-entera", grams: 520, section: "base" },
        { ingredientId: "crema-35", grams: 150, section: "base" },
        { ingredientId: "leche-polvo-descremada", grams: 70, section: "base" },
        { ingredientId: "sacarosa", grams: 120, section: "base" },
        { ingredientId: "dextrosa", grams: 55, section: "base" },
        { ingredientId: "neutro-comercial", grams: 5, section: "base" }
      ], [
        { ingredientId: "cafe-extracto", grams: 80, section: "flavor" }
      ]);
    case "chocolate":
      return withBase("Gelato de chocolate balanceado", type, targetWeightGrams, [
        { ingredientId: "leche-entera", grams: 500, section: "base" },
        { ingredientId: "crema-35", grams: 130, section: "base" },
        { ingredientId: "leche-polvo-descremada", grams: 55, section: "base" },
        { ingredientId: "sacarosa", grams: 110, section: "base" },
        { ingredientId: "dextrosa", grams: 50, section: "base" },
        { ingredientId: "neutro-comercial", grams: 5, section: "base" }
      ], [
        { ingredientId: "cacao-polvo", grams: 65, section: "flavor" },
        { ingredientId: "chocolate-oscuro-70", grams: 85, section: "flavor" }
      ]);
    case "fruit":
      return withBase("Gelato de fruta con leche balanceado", type, targetWeightGrams, [
        { ingredientId: "leche-entera", grams: 405, section: "base" },
        { ingredientId: "crema-35", grams: 80, section: "base" },
        { ingredientId: "leche-polvo-descremada", grams: 55, section: "base" },
        { ingredientId: "sacarosa", grams: 125, section: "base" },
        { ingredientId: "dextrosa", grams: 70, section: "base" },
        { ingredientId: "neutro-comercial", grams: 5, section: "base" }
      ], [
        { ingredientId: "fruta-pulpa", grams: 260, section: "flavor" }
      ]);
    case "lulo":
      return withBase("Gelato de lulo con leche balanceado", type, targetWeightGrams, [
        { ingredientId: "leche-entera", grams: 380, section: "base" },
        { ingredientId: "crema-35", grams: 75, section: "base" },
        { ingredientId: "leche-polvo-descremada", grams: 55, section: "base" },
        { ingredientId: "sacarosa", grams: 135, section: "base" },
        { ingredientId: "dextrosa", grams: 80, section: "base" },
        { ingredientId: "neutro-comercial", grams: 6, section: "base" }
      ], [
        { ingredientId: "pulpa-lulo", grams: 269, section: "flavor" }
      ]);
    case "sorbet":
      return withBase("Sorbete de fruta balanceado", type, targetWeightGrams, [
        { ingredientId: "agua", grams: 530, section: "base" },
        { ingredientId: "sacarosa", grams: 150, section: "base" },
        { ingredientId: "dextrosa", grams: 75, section: "base" },
        { ingredientId: "glucosa-jarabe-40de", grams: 45, section: "base" },
        { ingredientId: "neutro-comercial", grams: 6, section: "base" },
        { ingredientId: "inulina", grams: 24, section: "base" }
      ], [
        { ingredientId: "pulpa-mango", grams: 170, section: "flavor" }
      ]);
    case "yogurt":
      return withBase("Gelato de yogur balanceado", type, targetWeightGrams, [
        { ingredientId: "yogurt-natural", grams: 430, section: "base" },
        { ingredientId: "leche-entera", grams: 245, section: "base" },
        { ingredientId: "crema-35", grams: 90, section: "base" },
        { ingredientId: "leche-polvo-descremada", grams: 45, section: "base" },
        { ingredientId: "sacarosa", grams: 125, section: "base" },
        { ingredientId: "dextrosa", grams: 60, section: "base" },
        { ingredientId: "neutro-comercial", grams: 5, section: "base" }
      ], []);
    case "nut":
      return withBase("Gelato de pistacho balanceado", type, targetWeightGrams, [
        { ingredientId: "leche-entera", grams: 500, section: "base" },
        { ingredientId: "crema-35", grams: 95, section: "base" },
        { ingredientId: "leche-polvo-descremada", grams: 55, section: "base" },
        { ingredientId: "sacarosa", grams: 105, section: "base" },
        { ingredientId: "dextrosa", grams: 55, section: "base" },
        { ingredientId: "neutro-comercial", grams: 5, section: "base" }
      ], [
        { ingredientId: "pasta-pistacho", grams: 185, section: "flavor" }
      ]);
    case "vegan":
      return withBase("Gelato vegano base coco balanceado", type, targetWeightGrams, [
        { ingredientId: "agua", grams: 390, section: "base" },
        { ingredientId: "leche-coco", grams: 315, section: "base" },
        { ingredientId: "grasa-coco", grams: 25, section: "base" },
        { ingredientId: "sacarosa", grams: 120, section: "base" },
        { ingredientId: "dextrosa", grams: 65, section: "base" },
        { ingredientId: "inulina", grams: 45, section: "base" },
        { ingredientId: "neutro-comercial", grams: 5, section: "base" }
      ], [
        { ingredientId: "vainilla-extracto", grams: 35, section: "flavor" }
      ]);
    case "milk":
    default:
      return withBase("Gelato base leche balanceado", "milk", targetWeightGrams, [
        { ingredientId: "leche-entera", grams: 560, section: "base" },
        { ingredientId: "crema-35", grams: 150, section: "base" },
        { ingredientId: "leche-polvo-descremada", grams: 80, section: "base" },
        { ingredientId: "sacarosa", grams: 140, section: "base" },
        { ingredientId: "dextrosa", grams: 65, section: "base" },
        { ingredientId: "neutro-comercial", grams: 5, section: "base" }
      ], []);
  }
}

export function localRecipeForCoffeeGelato(targetWeightGrams = 1000): RecipeInput {
  return localRecipeTemplateForType("coffee", targetWeightGrams);
}

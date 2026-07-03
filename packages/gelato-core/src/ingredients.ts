import { IngredientDefinition, RecipeIngredientSection } from "./types";

export const ZERO_COMPOSITION = {
  water: 0,
  fat: 0,
  milkSolidsNonFat: 0,
  sucrose: 0,
  dextrose: 0,
  glucose: 0,
  fructose: 0,
  lactose: 0,
  stabilizer: 0,
  otherSolids: 0,
  costCOPPerKg: 0
};

export const DEFAULT_INGREDIENTS: IngredientDefinition[] = [
  {
    id: "leche-entera",
    name: "Leche entera",
    category: "dairy",
    composition: { water: 88, fat: 3.2, milkSolidsNonFat: 4, lactose: 4.8, sucrose: 0, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 0, costCOPPerKg: 4500 }
  },
  {
    id: "crema-35",
    name: "Crema de leche 35%",
    category: "fat",
    composition: { water: 59, fat: 35, milkSolidsNonFat: 2.5, lactose: 3, sucrose: 0, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 0.5, costCOPPerKg: 18500 }
  },
  {
    id: "leche-polvo-descremada",
    name: "Leche en polvo descremada",
    category: "dairy",
    composition: { water: 4, fat: 1, milkSolidsNonFat: 42, lactose: 50, sucrose: 0, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 3, costCOPPerKg: 26000 }
  },
  {
    id: "yogurt-natural",
    name: "Yogur natural",
    category: "dairy",
    composition: { water: 84, fat: 3.2, milkSolidsNonFat: 6, lactose: 4.2, sucrose: 0, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 2.6, costCOPPerKg: 9000 }
  },
  {
    id: "leche-coco",
    name: "Leche de coco",
    category: "fat",
    composition: { water: 78, fat: 17, milkSolidsNonFat: 0, lactose: 0, sucrose: 1.5, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 3.5, costCOPPerKg: 14500 }
  },
  {
    id: "grasa-coco",
    name: "Grasa de coco refinada",
    category: "fat",
    composition: { water: 0, fat: 100, milkSolidsNonFat: 0, lactose: 0, sucrose: 0, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 0, costCOPPerKg: 23000 }
  },
  {
    id: "sacarosa",
    name: "Azúcar / sacarosa",
    category: "sugar",
    composition: { water: 0, fat: 0, milkSolidsNonFat: 0, lactose: 0, sucrose: 100, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 0, costCOPPerKg: 4200 }
  },
  {
    id: "dextrosa",
    name: "Dextrosa monohidratada",
    category: "sugar",
    composition: { water: 8, fat: 0, milkSolidsNonFat: 0, lactose: 0, sucrose: 0, dextrose: 92, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 0, costCOPPerKg: 8500 }
  },
  {
    id: "glucosa-jarabe-40de",
    name: "Jarabe de glucosa 40 DE",
    category: "sugar",
    composition: { water: 20, fat: 0, milkSolidsNonFat: 0, lactose: 0, sucrose: 0, dextrose: 0, glucose: 80, fructose: 0, stabilizer: 0, otherSolids: 0, costCOPPerKg: 7200 }
  },
  {
    id: "neutro-comercial",
    name: "Neutro comercial",
    category: "neutral",
    composition: { water: 2, fat: 0, milkSolidsNonFat: 0, lactose: 0, sucrose: 0, dextrose: 75, glucose: 0, fructose: 0, stabilizer: 20, otherSolids: 3, costCOPPerKg: 42000 }
  },
  {
    id: "agua",
    name: "Agua",
    category: "other",
    composition: { water: 100, fat: 0, milkSolidsNonFat: 0, lactose: 0, sucrose: 0, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 0, costCOPPerKg: 0 }
  },
  {
    id: "inulina",
    name: "Inulina / fibra soluble",
    category: "other",
    composition: { water: 4, fat: 0, milkSolidsNonFat: 0, lactose: 0, sucrose: 0, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 96, costCOPPerKg: 30000 }
  },
  {
    id: "goma-guar",
    name: "Goma guar",
    category: "neutral",
    composition: { water: 8, fat: 0, milkSolidsNonFat: 0, lactose: 0, sucrose: 0, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 92, otherSolids: 0, costCOPPerKg: 65000 }
  },
  {
    id: "cmc",
    name: "CMC",
    category: "neutral",
    composition: { water: 8, fat: 0, milkSolidsNonFat: 0, lactose: 0, sucrose: 0, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 92, otherSolids: 0, costCOPPerKg: 52000 }
  },
  {
    id: "mono-digliceridos",
    name: "Mono y diglicéridos",
    category: "neutral",
    composition: { water: 1, fat: 99, milkSolidsNonFat: 0, lactose: 0, sucrose: 0, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 0, costCOPPerKg: 70000 }
  },
  {
    id: "cafe-extracto",
    name: "Extracto de café fuerte",
    category: "flavor",
    composition: { water: 98, fat: 0, milkSolidsNonFat: 0, lactose: 0, sucrose: 0, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 2, costCOPPerKg: 12000 }
  },
  {
    id: "cafe-instantaneo",
    name: "Café instantáneo",
    category: "flavor",
    composition: { water: 4, fat: 0, milkSolidsNonFat: 0, lactose: 0, sucrose: 0, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 96, costCOPPerKg: 85000 }
  },
  {
    id: "vainilla-extracto",
    name: "Extracto de vainilla",
    category: "flavor",
    composition: { water: 65, fat: 0, milkSolidsNonFat: 0, lactose: 0, sucrose: 0, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 35, costCOPPerKg: 95000 }
  },
  {
    id: "cacao-polvo",
    name: "Cacao en polvo",
    category: "flavor",
    composition: { water: 5, fat: 11, milkSolidsNonFat: 0, lactose: 0, sucrose: 0, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 84, costCOPPerKg: 36000 }
  },
  {
    id: "chocolate-oscuro-70",
    name: "Chocolate oscuro 70%",
    category: "flavor",
    composition: { water: 1, fat: 39, milkSolidsNonFat: 0, lactose: 0, sucrose: 28, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 32, costCOPPerKg: 48000 }
  },
  {
    id: "fruta-pulpa",
    name: "Pulpa de fruta promedio",
    category: "flavor",
    composition: { water: 86, fat: 0.2, milkSolidsNonFat: 0, lactose: 0, sucrose: 2, dextrose: 2, glucose: 0, fructose: 5, stabilizer: 0, otherSolids: 4.8, costCOPPerKg: 9000 }
  },
  {
    id: "pulpa-lulo",
    name: "Pulpa de lulo",
    category: "flavor",
    composition: { water: 90, fat: 0.2, milkSolidsNonFat: 0, lactose: 0, sucrose: 1.5, dextrose: 1.8, glucose: 0, fructose: 3.5, stabilizer: 0, otherSolids: 3, costCOPPerKg: 11500 }
  },
  {
    id: "pulpa-fresa",
    name: "Pulpa de fresa",
    category: "flavor",
    composition: { water: 89, fat: 0.2, milkSolidsNonFat: 0, lactose: 0, sucrose: 2, dextrose: 2.2, glucose: 0, fructose: 4, stabilizer: 0, otherSolids: 2.6, costCOPPerKg: 9800 }
  },
  {
    id: "pulpa-mango",
    name: "Pulpa de mango",
    category: "flavor",
    composition: { water: 82, fat: 0.3, milkSolidsNonFat: 0, lactose: 0, sucrose: 5, dextrose: 1.5, glucose: 0, fructose: 5.5, stabilizer: 0, otherSolids: 5.7, costCOPPerKg: 10500 }
  },
  {
    id: "pasta-pistacho",
    name: "Pasta de pistacho",
    category: "flavor",
    composition: { water: 2, fat: 48, milkSolidsNonFat: 0, lactose: 0, sucrose: 8, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 42, costCOPPerKg: 135000 }
  },
  {
    id: "pasta-avellana",
    name: "Pasta de avellana",
    category: "flavor",
    composition: { water: 2, fat: 55, milkSolidsNonFat: 0, lactose: 0, sucrose: 6, dextrose: 0, glucose: 0, fructose: 0, stabilizer: 0, otherSolids: 37, costCOPPerKg: 88000 }
  }
];

export function getIngredientById(id: string): IngredientDefinition | undefined {
  return DEFAULT_INGREDIENTS.find((ingredient) => ingredient.id === id);
}

export function inferIngredientSection(ingredientId: string): RecipeIngredientSection {
  const ingredient = getIngredientById(ingredientId);
  return ingredient?.category === "flavor" ? "flavor" : "base";
}

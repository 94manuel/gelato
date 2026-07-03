import { RecipeType, RecipeTypeDefinition, TargetRange } from "./types";

export const RECIPE_TYPE_OPTIONS: RecipeTypeDefinition[] = [
  { id: "milk", label: "Base leche", group: "leche", description: "Base blanca para sabores lácteos. Sirve como punto de partida para café, vainilla o cremas." },
  { id: "fiordilatte", label: "Fiordilatte / crema", group: "leche", description: "Gelato de leche y crema, sin saborizante fuerte. Requiere balance fino de grasa y sólidos lácteos." },
  { id: "vanilla", label: "Vainilla", group: "leche", description: "Base láctea con vainilla; el saborizante no aporta muchos sólidos ni agua." },
  { id: "coffee", label: "Café", group: "leche", description: "Base láctea con extracto o café soluble. Controla agua si usas café líquido." },
  { id: "chocolate", label: "Chocolate", group: "leche", description: "Más sólidos y grasa por cacao/cobertura. Requiere cuidar dulzor y textura." },
  { id: "fruit", label: "Fruta con leche", group: "fruta", description: "Helado lácteo con pulpa de fruta. Debe compensar el agua y azúcar natural de la fruta." },
  { id: "lulo", label: "Lulo con leche", group: "fruta", description: "Fruta ácida colombiana; conviene controlar agua, azúcar y posible separación por acidez." },
  { id: "sorbet", label: "Sorbete de fruta", group: "fruta", description: "Sin lácteos. Depende de agua, fruta, azúcares, PAC y neutro para textura." },
  { id: "yogurt", label: "Yogur", group: "especial", description: "Base láctea ácida. Tiene sólidos y lactosa del yogur; requiere balance de dulzor y grasa." },
  { id: "nut", label: "Frutos secos / pistacho", group: "especial", description: "Incluye pastas grasas de frutos secos. Hay que ajustar crema y azúcares." },
  { id: "vegan", label: "Vegano / base vegetal", group: "vegano", description: "Sin lácteos; usa bebidas vegetales, grasas vegetales, azúcares y fibras para cuerpo." }
];

export const TARGET_RANGES: Record<RecipeType, TargetRange> = {
  milk: {
    totalSolids: [36, 42],
    fat: [6, 9],
    milkSolidsNonFat: [8, 13.5],
    totalSugars: [20, 28],
    lactose: [3, 7.5],
    stabilizer: [0.10, 0.55],
    pac: [24, 34],
    pod: [16, 22]
  },
  fiordilatte: {
    totalSolids: [36, 42],
    fat: [6.5, 9.5],
    milkSolidsNonFat: [8, 13.5],
    totalSugars: [20, 27],
    lactose: [3, 7.5],
    stabilizer: [0.10, 0.55],
    pac: [24, 34],
    pod: [16, 22]
  },
  vanilla: {
    totalSolids: [36, 42],
    fat: [6, 9],
    milkSolidsNonFat: [8, 13.5],
    totalSugars: [20, 27],
    lactose: [3, 7.5],
    stabilizer: [0.10, 0.55],
    pac: [24, 34],
    pod: [16, 22]
  },
  coffee: {
    totalSolids: [36, 42],
    fat: [6, 9],
    milkSolidsNonFat: [8, 13.5],
    totalSugars: [20, 28],
    lactose: [3, 7.5],
    stabilizer: [0.10, 0.60],
    pac: [24, 34],
    pod: [16, 22]
  },
  chocolate: {
    totalSolids: [38, 49],
    fat: [7, 11],
    milkSolidsNonFat: [7, 11],
    totalSugars: [18, 27],
    lactose: [3, 7],
    stabilizer: [0.10, 0.60],
    pac: [23, 31],
    pod: [16, 23]
  },
  fruit: {
    totalSolids: [30, 37],
    fat: [3, 7],
    milkSolidsNonFat: [4, 9.5],
    totalSugars: [18, 29],
    lactose: [1.5, 5.5],
    stabilizer: [0.10, 0.65],
    pac: [25, 35],
    pod: [18, 27]
  },
  lulo: {
    totalSolids: [30, 38],
    fat: [3, 7],
    milkSolidsNonFat: [4, 9],
    totalSugars: [18, 29],
    lactose: [1.5, 5.5],
    stabilizer: [0.10, 0.70],
    pac: [26, 37],
    pod: [18, 27]
  },
  sorbet: {
    totalSolids: [28, 34],
    fat: [0, 1],
    milkSolidsNonFat: [0, 1],
    totalSugars: [22, 32],
    lactose: [0, 0.5],
    stabilizer: [0.10, 0.70],
    pac: [28, 38],
    pod: [20, 30]
  },
  yogurt: {
    totalSolids: [34, 41],
    fat: [3.5, 7.5],
    milkSolidsNonFat: [7, 12],
    totalSugars: [17, 24],
    lactose: [3, 7.5],
    stabilizer: [0.10, 0.65],
    pac: [25, 34],
    pod: [17, 24]
  },
  nut: {
    totalSolids: [38, 50],
    fat: [8, 14],
    milkSolidsNonFat: [6, 10.5],
    totalSugars: [15, 25],
    lactose: [2.5, 6],
    stabilizer: [0.10, 0.60],
    pac: [23, 32],
    pod: [15, 22]
  },
  vegan: {
    totalSolids: [32, 40],
    fat: [5, 10],
    milkSolidsNonFat: [0, 1],
    totalSugars: [17, 25],
    lactose: [0, 0.5],
    stabilizer: [0.10, 0.75],
    pac: [24, 35],
    pod: [16, 26]
  }
};

export function getRecipeTypeLabel(type: RecipeType): string {
  return RECIPE_TYPE_OPTIONS.find((item) => item.id === type)?.label ?? type;
}

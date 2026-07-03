import type { RecipeType, RecipeTypeDefinition } from "@gelato/gelato-core";

export const WEB_RECIPE_TYPE_OPTIONS: RecipeTypeDefinition[] = [
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

export function getWebRecipeTypeInfo(type: RecipeType): RecipeTypeDefinition {
  return WEB_RECIPE_TYPE_OPTIONS.find((item) => item.id === type) ?? WEB_RECIPE_TYPE_OPTIONS[0];
}

export function getWebRecipeTypeLabel(type: RecipeType): string {
  return getWebRecipeTypeInfo(type).label;
}

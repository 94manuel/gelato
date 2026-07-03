import {
  BalanceStatus,
  BalanceSummary,
  IngredientComposition,
  MetricResult,
  NeutralFormulaInput,
  NeutralFormulaResult,
  RecipeInput,
  RecipeIngredientInput,
  RecipeType,
  TargetRange
} from "./types";
import { getIngredientById, inferIngredientSection, ZERO_COMPOSITION } from "./ingredients";
import { TARGET_RANGES } from "./targets";

const PAC_FACTORS = {
  sucrose: 1.0,
  dextrose: 1.9,
  glucose: 1.1,
  fructose: 1.9,
  lactose: 1.0
};

const POD_FACTORS = {
  sucrose: 1.0,
  dextrose: 0.7,
  glucose: 0.45,
  fructose: 1.7,
  lactose: 0.16
};

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function emptyComposition(): IngredientComposition {
  return { ...ZERO_COMPOSITION };
}

function addComposition(target: IngredientComposition, composition: IngredientComposition, grams: number): IngredientComposition {
  const keys: Array<keyof IngredientComposition> = [
    "water",
    "fat",
    "milkSolidsNonFat",
    "sucrose",
    "dextrose",
    "glucose",
    "fructose",
    "lactose",
    "stabilizer",
    "otherSolids"
  ];
  keys.forEach((key) => {
    target[key] = Number(target[key] ?? 0) + grams * Number(composition[key] ?? 0) / 100;
  });
  target.costCOPPerKg = Number(target.costCOPPerKg ?? 0) + grams * Number(composition.costCOPPerKg ?? 0) / 1000;
  return target;
}

function percent(valueGrams: number, totalGrams: number): number {
  if (!Number.isFinite(totalGrams) || totalGrams <= 0) return 0;
  return round((valueGrams / totalGrams) * 100, 2);
}

function metric(key: string, label: string, value: number, range: [number, number], unit: MetricResult["unit"]): MetricResult {
  const [min, max] = range;
  const tolerance = Math.max((max - min) * 0.08, 0.12);
  let status: BalanceStatus = "ok";
  let message = "Dentro del rango técnico.";

  if (value < min || value > max) {
    const nearLow = value >= min - tolerance && value < min;
    const nearHigh = value <= max + tolerance && value > max;
    status = nearLow || nearHigh ? "warning" : "error";
    message = value < min
      ? `Falta ${round(min - value)}${unit}. Debe subir.`
      : `Sobran ${round(value - max)}${unit}. Debe bajar.`;
  }

  return { key, label, value: round(value, 2), min, max, unit, status, message };
}

function calculateScore(metrics: MetricResult[]): number {
  if (metrics.length === 0) return 0;
  const penalties = metrics.reduce((sum, item) => {
    if (item.status === "error") return sum + 18;
    if (item.status === "warning") return sum + 7;
    return sum;
  }, 0);
  return Math.max(0, Math.min(100, 100 - penalties));
}

function overallStatus(metrics: MetricResult[]): BalanceStatus {
  if (metrics.some((item) => item.status === "error")) return "error";
  if (metrics.some((item) => item.status === "warning")) return "warning";
  return "ok";
}

function buildRecommendations(metrics: MetricResult[], ranges: TargetRange): string[] {
  const byKey = Object.fromEntries(metrics.map((item) => [item.key, item]));
  const recommendations: string[] = [];

  if (byKey.totalSolids?.status !== "ok") {
    recommendations.push(byKey.totalSolids.value < ranges.totalSolids[0]
      ? "Sube sólidos: agrega leche en polvo, fibra soluble, cacao, fruta concentrada o reduce agua/extractos líquidos."
      : "Baja sólidos: reduce leche en polvo, azúcares o ingredientes secos; aumenta leche/agua según el tipo de receta.");
  }
  if (byKey.fat?.status !== "ok") {
    recommendations.push(byKey.fat.value < ranges.fat[0]
      ? "Sube grasa: aumenta crema, pasta de frutos secos o una grasa compatible con el tipo de gelato."
      : "Baja grasa: reduce crema, chocolate, pasta de frutos secos o grasa vegetal.");
  }
  if (byKey.milkSolidsNonFat?.status !== "ok") {
    recommendations.push(byKey.milkSolidsNonFat.value < ranges.milkSolidsNonFat[0]
      ? "Sube sólidos lácteos no grasos: agrega leche en polvo descremada o ajusta la base láctea."
      : "Baja sólidos lácteos: reduce leche en polvo o reemplaza parte de leche por agua si el tipo de receta lo permite.");
  }
  if (byKey.totalSugars?.status !== "ok") {
    recommendations.push(byKey.totalSugars.value < ranges.totalSugars[0]
      ? "Sube azúcares para mejorar textura y punto de congelación."
      : "Baja azúcares; prioriza reducir sacarosa o dextrosa según el PAC/POD.");
  }
  if (byKey.pac?.status !== "ok") {
    recommendations.push(byKey.pac.value < ranges.pac[0]
      ? "PAC bajo: el gelato puede quedar duro; sube dextrosa, fructosa natural de fruta o jarabe de glucosa."
      : "PAC alto: el gelato puede quedar blando; reduce dextrosa/fructosa o sube sólidos no anticongelantes.");
  }
  if (byKey.pod?.status !== "ok") {
    recommendations.push(byKey.pod.value < ranges.pod[0]
      ? "POD bajo: faltará dulzor; sube sacarosa o una fuente con mayor poder endulzante."
      : "POD alto: quedará muy dulce; reduce sacarosa/fructosa o compensa con sólidos no dulces.");
  }
  if (byKey.stabilizer?.status !== "ok") {
    recommendations.push(byKey.stabilizer.value < ranges.stabilizer[0]
      ? "Neutro bajo: puede faltar cuerpo, retención de agua y resistencia en vitrina."
      : "Neutro alto: puede generar textura gomosa; reduce dosis del neutro o estabilizantes activos.");
  }
  if (byKey.lactose?.status !== "ok" && byKey.lactose.value > ranges.lactose[1]) {
    recommendations.push("Lactosa alta: reduce leche en polvo para evitar textura arenosa/cristalización de lactosa.");
  }

  if (recommendations.length === 0) {
    recommendations.push("La receta está balanceada en los indicadores principales. Valida sabor, maduración, abatimiento y comportamiento real en vitrina.");
  }
  return recommendations;
}

function normalizeIngredient(item: RecipeIngredientInput): RecipeIngredientInput {
  return {
    ...item,
    section: item.section ?? inferIngredientSection(item.ingredientId)
  };
}

export function calculateRecipeBalance(input: RecipeInput): BalanceSummary {
  const targetWeight = Number(input.targetWeightGrams || 0);
  const safeTargetWeight = targetWeight > 0 ? targetWeight : 1000;
  const normalizedIngredients = input.ingredients.map(normalizeIngredient);
  const originalTotalWeight = normalizedIngredients.reduce((sum, item) => sum + Number(item.grams || 0), 0);
  const scaleFactor = originalTotalWeight > 0 ? safeTargetWeight / originalTotalWeight : 1;
  const scaledIngredients = normalizedIngredients.map((item) => {
    const scaledGrams = Number(item.grams || 0) * scaleFactor;
    return {
      ...item,
      scaledGrams: round(scaledGrams, 2),
      percent: percent(scaledGrams, safeTargetWeight)
    };
  });

  const totals = emptyComposition();
  let baseWeightGrams = 0;
  let flavorWeightGrams = 0;

  scaledIngredients.forEach((item) => {
    if (item.section === "flavor") flavorWeightGrams += item.scaledGrams;
    else baseWeightGrams += item.scaledGrams;

    const definition = item.composition ? { composition: item.composition } : getIngredientById(item.ingredientId);
    if (!definition) return;
    addComposition(totals, definition.composition, item.scaledGrams);
  });

  const totalSugars = totals.sucrose + totals.dextrose + totals.glucose + totals.fructose + totals.lactose;
  const totalSolids = totals.fat + totals.milkSolidsNonFat + totalSugars + totals.stabilizer + totals.otherSolids;
  const pac = (
    totals.sucrose * PAC_FACTORS.sucrose +
    totals.dextrose * PAC_FACTORS.dextrose +
    totals.glucose * PAC_FACTORS.glucose +
    totals.fructose * PAC_FACTORS.fructose +
    totals.lactose * PAC_FACTORS.lactose
  ) / safeTargetWeight * 100;
  const pod = (
    totals.sucrose * POD_FACTORS.sucrose +
    totals.dextrose * POD_FACTORS.dextrose +
    totals.glucose * POD_FACTORS.glucose +
    totals.fructose * POD_FACTORS.fructose +
    totals.lactose * POD_FACTORS.lactose
  ) / safeTargetWeight * 100;

  const ranges = TARGET_RANGES[input.type] ?? TARGET_RANGES.milk;
  const metrics = [
    metric("totalSolids", "Sólidos totales", percent(totalSolids, safeTargetWeight), ranges.totalSolids, "%"),
    metric("fat", "Grasa", percent(totals.fat, safeTargetWeight), ranges.fat, "%"),
    metric("milkSolidsNonFat", "Sólidos lácteos no grasos", percent(totals.milkSolidsNonFat + totals.lactose, safeTargetWeight), ranges.milkSolidsNonFat, "%"),
    metric("totalSugars", "Azúcares totales", percent(totalSugars, safeTargetWeight), ranges.totalSugars, "%"),
    metric("lactose", "Lactosa", percent(totals.lactose, safeTargetWeight), ranges.lactose, "%"),
    metric("stabilizer", "Neutro / estabilizante activo", percent(totals.stabilizer, safeTargetWeight), ranges.stabilizer, "%"),
    metric("pac", "PAC", pac, ranges.pac, "PAC"),
    metric("pod", "POD", pod, ranges.pod, "POD")
  ];

  const score = calculateScore(metrics);
  return {
    status: overallStatus(metrics),
    score,
    totalWeightGrams: safeTargetWeight,
    scaleFactor: round(scaleFactor, 6),
    sections: {
      baseWeightGrams: round(baseWeightGrams, 2),
      flavorWeightGrams: round(flavorWeightGrams, 2),
      basePercent: percent(baseWeightGrams, safeTargetWeight),
      flavorPercent: percent(flavorWeightGrams, safeTargetWeight)
    },
    scaledIngredients,
    totals: {
      water: round(totals.water, 2),
      fat: round(totals.fat, 2),
      milkSolidsNonFat: round(totals.milkSolidsNonFat, 2),
      sucrose: round(totals.sucrose, 2),
      dextrose: round(totals.dextrose, 2),
      glucose: round(totals.glucose, 2),
      fructose: round(totals.fructose, 2),
      lactose: round(totals.lactose, 2),
      stabilizer: round(totals.stabilizer, 2),
      otherSolids: round(totals.otherSolids, 2),
      totalSolids: round(totalSolids, 2),
      totalSugars: round(totalSugars, 2),
      pac: round(pac, 2),
      pod: round(pod, 2),
      costCOP: round(totals.costCOPPerKg ?? 0, 0)
    },
    metrics,
    recommendations: buildRecommendations(metrics, ranges)
  };
}

export function calculateNeutralFormula(input: NeutralFormulaInput): NeutralFormulaResult {
  const totalWeight = input.components.reduce((sum, item) => sum + Number(item.grams || 0), 0);
  const safeTotal = totalWeight > 0 ? totalWeight : 1;
  const composition = emptyComposition();

  input.components.forEach((component) => addComposition(composition, component.composition, component.grams));

  const normalized: IngredientComposition = {
    water: percent(composition.water, safeTotal),
    fat: percent(composition.fat, safeTotal),
    milkSolidsNonFat: percent(composition.milkSolidsNonFat, safeTotal),
    sucrose: percent(composition.sucrose, safeTotal),
    dextrose: percent(composition.dextrose, safeTotal),
    glucose: percent(composition.glucose, safeTotal),
    fructose: percent(composition.fructose, safeTotal),
    lactose: percent(composition.lactose, safeTotal),
    stabilizer: percent(composition.stabilizer, safeTotal),
    otherSolids: percent(composition.otherSolids, safeTotal),
    costCOPPerKg: round((composition.costCOPPerKg ?? 0) / safeTotal * 1000, 0)
  };

  const carrier = normalized.sucrose + normalized.dextrose + normalized.glucose + normalized.otherSolids;
  const emulsifierFat = normalized.fat;
  const recommendedGramsPerKg = round(input.targetUsagePercent * 10, 2);

  const metrics = [
    metric("usage", "Dosis por kg de mezcla", recommendedGramsPerKg, [3, 7], "g"),
    metric("stabilizer", "Estabilizante activo en neutro", normalized.stabilizer, [8, 25], "%"),
    metric("carrier", "Portador / sólidos de soporte", carrier, [65, 92], "%"),
    metric("water", "Humedad del neutro", normalized.water, [0, 8], "%"),
    metric("emulsifier", "Fase emulsificante grasa", emulsifierFat, [0, 12], "%")
  ];

  const status = overallStatus(metrics);
  const score = calculateScore(metrics);
  const recommendations = metrics.filter((item) => item.status !== "ok").map((item) => `${item.label}: ${item.message}`);
  if (recommendations.length === 0) {
    recommendations.push("El neutro propio está dentro de rangos para usarse como base. Haz una prueba de vitrina antes de producir en volumen.");
  }

  return {
    name: input.name,
    totalWeightGrams: round(safeTotal, 2),
    recommendedGramsPerKg,
    composition: normalized,
    metrics,
    status,
    score,
    recommendations
  };
}

const DEFAULT_BASE_MILK: RecipeIngredientInput[] = [
  { ingredientId: "leche-entera", grams: 545, section: "base" },
  { ingredientId: "crema-35", grams: 140, section: "base" },
  { ingredientId: "leche-polvo-descremada", grams: 70, section: "base" },
  { ingredientId: "sacarosa", grams: 125, section: "base" },
  { ingredientId: "dextrosa", grams: 55, section: "base" },
  { ingredientId: "neutro-comercial", grams: 5, section: "base" }
];

function withBase(name: string, type: RecipeType, targetWeightGrams: number, base: RecipeIngredientInput[], flavor: RecipeIngredientInput[]): RecipeInput {
  return { name, type, targetWeightGrams, ingredients: [...base, ...flavor] };
}

export function recipeTemplateForType(type: RecipeType, targetWeightGrams = 1000): RecipeInput {
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

export function recipeForCoffeeGelato(targetWeightGrams = 1000): RecipeInput {
  return recipeTemplateForType("coffee", targetWeightGrams);
}

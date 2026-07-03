export type RecipeType =
  | "milk"
  | "fiordilatte"
  | "vanilla"
  | "coffee"
  | "chocolate"
  | "fruit"
  | "lulo"
  | "sorbet"
  | "yogurt"
  | "nut"
  | "vegan";
export type BalanceStatus = "ok" | "warning" | "error";
export type IngredientCategory = "dairy" | "sugar" | "flavor" | "neutral" | "fat" | "other";
export type RecipeIngredientSection = "base" | "flavor";

export interface IngredientComposition {
  water: number;
  fat: number;
  milkSolidsNonFat: number;
  sucrose: number;
  dextrose: number;
  glucose: number;
  fructose: number;
  lactose: number;
  stabilizer: number;
  otherSolids: number;
  costCOPPerKg?: number;
}

export interface SupplierScore {
  qualityScore: number;
  serviceScore: number;
  priceScore: number;
  deliveryScore: number;
  totalScore: number;
}

export interface SupplierDefinition extends SupplierScore {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IngredientSupplierPrice {
  id: string;
  ingredientId: string;
  supplierId: string;
  priceCOPPerKg: number;
  leadTimeDays: number;
  available: boolean;
  notes?: string;
  supplier?: SupplierDefinition;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IngredientDefinition {
  id: string;
  name: string;
  category: IngredientCategory;
  composition: IngredientComposition;
  basePriceCOPPerKg?: number;
  selectedSupplierId?: string | null;
  supplierPrices?: IngredientSupplierPrice[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface RecipeIngredientInput {
  ingredientId: string;
  name?: string;
  grams: number;
  section?: RecipeIngredientSection;
  composition?: IngredientComposition;
}

export interface RecipeInput {
  name: string;
  type: RecipeType;
  targetWeightGrams: number;
  ingredients: RecipeIngredientInput[];
}

export type RecipeProductionStatus = "draft" | "testing" | "production" | "archived";

export interface RecipeNote {
  id: string;
  recipeId: string;
  comment: string;
  rating: number;
  author?: string | null;
  createdAt?: string | Date;
}

export interface RecipeHistoryEntry {
  id: string;
  recipeId: string;
  action: "CREATED" | "UPDATED" | "NOTE_ADDED" | "PRODUCTION_APPROVED" | "VERSION_RESTORED" | "PRODUCTION_APPROVED_VERSION" | string;
  versionNumber: number;
  summary: string;
  snapshot: unknown;
  noteId?: string | null;
  rating?: number | null;
  author?: string | null;
  createdAt?: string | Date;
}

export interface SavedRecipe extends RecipeInput {
  id: string;
  balance: BalanceSummary;
  status?: RecipeProductionStatus | string;
  versionNumber?: number;
  averageRating?: number;
  bestRating?: number;
  approvedForProduction?: boolean;
  productionApprovedAt?: string | Date | null;
  productionApprovedBy?: string | null;
  productionApprovedNotes?: string | null;
  productionApprovedVersion?: number | null;
  productionSnapshot?: unknown | null;
  notes?: RecipeNote[];
  history?: RecipeHistoryEntry[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface MetricResult {
  key: string;
  label: string;
  value: number;
  min: number;
  max: number;
  unit: "%" | "g" | "PAC" | "POD";
  status: BalanceStatus;
  message: string;
}

export interface IndicatorDefinition {
  title: string;
  shortDescription: string;
  whyItMatters: string;
  correction: string;
}

export interface BalanceSummary {
  status: BalanceStatus;
  score: number;
  totalWeightGrams: number;
  scaleFactor: number;
  sections: {
    baseWeightGrams: number;
    flavorWeightGrams: number;
    basePercent: number;
    flavorPercent: number;
  };
  scaledIngredients: Array<RecipeIngredientInput & { scaledGrams: number; percent: number }>;
  totals: {
    water: number;
    fat: number;
    milkSolidsNonFat: number;
    sucrose: number;
    dextrose: number;
    glucose: number;
    fructose: number;
    lactose: number;
    stabilizer: number;
    otherSolids: number;
    totalSolids: number;
    totalSugars: number;
    pac: number;
    pod: number;
    costCOP: number;
  };
  metrics: MetricResult[];
  recommendations: string[];
}

export interface TargetRange {
  totalSolids: [number, number];
  fat: [number, number];
  milkSolidsNonFat: [number, number];
  totalSugars: [number, number];
  lactose: [number, number];
  stabilizer: [number, number];
  pac: [number, number];
  pod: [number, number];
}

export interface RecipeTypeDefinition {
  id: RecipeType;
  label: string;
  group: "leche" | "fruta" | "especial" | "vegano";
  description: string;
}

export interface NeutralComponentInput {
  name: string;
  grams: number;
  role: "carrier" | "stabilizer" | "emulsifier" | "fiber" | "other";
  composition: IngredientComposition;
}

export interface NeutralFormulaInput {
  name: string;
  targetUsagePercent: number;
  components: NeutralComponentInput[];
}

export interface NeutralFormulaResult {
  name: string;
  totalWeightGrams: number;
  recommendedGramsPerKg: number;
  composition: IngredientComposition;
  metrics: MetricResult[];
  status: BalanceStatus;
  score: number;
  recommendations: string[];
}

export type RecipeType = "milk" | "coffee" | "chocolate" | "fruit" | "sorbet";
export type BalanceStatus = "ok" | "warning" | "error";
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
export interface IngredientDefinition {
    id: string;
    name: string;
    category: "dairy" | "sugar" | "flavor" | "neutral" | "fat" | "other";
    composition: IngredientComposition;
}
export interface RecipeIngredientInput {
    ingredientId: string;
    name?: string;
    grams: number;
    composition?: IngredientComposition;
}
export interface RecipeInput {
    name: string;
    type: RecipeType;
    targetWeightGrams: number;
    ingredients: RecipeIngredientInput[];
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
export interface BalanceSummary {
    status: BalanceStatus;
    score: number;
    totalWeightGrams: number;
    scaleFactor: number;
    scaledIngredients: Array<RecipeIngredientInput & {
        scaledGrams: number;
        percent: number;
    }>;
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

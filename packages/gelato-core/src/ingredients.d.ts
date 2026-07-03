import { IngredientDefinition } from "./types";
export declare const ZERO_COMPOSITION: {
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
    costCOPPerKg: number;
};
export declare const DEFAULT_INGREDIENTS: IngredientDefinition[];
export declare function getIngredientById(id: string): IngredientDefinition | undefined;

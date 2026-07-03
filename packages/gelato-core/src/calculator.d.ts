import { BalanceSummary, NeutralFormulaInput, NeutralFormulaResult, RecipeInput } from "./types";
export declare function calculateRecipeBalance(input: RecipeInput): BalanceSummary;
export declare function calculateNeutralFormula(input: NeutralFormulaInput): NeutralFormulaResult;
export declare function recipeForCoffeeGelato(targetWeightGrams?: number): RecipeInput;

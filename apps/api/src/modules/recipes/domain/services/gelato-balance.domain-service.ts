import {
  calculateNeutralFormula,
  calculateRecipeBalance,
  NeutralFormulaInput,
  NeutralFormulaResult,
  RecipeInput,
  BalanceSummary
} from "@gelato/gelato-core";

export class GelatoBalanceDomainService {
  calculateRecipe(input: RecipeInput): BalanceSummary {
    return calculateRecipeBalance(input);
  }

  calculateNeutral(input: NeutralFormulaInput): NeutralFormulaResult {
    return calculateNeutralFormula(input);
  }
}

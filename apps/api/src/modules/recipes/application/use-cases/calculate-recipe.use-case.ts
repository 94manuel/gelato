import { Injectable } from "@nestjs/common";
import { BalanceSummary, RecipeInput } from "@gelato/gelato-core";
import { GelatoBalanceDomainService } from "../../domain/services/gelato-balance.domain-service";

@Injectable()
export class CalculateRecipeUseCase {
  constructor(private readonly balanceService: GelatoBalanceDomainService) {}

  execute(input: RecipeInput): BalanceSummary {
    return this.balanceService.calculateRecipe(input);
  }
}

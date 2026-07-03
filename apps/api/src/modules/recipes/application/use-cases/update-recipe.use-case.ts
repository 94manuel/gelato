import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { RecipeInput } from "@gelato/gelato-core";
import { RECIPE_REPOSITORY, RecipeRepository } from "../../domain/ports/recipe.repository";
import { GelatoBalanceDomainService } from "../../domain/services/gelato-balance.domain-service";

@Injectable()
export class UpdateRecipeUseCase {
  constructor(
    @Inject(RECIPE_REPOSITORY) private readonly repository: RecipeRepository,
    private readonly balanceService: GelatoBalanceDomainService
  ) {}

  async execute(id: string, input: RecipeInput) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException("Recipe not found");
    const balance = this.balanceService.calculateRecipe(input);
    return this.repository.update(id, {
      name: input.name,
      type: input.type,
      targetWeightGrams: input.targetWeightGrams,
      ingredients: input.ingredients,
      balance,
      updatedAt: new Date()
    });
  }
}

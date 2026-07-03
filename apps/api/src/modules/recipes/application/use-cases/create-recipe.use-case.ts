import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { RecipeInput } from "@gelato/gelato-core";
import { RecipeEntity } from "../../domain/entities/recipe.entity";
import { RECIPE_REPOSITORY, RecipeRepository } from "../../domain/ports/recipe.repository";
import { GelatoBalanceDomainService } from "../../domain/services/gelato-balance.domain-service";

@Injectable()
export class CreateRecipeUseCase {
  constructor(
    @Inject(RECIPE_REPOSITORY) private readonly repository: RecipeRepository,
    private readonly balanceService: GelatoBalanceDomainService
  ) {}

  async execute(input: RecipeInput): Promise<RecipeEntity> {
    const balance = this.balanceService.calculateRecipe(input);
    const recipe = RecipeEntity.create({
      id: randomUUID(),
      name: input.name,
      type: input.type,
      targetWeightGrams: input.targetWeightGrams,
      ingredients: input.ingredients,
      balance,
      status: "draft",
      versionNumber: 1,
      averageRating: 0,
      bestRating: 0,
      approvedForProduction: false,
      productionApprovedAt: null,
      productionApprovedBy: null,
      productionApprovedNotes: null,
      productionApprovedVersion: null,
      productionSnapshot: null
    });
    return this.repository.create(recipe);
  }
}

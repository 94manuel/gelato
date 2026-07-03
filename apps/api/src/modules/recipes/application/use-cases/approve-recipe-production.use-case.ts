import { Inject, Injectable } from "@nestjs/common";
import { RECIPE_REPOSITORY, RecipeRepository } from "../../domain/ports/recipe.repository";
import { ApproveRecipeForProductionDto } from "../dto/recipe.dto";

@Injectable()
export class ApproveRecipeProductionUseCase {
  constructor(@Inject(RECIPE_REPOSITORY) private readonly repository: RecipeRepository) {}

  execute(recipeId: string, input: ApproveRecipeForProductionDto) {
    return this.repository.approveForProduction({
      recipeId,
      approvedBy: input.approvedBy,
      notes: input.notes
    });
  }
}

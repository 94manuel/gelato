import { Inject, Injectable } from "@nestjs/common";
import { RECIPE_REPOSITORY, RecipeRepository } from "../../domain/ports/recipe.repository";
import { ApproveRecipeVersionForProductionDto } from "../dto/recipe.dto";

@Injectable()
export class ApproveRecipeVersionProductionUseCase {
  constructor(@Inject(RECIPE_REPOSITORY) private readonly repository: RecipeRepository) {}

  execute(recipeId: string, versionNumber: number, input: ApproveRecipeVersionForProductionDto) {
    return this.repository.approveVersionForProduction({
      recipeId,
      versionNumber,
      approvedBy: input.approvedBy,
      notes: input.notes
    });
  }
}

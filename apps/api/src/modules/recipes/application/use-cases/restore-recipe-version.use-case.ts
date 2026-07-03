import { Inject, Injectable } from "@nestjs/common";
import { RECIPE_REPOSITORY, RecipeRepository } from "../../domain/ports/recipe.repository";
import { RestoreRecipeVersionDto } from "../dto/recipe.dto";

@Injectable()
export class RestoreRecipeVersionUseCase {
  constructor(@Inject(RECIPE_REPOSITORY) private readonly repository: RecipeRepository) {}

  execute(recipeId: string, versionNumber: number, input: RestoreRecipeVersionDto) {
    return this.repository.restoreVersion({
      recipeId,
      versionNumber,
      restoredBy: input.restoredBy,
      notes: input.notes
    });
  }
}

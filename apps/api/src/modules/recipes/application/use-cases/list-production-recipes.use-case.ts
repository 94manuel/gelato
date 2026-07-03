import { Inject, Injectable } from "@nestjs/common";
import { RECIPE_REPOSITORY, RecipeRepository } from "../../domain/ports/recipe.repository";

@Injectable()
export class ListProductionRecipesUseCase {
  constructor(@Inject(RECIPE_REPOSITORY) private readonly repository: RecipeRepository) {}
  execute() {
    return this.repository.findProductionRecipes();
  }
}

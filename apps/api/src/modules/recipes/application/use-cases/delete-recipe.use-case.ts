import { Inject, Injectable } from "@nestjs/common";
import { RECIPE_REPOSITORY, RecipeRepository } from "../../domain/ports/recipe.repository";

@Injectable()
export class DeleteRecipeUseCase {
  constructor(@Inject(RECIPE_REPOSITORY) private readonly repository: RecipeRepository) {}
  execute(id: string) {
    return this.repository.delete(id);
  }
}

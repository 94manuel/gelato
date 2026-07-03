import { Inject, Injectable } from "@nestjs/common";
import { RECIPE_REPOSITORY, RecipeRepository } from "../../domain/ports/recipe.repository";
import { AddRecipeNoteDto } from "../dto/recipe.dto";

@Injectable()
export class AddRecipeNoteUseCase {
  constructor(@Inject(RECIPE_REPOSITORY) private readonly repository: RecipeRepository) {}

  execute(recipeId: string, input: AddRecipeNoteDto) {
    return this.repository.addNote({
      recipeId,
      comment: input.comment,
      rating: input.rating,
      author: input.author
    });
  }
}

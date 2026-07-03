import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { RECIPE_REPOSITORY, RecipeRepository } from "../../domain/ports/recipe.repository";

@Injectable()
export class GetRecipeTimelineUseCase {
  constructor(@Inject(RECIPE_REPOSITORY) private readonly repository: RecipeRepository) {}

  async execute(id: string) {
    const timeline = await this.repository.findTimeline(id);
    if (!timeline) throw new NotFoundException("Recipe not found");
    return timeline;
  }
}

import { Inject, Injectable } from "@nestjs/common";
import { INGREDIENT_CATALOG_REPOSITORY, IngredientCatalogRepository } from "../../../domain/ports/ingredient-catalog.repository";

@Injectable()
export class DeleteIngredientUseCase {
  constructor(@Inject(INGREDIENT_CATALOG_REPOSITORY) private readonly repository: IngredientCatalogRepository) {}
  execute(id: string) {
    return this.repository.delete(id);
  }
}

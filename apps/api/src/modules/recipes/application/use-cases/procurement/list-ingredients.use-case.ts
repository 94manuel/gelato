import { Inject, Injectable } from "@nestjs/common";
import { INGREDIENT_CATALOG_REPOSITORY, IngredientCatalogRepository } from "../../../domain/ports/ingredient-catalog.repository";

@Injectable()
export class ListIngredientsUseCase {
  constructor(@Inject(INGREDIENT_CATALOG_REPOSITORY) private readonly repository: IngredientCatalogRepository) {}
  execute() {
    return this.repository.findAll();
  }
}

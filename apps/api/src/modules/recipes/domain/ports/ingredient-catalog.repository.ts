import { IngredientCatalogEntity } from "../entities/ingredient-catalog.entity";

export const INGREDIENT_CATALOG_REPOSITORY = Symbol("INGREDIENT_CATALOG_REPOSITORY");

export interface IngredientCatalogRepository {
  findAll(): Promise<IngredientCatalogEntity[]>;
  findById(id: string): Promise<IngredientCatalogEntity | null>;
  create(ingredient: IngredientCatalogEntity): Promise<IngredientCatalogEntity>;
  update(id: string, ingredient: Partial<IngredientCatalogEntity>): Promise<IngredientCatalogEntity>;
  delete(id: string): Promise<void>;
}

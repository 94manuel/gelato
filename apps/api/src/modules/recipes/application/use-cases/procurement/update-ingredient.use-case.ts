import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IngredientComposition } from "@gelato/gelato-core";
import { INGREDIENT_CATALOG_REPOSITORY, IngredientCatalogRepository } from "../../../domain/ports/ingredient-catalog.repository";
import { UpsertIngredientCatalogDto } from "../../dto/procurement.dto";

@Injectable()
export class UpdateIngredientUseCase {
  constructor(@Inject(INGREDIENT_CATALOG_REPOSITORY) private readonly repository: IngredientCatalogRepository) {}

  async execute(id: string, input: UpsertIngredientCatalogDto) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException("Ingredient not found");
    const composition: IngredientComposition = { ...input.composition, costCOPPerKg: input.basePriceCOPPerKg };
    return this.repository.update(id, {
      name: input.name,
      category: input.category,
      composition,
      basePriceCOPPerKg: input.basePriceCOPPerKg,
      selectedSupplierId: input.selectedSupplierId ?? null,
      updatedAt: new Date()
    });
  }
}

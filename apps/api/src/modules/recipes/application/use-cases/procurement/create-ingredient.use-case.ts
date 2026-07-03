import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { IngredientComposition } from "@gelato/gelato-core";
import { IngredientCatalogEntity } from "../../../domain/entities/ingredient-catalog.entity";
import { INGREDIENT_CATALOG_REPOSITORY, IngredientCatalogRepository } from "../../../domain/ports/ingredient-catalog.repository";
import { UpsertIngredientCatalogDto } from "../../dto/procurement.dto";

@Injectable()
export class CreateIngredientUseCase {
  constructor(@Inject(INGREDIENT_CATALOG_REPOSITORY) private readonly repository: IngredientCatalogRepository) {}

  execute(input: UpsertIngredientCatalogDto, id: string = randomUUID()) {
    const now = new Date();
    const composition: IngredientComposition = { ...input.composition, costCOPPerKg: input.basePriceCOPPerKg };
    return this.repository.create(new IngredientCatalogEntity(
      id,
      input.name,
      input.category,
      composition,
      input.basePriceCOPPerKg,
      input.selectedSupplierId ?? null,
      [],
      now,
      now
    ));
  }
}

import { IngredientCategory, IngredientComposition, IngredientSupplierPrice } from "@gelato/gelato-core";

export class IngredientCatalogEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public category: IngredientCategory,
    public composition: IngredientComposition,
    public basePriceCOPPerKg: number,
    public selectedSupplierId: string | null,
    public supplierPrices: IngredientSupplierPrice[],
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}

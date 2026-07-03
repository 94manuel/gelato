import { IngredientDefinition, IngredientSupplierPrice } from "@gelato/gelato-core";

export function getBestSupplierPrice(ingredient: IngredientDefinition): IngredientSupplierPrice | undefined {
  const available = (ingredient.supplierPrices ?? []).filter((price) => price.available && price.supplier);
  if (available.length === 0) return undefined;
  return [...available].sort((a, b) => {
    const scoreDiff = (b.supplier?.totalScore ?? 0) - (a.supplier?.totalScore ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    return a.priceCOPPerKg - b.priceCOPPerKg;
  })[0];
}

export function ingredientWithBestPrice(ingredient: IngredientDefinition): IngredientDefinition {
  const best = getBestSupplierPrice(ingredient);
  const price = best?.priceCOPPerKg ?? ingredient.basePriceCOPPerKg ?? ingredient.composition.costCOPPerKg ?? 0;
  return {
    ...ingredient,
    selectedSupplierId: best?.supplierId ?? ingredient.selectedSupplierId,
    composition: {
      ...ingredient.composition,
      costCOPPerKg: price
    },
    basePriceCOPPerKg: price
  };
}

export function formatCOP(value: number | undefined): string {
  return `COP $${Math.round(value ?? 0).toLocaleString("es-CO")}`;
}

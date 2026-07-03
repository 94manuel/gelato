import { BalanceSummary, RecipeInput, RecipeProductionStatus, RecipeType } from "@gelato/gelato-core";

export class RecipeEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public type: RecipeType,
    public targetWeightGrams: number,
    public ingredients: RecipeInput["ingredients"],
    public balance: BalanceSummary,
    public status: RecipeProductionStatus | string,
    public versionNumber: number,
    public averageRating: number,
    public bestRating: number,
    public approvedForProduction: boolean,
    public productionApprovedAt: Date | null,
    public productionApprovedBy: string | null,
    public productionApprovedNotes: string | null,
    public productionApprovedVersion: number | null,
    public productionSnapshot: unknown | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(params: Omit<RecipeEntity, "createdAt" | "updatedAt">): RecipeEntity {
    const now = new Date();
    return new RecipeEntity(
      params.id,
      params.name,
      params.type,
      params.targetWeightGrams,
      params.ingredients,
      params.balance,
      params.status,
      params.versionNumber,
      params.averageRating,
      params.bestRating,
      params.approvedForProduction,
      params.productionApprovedAt,
      params.productionApprovedBy,
      params.productionApprovedNotes,
      params.productionApprovedVersion,
      params.productionSnapshot,
      now,
      now
    );
  }
}

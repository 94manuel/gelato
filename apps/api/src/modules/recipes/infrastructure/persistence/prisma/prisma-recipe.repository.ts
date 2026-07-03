import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { RecipeEntity } from "../../../domain/entities/recipe.entity";
import {
  AddRecipeNoteInput,
  ApproveRecipeForProductionInput,
  ApproveRecipeVersionForProductionInput,
  RecipeHistoryEntity,
  RecipeRepository,
  RecipeTimeline,
  RestoreRecipeVersionInput
} from "../../../domain/ports/recipe.repository";
import { PrismaService } from "./prisma.service";
import { RecipeInput, BalanceSummary, RecipeProductionStatus, RecipeType } from "@gelato/gelato-core";

interface StoredRecipeSnapshot {
  id: string;
  name: string;
  type: string;
  targetWeightGrams: number;
  ingredients: unknown;
  balance: unknown;
  status?: string;
  versionNumber?: number;
  averageRating?: number;
  bestRating?: number;
  approvedForProduction?: boolean;
  productionApprovedAt?: string | Date | null;
  productionApprovedBy?: string | null;
  productionApprovedNotes?: string | null;
  productionApprovedVersion?: number | null;
  productionSnapshot?: unknown | null;
}

@Injectable()
export class PrismaRecipeRepository implements RecipeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(recipe: RecipeEntity): Promise<RecipeEntity> {
    const created = await this.prisma.$transaction(async (tx) => {
      const saved = await tx.recipe.create({
        data: {
          id: recipe.id,
          name: recipe.name,
          type: recipe.type,
          targetWeightGrams: recipe.targetWeightGrams,
          ingredients: recipe.ingredients as unknown as Prisma.InputJsonValue,
          balance: recipe.balance as unknown as Prisma.InputJsonValue,
          status: recipe.status,
          versionNumber: recipe.versionNumber,
          averageRating: recipe.averageRating,
          bestRating: recipe.bestRating,
          approvedForProduction: recipe.approvedForProduction,
          productionApprovedAt: recipe.productionApprovedAt,
          productionApprovedBy: recipe.productionApprovedBy,
          productionApprovedNotes: recipe.productionApprovedNotes,
          productionApprovedVersion: recipe.productionApprovedVersion
        }
      });

      await tx.recipeHistory.create({
        data: {
          recipeId: saved.id,
          action: "CREATED",
          versionNumber: saved.versionNumber,
          summary: "Receta creada para iniciar ensayos.",
          snapshot: this.snapshot(saved) as unknown as Prisma.InputJsonValue
        }
      });

      return saved;
    });
    return this.toEntity(created);
  }

  async update(id: string, recipe: Partial<RecipeEntity>): Promise<RecipeEntity> {
    const updated = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.recipe.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException("Recipe not found");
      const nextVersion = Number(existing.versionNumber ?? 1) + 1;

      const saved = await tx.recipe.update({
        where: { id },
        data: {
          name: recipe.name,
          type: recipe.type,
          targetWeightGrams: recipe.targetWeightGrams,
          ingredients: recipe.ingredients as unknown as Prisma.InputJsonValue,
          balance: recipe.balance as unknown as Prisma.InputJsonValue,
          status: "testing",
          versionNumber: nextVersion,
          approvedForProduction: false,
          productionApprovedAt: null,
          productionApprovedBy: null,
          productionApprovedNotes: null,
          productionApprovedVersion: null,
          productionSnapshot: Prisma.DbNull
        }
      });

      await tx.recipeHistory.create({
        data: {
          recipeId: saved.id,
          action: "UPDATED",
          versionNumber: nextVersion,
          summary: `Receta modificada. Nueva versión de ensayo v${nextVersion}.`,
          snapshot: this.snapshot(saved) as unknown as Prisma.InputJsonValue
        }
      });

      return saved;
    });
    return this.toEntity(updated);
  }

  async findById(id: string): Promise<RecipeEntity | null> {
    const recipe = await this.prisma.recipe.findUnique({ where: { id } });
    return recipe ? this.toEntity(recipe) : null;
  }

  async findAll(): Promise<RecipeEntity[]> {
    const recipes = await this.prisma.recipe.findMany({
      orderBy: [{ approvedForProduction: "desc" }, { bestRating: "desc" }, { updatedAt: "desc" }]
    });
    return recipes.map((recipe) => this.toEntity(recipe));
  }

  async findProductionRecipes(): Promise<RecipeEntity[]> {
    const recipes = await this.prisma.recipe.findMany({
      where: { approvedForProduction: true },
      orderBy: [{ bestRating: "desc" }, { productionApprovedAt: "desc" }]
    });
    return recipes.map((recipe) => this.toEntity(recipe));
  }

  async findTimeline(id: string): Promise<RecipeTimeline | null> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        notes: { orderBy: { createdAt: "desc" } },
        history: { orderBy: { createdAt: "desc" } }
      }
    });
    if (!recipe) return null;
    return {
      recipe: this.toEntity(recipe),
      notes: recipe.notes.map((note) => ({ ...note })),
      history: recipe.history.map((entry) => this.toHistoryEntity(entry))
    };
  }

  async addNote(input: AddRecipeNoteInput): Promise<RecipeTimeline> {
    const safeRating = this.safeRating(input.rating);
    const timeline = await this.prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.findUnique({ where: { id: input.recipeId } });
      if (!recipe) throw new NotFoundException("Recipe not found");

      const note = await tx.recipeNote.create({
        data: {
          recipeId: input.recipeId,
          comment: input.comment,
          rating: safeRating,
          author: input.author || null
        }
      });

      const aggregate = await tx.recipeNote.aggregate({
        where: { recipeId: input.recipeId },
        _avg: { rating: true },
        _max: { rating: true }
      });

      const updated = await tx.recipe.update({
        where: { id: input.recipeId },
        data: {
          status: recipe.approvedForProduction ? recipe.status : "testing",
          averageRating: this.round2(Number(aggregate._avg.rating ?? safeRating)),
          bestRating: this.round2(Number(aggregate._max.rating ?? safeRating))
        }
      });

      await tx.recipeHistory.create({
        data: {
          recipeId: input.recipeId,
          action: "NOTE_ADDED",
          versionNumber: updated.versionNumber,
          summary: `Ensayo calificado con ${safeRating.toFixed(2)}/5. ${input.comment.slice(0, 140)}`,
          snapshot: this.snapshot(updated) as unknown as Prisma.InputJsonValue,
          noteId: note.id,
          rating: safeRating,
          author: input.author || null
        }
      });

      return this.loadFullRecipe(tx, input.recipeId);
    });

    return this.toTimeline(timeline);
  }

  async approveForProduction(input: ApproveRecipeForProductionInput): Promise<RecipeTimeline> {
    const timeline = await this.prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.findUnique({ where: { id: input.recipeId } });
      if (!recipe) throw new NotFoundException("Recipe not found");
      const currentSnapshot = this.snapshot(recipe);

      const updated = await tx.recipe.update({
        where: { id: input.recipeId },
        data: {
          status: "production",
          approvedForProduction: true,
          productionApprovedAt: new Date(),
          productionApprovedBy: input.approvedBy || null,
          productionApprovedNotes: input.notes || null,
          productionApprovedVersion: recipe.versionNumber,
          productionSnapshot: currentSnapshot as unknown as Prisma.InputJsonValue
        }
      });

      await tx.recipeHistory.create({
        data: {
          recipeId: input.recipeId,
          action: "PRODUCTION_APPROVED",
          versionNumber: recipe.versionNumber,
          summary: `Receta aprobada para producción en versión v${recipe.versionNumber}.`,
          snapshot: this.snapshot(updated) as unknown as Prisma.InputJsonValue,
          author: input.approvedBy || null
        }
      });

      return this.loadFullRecipe(tx, input.recipeId);
    });

    return this.toTimeline(timeline);
  }

  async restoreVersion(input: RestoreRecipeVersionInput): Promise<RecipeTimeline> {
    const timeline = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.recipe.findUnique({ where: { id: input.recipeId } });
      if (!existing) throw new NotFoundException("Recipe not found");

      const sourceSnapshot = await this.findSnapshotForVersion(tx, input.recipeId, input.versionNumber);
      const nextVersion = Number(existing.versionNumber ?? 1) + 1;

      const restored = await tx.recipe.update({
        where: { id: input.recipeId },
        data: {
          name: sourceSnapshot.name,
          type: sourceSnapshot.type,
          targetWeightGrams: Number(sourceSnapshot.targetWeightGrams),
          ingredients: sourceSnapshot.ingredients as unknown as Prisma.InputJsonValue,
          balance: sourceSnapshot.balance as unknown as Prisma.InputJsonValue,
          status: "testing",
          versionNumber: nextVersion,
          approvedForProduction: false,
          productionApprovedAt: null,
          productionApprovedBy: null,
          productionApprovedNotes: null,
          productionApprovedVersion: null,
          productionSnapshot: Prisma.DbNull
        }
      });

      await tx.recipeHistory.create({
        data: {
          recipeId: input.recipeId,
          action: "VERSION_RESTORED",
          versionNumber: nextVersion,
          summary: `Se restauró la fórmula desde v${input.versionNumber}. ${input.notes?.slice(0, 140) ?? ""}`.trim(),
          snapshot: this.snapshot(restored) as unknown as Prisma.InputJsonValue,
          author: input.restoredBy || null
        }
      });

      return this.loadFullRecipe(tx, input.recipeId);
    });

    return this.toTimeline(timeline);
  }

  async approveVersionForProduction(input: ApproveRecipeVersionForProductionInput): Promise<RecipeTimeline> {
    const timeline = await this.prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.findUnique({ where: { id: input.recipeId } });
      if (!recipe) throw new NotFoundException("Recipe not found");

      const sourceSnapshot = await this.findSnapshotForVersion(tx, input.recipeId, input.versionNumber);
      const productionSnapshot = {
        ...sourceSnapshot,
        status: "production",
        approvedForProduction: true,
        productionApprovedAt: new Date().toISOString(),
        productionApprovedBy: input.approvedBy || null,
        productionApprovedNotes: input.notes || null,
        productionApprovedVersion: input.versionNumber
      };

      const updated = await tx.recipe.update({
        where: { id: input.recipeId },
        data: {
          status: "production",
          approvedForProduction: true,
          productionApprovedAt: new Date(),
          productionApprovedBy: input.approvedBy || null,
          productionApprovedNotes: input.notes || null,
          productionApprovedVersion: input.versionNumber,
          productionSnapshot: productionSnapshot as unknown as Prisma.InputJsonValue
        }
      });

      await tx.recipeHistory.create({
        data: {
          recipeId: input.recipeId,
          action: "PRODUCTION_APPROVED_VERSION",
          versionNumber: input.versionNumber,
          summary: `Se aprobó para producción la versión histórica v${input.versionNumber}.`,
          snapshot: productionSnapshot as unknown as Prisma.InputJsonValue,
          author: input.approvedBy || null
        }
      });

      return this.loadFullRecipe(tx, input.recipeId);
    });

    return this.toTimeline(timeline);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.recipe.delete({ where: { id } });
  }

  private safeRating(value: number): number {
    const numeric = Number.isFinite(Number(value)) ? Number(value) : 1;
    return this.round2(Math.max(1, Math.min(5, numeric)));
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private async loadFullRecipe(tx: Prisma.TransactionClient, recipeId: string) {
    const full = await tx.recipe.findUnique({
      where: { id: recipeId },
      include: {
        notes: { orderBy: { createdAt: "desc" } },
        history: { orderBy: { createdAt: "desc" } }
      }
    });
    if (!full) throw new NotFoundException("Recipe not found");
    return full;
  }

  private toTimeline(full: any): RecipeTimeline {
    return {
      recipe: this.toEntity(full),
      notes: full.notes.map((note) => ({ ...note })),
      history: full.history.map((entry) => this.toHistoryEntity(entry))
    };
  }

  private async findSnapshotForVersion(tx: Prisma.TransactionClient, recipeId: string, versionNumber: number): Promise<StoredRecipeSnapshot> {
    const entries = await tx.recipeHistory.findMany({
      where: { recipeId, versionNumber },
      orderBy: { createdAt: "desc" }
    });

    for (const entry of entries) {
      const snapshot = this.asRecipeSnapshot(entry.snapshot);
      if (snapshot) return snapshot;
    }

    const recipe = await tx.recipe.findUnique({ where: { id: recipeId } });
    if (recipe && Number(recipe.versionNumber) === Number(versionNumber)) {
      return this.snapshot(recipe);
    }

    throw new NotFoundException(`No existe snapshot para la versión v${versionNumber}`);
  }

  private asRecipeSnapshot(value: Prisma.JsonValue | unknown): StoredRecipeSnapshot | null {
    if (!value || typeof value !== "object") return null;
    const snapshot = value as Record<string, unknown>;
    if (!snapshot.name || !snapshot.type || !snapshot.ingredients || !snapshot.balance) return null;
    return {
      id: String(snapshot.id ?? ""),
      name: String(snapshot.name),
      type: String(snapshot.type),
      targetWeightGrams: Number(snapshot.targetWeightGrams ?? 1000),
      ingredients: snapshot.ingredients,
      balance: snapshot.balance,
      status: typeof snapshot.status === "string" ? snapshot.status : undefined,
      versionNumber: Number(snapshot.versionNumber ?? 1),
      averageRating: Number(snapshot.averageRating ?? 0),
      bestRating: Number(snapshot.bestRating ?? 0),
      approvedForProduction: Boolean(snapshot.approvedForProduction ?? false),
      productionApprovedAt: snapshot.productionApprovedAt as string | Date | null | undefined,
      productionApprovedBy: snapshot.productionApprovedBy as string | null | undefined,
      productionApprovedNotes: snapshot.productionApprovedNotes as string | null | undefined,
      productionApprovedVersion: snapshot.productionApprovedVersion as number | null | undefined,
      productionSnapshot: snapshot.productionSnapshot ?? null
    };
  }

  private snapshot(recipe: {
    id: string;
    name: string;
    type: string;
    targetWeightGrams: number;
    ingredients: Prisma.JsonValue;
    balance: Prisma.JsonValue;
    status?: string;
    versionNumber?: number;
    averageRating?: number;
    bestRating?: number;
    approvedForProduction?: boolean;
    productionApprovedAt?: Date | null;
    productionApprovedBy?: string | null;
    productionApprovedNotes?: string | null;
    productionApprovedVersion?: number | null;
    productionSnapshot?: Prisma.JsonValue | null;
  }): StoredRecipeSnapshot {
    return {
      id: recipe.id,
      name: recipe.name,
      type: recipe.type,
      targetWeightGrams: recipe.targetWeightGrams,
      ingredients: recipe.ingredients,
      balance: recipe.balance,
      status: recipe.status ?? "draft",
      versionNumber: recipe.versionNumber ?? 1,
      averageRating: recipe.averageRating ?? 0,
      bestRating: recipe.bestRating ?? 0,
      approvedForProduction: recipe.approvedForProduction ?? false,
      productionApprovedAt: recipe.productionApprovedAt instanceof Date ? recipe.productionApprovedAt.toISOString() : recipe.productionApprovedAt ?? null,
      productionApprovedBy: recipe.productionApprovedBy,
      productionApprovedNotes: recipe.productionApprovedNotes,
      productionApprovedVersion: recipe.productionApprovedVersion,
      productionSnapshot: recipe.productionSnapshot ?? null
    };
  }

  private toHistoryEntity(entry: {
    id: string;
    recipeId: string;
    action: string;
    versionNumber: number;
    summary: string;
    snapshot: Prisma.JsonValue;
    noteId: string | null;
    rating: number | null;
    author: string | null;
    createdAt: Date;
  }): RecipeHistoryEntity {
    return {
      id: entry.id,
      recipeId: entry.recipeId,
      action: entry.action,
      versionNumber: entry.versionNumber,
      summary: entry.summary,
      snapshot: entry.snapshot,
      noteId: entry.noteId,
      rating: entry.rating,
      author: entry.author,
      createdAt: entry.createdAt
    };
  }

  private toEntity(recipe: {
    id: string;
    name: string;
    type: string;
    targetWeightGrams: number;
    ingredients: Prisma.JsonValue;
    balance: Prisma.JsonValue;
    status?: string;
    versionNumber?: number;
    averageRating?: number;
    bestRating?: number;
    approvedForProduction?: boolean;
    productionApprovedAt?: Date | null;
    productionApprovedBy?: string | null;
    productionApprovedNotes?: string | null;
    productionApprovedVersion?: number | null;
    productionSnapshot?: Prisma.JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
  }): RecipeEntity {
    return new RecipeEntity(
      recipe.id,
      recipe.name,
      recipe.type as RecipeType,
      recipe.targetWeightGrams,
      recipe.ingredients as unknown as RecipeInput["ingredients"],
      recipe.balance as unknown as BalanceSummary,
      (recipe.status ?? "draft") as RecipeProductionStatus,
      recipe.versionNumber ?? 1,
      recipe.averageRating ?? 0,
      recipe.bestRating ?? 0,
      recipe.approvedForProduction ?? false,
      recipe.productionApprovedAt ?? null,
      recipe.productionApprovedBy ?? null,
      recipe.productionApprovedNotes ?? null,
      recipe.productionApprovedVersion ?? null,
      recipe.productionSnapshot ?? null,
      recipe.createdAt,
      recipe.updatedAt
    );
  }
}

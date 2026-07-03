import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { IngredientCatalogEntity } from "../../../domain/entities/ingredient-catalog.entity";
import { IngredientCatalogRepository } from "../../../domain/ports/ingredient-catalog.repository";
import { PrismaService } from "./prisma.service";
import { IngredientCategory, IngredientComposition, IngredientSupplierPrice } from "@gelato/gelato-core";

@Injectable()
export class PrismaIngredientCatalogRepository implements IngredientCatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<IngredientCatalogEntity[]> {
    const ingredients = await this.prisma.ingredientCatalog.findMany({
      include: { supplierPrices: { include: { supplier: true }, orderBy: { priceCOPPerKg: "asc" } } },
      orderBy: { name: "asc" }
    });
    return ingredients.map((ingredient) => this.toEntity(ingredient));
  }

  async findById(id: string): Promise<IngredientCatalogEntity | null> {
    const ingredient = await this.prisma.ingredientCatalog.findUnique({
      where: { id },
      include: { supplierPrices: { include: { supplier: true }, orderBy: { priceCOPPerKg: "asc" } } }
    });
    return ingredient ? this.toEntity(ingredient) : null;
  }

  async create(ingredient: IngredientCatalogEntity): Promise<IngredientCatalogEntity> {
    const created = await this.prisma.ingredientCatalog.create({
      data: {
        id: ingredient.id,
        name: ingredient.name,
        category: ingredient.category,
        composition: ingredient.composition as unknown as Prisma.InputJsonValue,
        basePriceCOPPerKg: ingredient.basePriceCOPPerKg,
        selectedSupplierId: ingredient.selectedSupplierId
      },
      include: { supplierPrices: { include: { supplier: true } } }
    });
    return this.toEntity(created);
  }

  async update(id: string, ingredient: Partial<IngredientCatalogEntity>): Promise<IngredientCatalogEntity> {
    const updated = await this.prisma.ingredientCatalog.update({
      where: { id },
      data: {
        name: ingredient.name,
        category: ingredient.category,
        composition: ingredient.composition as unknown as Prisma.InputJsonValue,
        basePriceCOPPerKg: ingredient.basePriceCOPPerKg,
        selectedSupplierId: ingredient.selectedSupplierId,
        updatedAt: new Date()
      },
      include: { supplierPrices: { include: { supplier: true }, orderBy: { priceCOPPerKg: "asc" } } }
    });
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.ingredientCatalog.delete({ where: { id } });
  }

  private toEntity(ingredient: {
    id: string;
    name: string;
    category: string;
    composition: Prisma.JsonValue;
    basePriceCOPPerKg: number;
    selectedSupplierId: string | null;
    supplierPrices?: Array<{
      id: string;
      ingredientId: string;
      supplierId: string;
      priceCOPPerKg: number;
      leadTimeDays: number;
      available: boolean;
      notes: string | null;
      createdAt: Date;
      updatedAt: Date;
      supplier?: {
        id: string;
        name: string;
        contactName: string | null;
        phone: string | null;
        email: string | null;
        notes: string | null;
        qualityScore: number;
        serviceScore: number;
        priceScore: number;
        deliveryScore: number;
        totalScore: number;
        createdAt: Date;
        updatedAt: Date;
      };
    }>;
    createdAt: Date;
    updatedAt: Date;
  }): IngredientCatalogEntity {
    const supplierPrices = (ingredient.supplierPrices ?? []).map((price) => ({
      id: price.id,
      ingredientId: price.ingredientId,
      supplierId: price.supplierId,
      priceCOPPerKg: price.priceCOPPerKg,
      leadTimeDays: price.leadTimeDays,
      available: price.available,
      notes: price.notes ?? undefined,
      createdAt: price.createdAt,
      updatedAt: price.updatedAt,
      supplier: price.supplier ? {
        id: price.supplier.id,
        name: price.supplier.name,
        contactName: price.supplier.contactName ?? undefined,
        phone: price.supplier.phone ?? undefined,
        email: price.supplier.email ?? undefined,
        notes: price.supplier.notes ?? undefined,
        qualityScore: price.supplier.qualityScore,
        serviceScore: price.supplier.serviceScore,
        priceScore: price.supplier.priceScore,
        deliveryScore: price.supplier.deliveryScore,
        totalScore: price.supplier.totalScore,
        createdAt: price.supplier.createdAt,
        updatedAt: price.supplier.updatedAt
      } : undefined
    })) satisfies IngredientSupplierPrice[];

    return new IngredientCatalogEntity(
      ingredient.id,
      ingredient.name,
      ingredient.category as IngredientCategory,
      ingredient.composition as unknown as IngredientComposition,
      ingredient.basePriceCOPPerKg,
      ingredient.selectedSupplierId,
      supplierPrices,
      ingredient.createdAt,
      ingredient.updatedAt
    );
  }
}

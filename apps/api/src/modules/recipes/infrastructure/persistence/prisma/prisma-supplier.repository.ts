import { Injectable } from "@nestjs/common";
import { SupplierEntity } from "../../../domain/entities/supplier.entity";
import { SupplierRepository } from "../../../domain/ports/supplier.repository";
import { PrismaService } from "./prisma.service";
import { IngredientSupplierPrice } from "@gelato/gelato-core";

@Injectable()
export class PrismaSupplierRepository implements SupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<SupplierEntity[]> {
    const suppliers = await this.prisma.supplier.findMany({ orderBy: [{ totalScore: "desc" }, { name: "asc" }] });
    return suppliers.map((supplier) => this.toEntity(supplier));
  }

  async findById(id: string): Promise<SupplierEntity | null> {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    return supplier ? this.toEntity(supplier) : null;
  }

  async create(supplier: SupplierEntity): Promise<SupplierEntity> {
    const created = await this.prisma.supplier.create({
      data: {
        id: supplier.id,
        name: supplier.name,
        contactName: supplier.contactName,
        phone: supplier.phone,
        email: supplier.email,
        notes: supplier.notes,
        qualityScore: supplier.qualityScore,
        serviceScore: supplier.serviceScore,
        priceScore: supplier.priceScore,
        deliveryScore: supplier.deliveryScore,
        totalScore: supplier.totalScore
      }
    });
    return this.toEntity(created);
  }

  async update(id: string, supplier: Partial<SupplierEntity>): Promise<SupplierEntity> {
    const updated = await this.prisma.supplier.update({
      where: { id },
      data: {
        name: supplier.name,
        contactName: supplier.contactName,
        phone: supplier.phone,
        email: supplier.email,
        notes: supplier.notes,
        qualityScore: supplier.qualityScore,
        serviceScore: supplier.serviceScore,
        priceScore: supplier.priceScore,
        deliveryScore: supplier.deliveryScore,
        totalScore: supplier.totalScore,
        updatedAt: new Date()
      }
    });
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.supplier.delete({ where: { id } });
  }

  async upsertPrice(
    supplierId: string,
    price: Omit<IngredientSupplierPrice, "id" | "supplierId" | "supplier" | "createdAt" | "updatedAt">
  ): Promise<IngredientSupplierPrice> {
    const saved = await this.prisma.supplierIngredientPrice.upsert({
      where: { ingredientId_supplierId: { ingredientId: price.ingredientId, supplierId } },
      update: {
        priceCOPPerKg: price.priceCOPPerKg,
        leadTimeDays: price.leadTimeDays,
        available: price.available,
        notes: price.notes,
        updatedAt: new Date()
      },
      create: {
        ingredientId: price.ingredientId,
        supplierId,
        priceCOPPerKg: price.priceCOPPerKg,
        leadTimeDays: price.leadTimeDays,
        available: price.available,
        notes: price.notes
      },
      include: { supplier: true }
    });
    return this.toPrice(saved);
  }

  async updatePrice(id: string, price: Partial<IngredientSupplierPrice>): Promise<IngredientSupplierPrice> {
    const updated = await this.prisma.supplierIngredientPrice.update({
      where: { id },
      data: {
        priceCOPPerKg: price.priceCOPPerKg,
        leadTimeDays: price.leadTimeDays,
        available: price.available,
        notes: price.notes,
        updatedAt: new Date()
      },
      include: { supplier: true }
    });
    return this.toPrice(updated);
  }

  async deletePrice(id: string): Promise<void> {
    await this.prisma.supplierIngredientPrice.delete({ where: { id } });
  }

  private toEntity(supplier: {
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
  }): SupplierEntity {
    return new SupplierEntity(
      supplier.id,
      supplier.name,
      supplier.qualityScore,
      supplier.serviceScore,
      supplier.priceScore,
      supplier.deliveryScore,
      supplier.totalScore,
      supplier.createdAt,
      supplier.updatedAt,
      supplier.contactName ?? undefined,
      supplier.phone ?? undefined,
      supplier.email ?? undefined,
      supplier.notes ?? undefined
    );
  }

  private toPrice(price: {
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
  }): IngredientSupplierPrice {
    return {
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
    };
  }
}

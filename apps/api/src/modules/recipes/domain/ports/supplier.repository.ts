import { SupplierEntity } from "../entities/supplier.entity";
import { IngredientSupplierPrice } from "@gelato/gelato-core";

export const SUPPLIER_REPOSITORY = Symbol("SUPPLIER_REPOSITORY");

export interface SupplierRepository {
  findAll(): Promise<SupplierEntity[]>;
  findById(id: string): Promise<SupplierEntity | null>;
  create(supplier: SupplierEntity): Promise<SupplierEntity>;
  update(id: string, supplier: Partial<SupplierEntity>): Promise<SupplierEntity>;
  delete(id: string): Promise<void>;
  upsertPrice(supplierId: string, price: Omit<IngredientSupplierPrice, "id" | "supplierId" | "supplier" | "createdAt" | "updatedAt">): Promise<IngredientSupplierPrice>;
  updatePrice(id: string, price: Partial<IngredientSupplierPrice>): Promise<IngredientSupplierPrice>;
  deletePrice(id: string): Promise<void>;
}

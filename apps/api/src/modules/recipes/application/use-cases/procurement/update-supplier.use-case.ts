import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { calculateSupplierTotalScore } from "@gelato/gelato-core";
import { SUPPLIER_REPOSITORY, SupplierRepository } from "../../../domain/ports/supplier.repository";
import { UpsertSupplierDto } from "../../dto/procurement.dto";

@Injectable()
export class UpdateSupplierUseCase {
  constructor(@Inject(SUPPLIER_REPOSITORY) private readonly repository: SupplierRepository) {}

  async execute(id: string, input: UpsertSupplierDto) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException("Supplier not found");
    return this.repository.update(id, {
      name: input.name,
      contactName: input.contactName,
      phone: input.phone,
      email: input.email,
      notes: input.notes,
      qualityScore: input.qualityScore,
      serviceScore: input.serviceScore,
      priceScore: input.priceScore,
      deliveryScore: input.deliveryScore,
      totalScore: calculateSupplierTotalScore(input),
      updatedAt: new Date()
    });
  }
}

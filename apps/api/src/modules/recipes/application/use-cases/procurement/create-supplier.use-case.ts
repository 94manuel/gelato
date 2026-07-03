import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { calculateSupplierTotalScore } from "@gelato/gelato-core";
import { SupplierEntity } from "../../../domain/entities/supplier.entity";
import { SUPPLIER_REPOSITORY, SupplierRepository } from "../../../domain/ports/supplier.repository";
import { UpsertSupplierDto } from "../../dto/procurement.dto";

@Injectable()
export class CreateSupplierUseCase {
  constructor(@Inject(SUPPLIER_REPOSITORY) private readonly repository: SupplierRepository) {}

  execute(input: UpsertSupplierDto) {
    const now = new Date();
    const totalScore = calculateSupplierTotalScore(input);
    return this.repository.create(new SupplierEntity(
      randomUUID(),
      input.name,
      input.qualityScore,
      input.serviceScore,
      input.priceScore,
      input.deliveryScore,
      totalScore,
      now,
      now,
      input.contactName,
      input.phone,
      input.email,
      input.notes
    ));
  }
}

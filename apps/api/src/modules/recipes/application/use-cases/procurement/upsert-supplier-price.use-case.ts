import { Inject, Injectable } from "@nestjs/common";
import { SUPPLIER_REPOSITORY, SupplierRepository } from "../../../domain/ports/supplier.repository";
import { UpsertSupplierPriceDto } from "../../dto/procurement.dto";

@Injectable()
export class UpsertSupplierPriceUseCase {
  constructor(@Inject(SUPPLIER_REPOSITORY) private readonly repository: SupplierRepository) {}
  execute(supplierId: string, input: UpsertSupplierPriceDto) {
    return this.repository.upsertPrice(supplierId, input);
  }
}

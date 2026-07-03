import { Inject, Injectable } from "@nestjs/common";
import { SUPPLIER_REPOSITORY, SupplierRepository } from "../../../domain/ports/supplier.repository";
import { UpsertSupplierPriceDto } from "../../dto/procurement.dto";

@Injectable()
export class UpdateSupplierPriceUseCase {
  constructor(@Inject(SUPPLIER_REPOSITORY) private readonly repository: SupplierRepository) {}
  execute(id: string, input: Partial<UpsertSupplierPriceDto>) {
    return this.repository.updatePrice(id, input);
  }
}

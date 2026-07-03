import { Inject, Injectable } from "@nestjs/common";
import { SUPPLIER_REPOSITORY, SupplierRepository } from "../../../domain/ports/supplier.repository";

@Injectable()
export class DeleteSupplierPriceUseCase {
  constructor(@Inject(SUPPLIER_REPOSITORY) private readonly repository: SupplierRepository) {}
  execute(id: string) {
    return this.repository.deletePrice(id);
  }
}

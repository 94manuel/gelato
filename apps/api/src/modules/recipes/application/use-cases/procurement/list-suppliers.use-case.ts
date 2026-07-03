import { Inject, Injectable } from "@nestjs/common";
import { SUPPLIER_REPOSITORY, SupplierRepository } from "../../../domain/ports/supplier.repository";

@Injectable()
export class ListSuppliersUseCase {
  constructor(@Inject(SUPPLIER_REPOSITORY) private readonly repository: SupplierRepository) {}
  execute() {
    return this.repository.findAll();
  }
}

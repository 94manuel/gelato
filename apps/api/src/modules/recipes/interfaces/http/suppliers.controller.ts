import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { CreateSupplierUseCase } from "../../application/use-cases/procurement/create-supplier.use-case";
import { DeleteSupplierUseCase } from "../../application/use-cases/procurement/delete-supplier.use-case";
import { DeleteSupplierPriceUseCase } from "../../application/use-cases/procurement/delete-supplier-price.use-case";
import { ListSuppliersUseCase } from "../../application/use-cases/procurement/list-suppliers.use-case";
import { UpdateSupplierUseCase } from "../../application/use-cases/procurement/update-supplier.use-case";
import { UpdateSupplierPriceUseCase } from "../../application/use-cases/procurement/update-supplier-price.use-case";
import { UpsertSupplierPriceUseCase } from "../../application/use-cases/procurement/upsert-supplier-price.use-case";
import { UpsertSupplierDto, UpsertSupplierPriceDto } from "../../application/dto/procurement.dto";

@ApiTags("suppliers")
@Controller()
export class SuppliersController {
  constructor(
    private readonly listSuppliers: ListSuppliersUseCase,
    private readonly createSupplier: CreateSupplierUseCase,
    private readonly updateSupplier: UpdateSupplierUseCase,
    private readonly deleteSupplier: DeleteSupplierUseCase,
    private readonly upsertSupplierPrice: UpsertSupplierPriceUseCase,
    private readonly updateSupplierPrice: UpdateSupplierPriceUseCase,
    private readonly deleteSupplierPrice: DeleteSupplierPriceUseCase
  ) {}

  @Get("suppliers")
  @ApiOperation({ summary: "Listar proveedores ordenados por puntaje" })
  @ApiOkResponse({ description: "Proveedores con puntaje ponderado" })
  list() {
    return this.listSuppliers.execute();
  }

  @Post("suppliers")
  @ApiOperation({ summary: "Crear proveedor" })
  @ApiBody({ type: UpsertSupplierDto })
  create(@Body() body: UpsertSupplierDto) {
    return this.createSupplier.execute(body);
  }

  @Put("suppliers/:id")
  @ApiOperation({ summary: "Actualizar proveedor y recalcular puntaje" })
  @ApiParam({ name: "id", example: "supplier-id" })
  @ApiBody({ type: UpsertSupplierDto })
  update(@Param("id") id: string, @Body() body: UpsertSupplierDto) {
    return this.updateSupplier.execute(id, body);
  }

  @Delete("suppliers/:id")
  @ApiOperation({ summary: "Eliminar proveedor" })
  @ApiParam({ name: "id", example: "supplier-id" })
  delete(@Param("id") id: string) {
    return this.deleteSupplier.execute(id);
  }

  @Post("suppliers/:id/prices")
  @ApiOperation({ summary: "Crear o actualizar precio de un ingrediente para un proveedor" })
  @ApiParam({ name: "id", example: "supplier-id" })
  @ApiBody({ type: UpsertSupplierPriceDto })
  upsertPrice(@Param("id") supplierId: string, @Body() body: UpsertSupplierPriceDto) {
    return this.upsertSupplierPrice.execute(supplierId, body);
  }

  @Put("supplier-prices/:id")
  @ApiOperation({ summary: "Editar precio de proveedor" })
  @ApiParam({ name: "id", example: "price-id" })
  @ApiBody({ type: UpsertSupplierPriceDto })
  updatePrice(@Param("id") id: string, @Body() body: UpsertSupplierPriceDto) {
    return this.updateSupplierPrice.execute(id, body);
  }

  @Delete("supplier-prices/:id")
  @ApiOperation({ summary: "Eliminar precio de proveedor" })
  @ApiParam({ name: "id", example: "price-id" })
  deletePrice(@Param("id") id: string) {
    return this.deleteSupplierPrice.execute(id);
  }
}

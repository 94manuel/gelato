import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { DEFAULT_INGREDIENTS } from "@gelato/gelato-core";
import { CreateIngredientUseCase } from "../../application/use-cases/procurement/create-ingredient.use-case";
import { DeleteIngredientUseCase } from "../../application/use-cases/procurement/delete-ingredient.use-case";
import { ListIngredientsUseCase } from "../../application/use-cases/procurement/list-ingredients.use-case";
import { UpdateIngredientUseCase } from "../../application/use-cases/procurement/update-ingredient.use-case";
import { ProcurementSeedDto, UpsertIngredientCatalogDto } from "../../application/dto/procurement.dto";

@ApiTags("catalog")
@Controller("catalog/ingredients")
export class IngredientCatalogController {
  constructor(
    private readonly listIngredients: ListIngredientsUseCase,
    private readonly createIngredient: CreateIngredientUseCase,
    private readonly updateIngredient: UpdateIngredientUseCase,
    private readonly deleteIngredient: DeleteIngredientUseCase
  ) {}

  @Get()
  @ApiOperation({ summary: "Listar ingredientes propios con precios y proveedores" })
  @ApiOkResponse({ description: "Ingredientes creados por el negocio" })
  async list() {
    const saved = await this.listIngredients.execute();
    return saved.length > 0 ? saved : DEFAULT_INGREDIENTS.map((ingredient) => ({
      ...ingredient,
      basePriceCOPPerKg: ingredient.composition.costCOPPerKg ?? 0,
      supplierPrices: []
    }));
  }

  @Post("seed")
  @ApiOperation({ summary: "Crear el catálogo técnico base en la base de datos" })
  @ApiBody({ type: ProcurementSeedDto })
  @ApiOkResponse({ description: "Catálogo base creado o ignorado si ya existía" })
  async seed(@Body() body: ProcurementSeedDto) {
    if (!body.seedDefaultIngredients) return this.listIngredients.execute();
    const existing = await this.listIngredients.execute();
    if (existing.length > 0) return existing;
    for (const ingredient of DEFAULT_INGREDIENTS) {
      await this.createIngredient.execute({
        name: ingredient.name,
        category: ingredient.category,
        composition: ingredient.composition,
        basePriceCOPPerKg: ingredient.composition.costCOPPerKg ?? 0
      }, ingredient.id);
    }
    return this.listIngredients.execute();
  }

  @Post()
  @ApiOperation({ summary: "Crear ingrediente editable" })
  @ApiBody({ type: UpsertIngredientCatalogDto })
  create(@Body() body: UpsertIngredientCatalogDto) {
    return this.createIngredient.execute(body);
  }

  @Put(":id")
  @ApiOperation({ summary: "Actualizar ingrediente, composición y precio base" })
  @ApiParam({ name: "id", example: "ingredient-id" })
  @ApiBody({ type: UpsertIngredientCatalogDto })
  update(@Param("id") id: string, @Body() body: UpsertIngredientCatalogDto) {
    return this.updateIngredient.execute(id, body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar ingrediente" })
  @ApiParam({ name: "id", example: "ingredient-id" })
  delete(@Param("id") id: string) {
    return this.deleteIngredient.execute(id);
  }
}

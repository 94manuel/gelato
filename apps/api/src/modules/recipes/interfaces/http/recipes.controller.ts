import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { DEFAULT_INGREDIENTS, RecipeType } from "@gelato/gelato-core";
import { localRecipeForCoffeeGelato, localRecipeTemplateForType } from "../../infrastructure/templates/recipe-templates";
import { CalculateRecipeUseCase } from "../../application/use-cases/calculate-recipe.use-case";
import { CreateRecipeUseCase } from "../../application/use-cases/create-recipe.use-case";
import { DeleteRecipeUseCase } from "../../application/use-cases/delete-recipe.use-case";
import { ListRecipesUseCase } from "../../application/use-cases/list-recipes.use-case";
import { UpdateRecipeUseCase } from "../../application/use-cases/update-recipe.use-case";
import { ListProductionRecipesUseCase } from "../../application/use-cases/list-production-recipes.use-case";
import { GetRecipeTimelineUseCase } from "../../application/use-cases/get-recipe-timeline.use-case";
import { AddRecipeNoteUseCase } from "../../application/use-cases/add-recipe-note.use-case";
import { ApproveRecipeProductionUseCase } from "../../application/use-cases/approve-recipe-production.use-case";
import { RestoreRecipeVersionUseCase } from "../../application/use-cases/restore-recipe-version.use-case";
import { ApproveRecipeVersionProductionUseCase } from "../../application/use-cases/approve-recipe-version-production.use-case";
import { AddRecipeNoteDto, ApproveRecipeForProductionDto, ApproveRecipeVersionForProductionDto, RestoreRecipeVersionDto, UpsertRecipeDto, ScaleRecipeDto } from "../../application/dto/recipe.dto";

@ApiTags("recipes")
@Controller("recipes")
export class RecipesController {
  constructor(
    private readonly calculateRecipe: CalculateRecipeUseCase,
    private readonly createRecipe: CreateRecipeUseCase,
    private readonly updateRecipe: UpdateRecipeUseCase,
    private readonly listRecipes: ListRecipesUseCase,
    private readonly deleteRecipe: DeleteRecipeUseCase,
    private readonly listProductionRecipes: ListProductionRecipesUseCase,
    private readonly getRecipeTimeline: GetRecipeTimelineUseCase,
    private readonly addRecipeNote: AddRecipeNoteUseCase,
    private readonly approveRecipeProduction: ApproveRecipeProductionUseCase,
    private readonly restoreRecipeVersion: RestoreRecipeVersionUseCase,
    private readonly approveRecipeVersionProduction: ApproveRecipeVersionProductionUseCase
  ) {}

  @Get()
  @ApiOperation({ summary: "Listar recetas guardadas" })
  @ApiOkResponse({ description: "Listado de recetas" })
  list() {
    return this.listRecipes.execute();
  }


  @Get("production")
  @ApiOperation({ summary: "Listar recetas aprobadas para producción" })
  @ApiOkResponse({ description: "Recetas aprobadas para que producción las prepare" })
  production() {
    return this.listProductionRecipes.execute();
  }

  @Get("ingredients")
  @ApiOperation({ summary: "Listar ingredientes base disponibles" })
  @ApiOkResponse({ description: "Catálogo técnico de ingredientes con composición" })
  ingredients() {
    return DEFAULT_INGREDIENTS;
  }

  @Get("examples/coffee")
  @ApiOperation({ summary: "Obtener ejemplo balanceado de gelato de café" })
  @ApiOkResponse({ description: "Receta de café de 1 kg con balance técnico" })
  coffeeExample() {
    const recipe = localRecipeForCoffeeGelato(1000);
    return { recipe, balance: this.calculateRecipe.execute(recipe) };
  }

  @Get("examples/:type")
  @ApiOperation({ summary: "Obtener plantilla balanceada por tipo de helado" })
  @ApiParam({ name: "type", example: "lulo" })
  @ApiOkResponse({ description: "Receta base con ingredientes separados por base y saborizante" })
  exampleByType(@Param("type") type: RecipeType) {
    const recipe = localRecipeTemplateForType(type, 1000);
    return { recipe, balance: this.calculateRecipe.execute(recipe) };
  }

  @Post("calculate")
  @ApiOperation({ summary: "Calcular balance de una receta sin guardarla" })
  @ApiBody({ type: UpsertRecipeDto })
  @ApiOkResponse({ description: "Indicadores técnicos de balance, métricas y recomendaciones" })
  calculate(@Body() body: UpsertRecipeDto) {
    return this.calculateRecipe.execute(body);
  }

  @Post("scale")
  @ApiOperation({ summary: "Escalar receta a un peso deseado" })
  @ApiBody({ type: ScaleRecipeDto })
  @ApiOkResponse({ description: "Receta recalculada para el peso solicitado" })
  scale(@Body() body: ScaleRecipeDto) {
    return this.calculateRecipe.execute({ ...body, targetWeightGrams: body.desiredWeightGrams });
  }

  @Post()
  @ApiOperation({ summary: "Crear receta" })
  @ApiBody({ type: UpsertRecipeDto })
  @ApiOkResponse({ description: "Receta creada" })
  create(@Body() body: UpsertRecipeDto) {
    return this.createRecipe.execute(body);
  }

  @Put(":id")
  @ApiOperation({ summary: "Actualizar receta" })
  @ApiParam({ name: "id", example: "recipe-id" })
  @ApiBody({ type: UpsertRecipeDto })
  @ApiOkResponse({ description: "Receta actualizada" })
  update(@Param("id") id: string, @Body() body: UpsertRecipeDto) {
    return this.updateRecipe.execute(id, body);
  }


  @Get(":id/timeline")
  @ApiOperation({ summary: "Ver notas e historial de ensayos de una receta" })
  @ApiParam({ name: "id", example: "recipe-id" })
  @ApiOkResponse({ description: "Receta, notas, calificaciones e historial por versión" })
  timeline(@Param("id") id: string) {
    return this.getRecipeTimeline.execute(id);
  }

  @Post(":id/notes")
  @ApiOperation({ summary: "Agregar nota de ensayo con calificación" })
  @ApiParam({ name: "id", example: "recipe-id" })
  @ApiBody({ type: AddRecipeNoteDto })
  @ApiOkResponse({ description: "Nota agregada e historial actualizado" })
  addNote(@Param("id") id: string, @Body() body: AddRecipeNoteDto) {
    return this.addRecipeNote.execute(id, body);
  }

  @Post(":id/approve-production")
  @ApiOperation({ summary: "Aprobar receta para producción" })
  @ApiParam({ name: "id", example: "recipe-id" })
  @ApiBody({ type: ApproveRecipeForProductionDto })
  @ApiOkResponse({ description: "Receta marcada como lista para producción" })
  approveProduction(@Param("id") id: string, @Body() body: ApproveRecipeForProductionDto) {
    return this.approveRecipeProduction.execute(id, body);
  }



  @Post(":id/versions/:versionNumber/restore")
  @ApiOperation({ summary: "Restaurar una versión histórica como nueva versión actual" })
  @ApiParam({ name: "id", example: "recipe-id" })
  @ApiParam({ name: "versionNumber", example: 2 })
  @ApiBody({ type: RestoreRecipeVersionDto })
  @ApiOkResponse({ description: "Versión restaurada. Se crea una nueva versión para conservar trazabilidad." })
  restoreVersion(@Param("id") id: string, @Param("versionNumber") versionNumber: string, @Body() body: RestoreRecipeVersionDto) {
    return this.restoreRecipeVersion.execute(id, Number(versionNumber), body);
  }

  @Post(":id/versions/:versionNumber/approve-production")
  @ApiOperation({ summary: "Aprobar una versión histórica específica para producción" })
  @ApiParam({ name: "id", example: "recipe-id" })
  @ApiParam({ name: "versionNumber", example: 2 })
  @ApiBody({ type: ApproveRecipeVersionForProductionDto })
  @ApiOkResponse({ description: "La versión seleccionada queda como fórmula oficial de producción." })
  approveVersionProduction(@Param("id") id: string, @Param("versionNumber") versionNumber: string, @Body() body: ApproveRecipeVersionForProductionDto) {
    return this.approveRecipeVersionProduction.execute(id, Number(versionNumber), body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar receta" })
  @ApiParam({ name: "id", example: "recipe-id" })
  @ApiOkResponse({ description: "Receta eliminada" })
  remove(@Param("id") id: string) {
    return this.deleteRecipe.execute(id);
  }
}

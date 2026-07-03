import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { calculateNeutralFormula } from "@gelato/gelato-core";
import { UpsertNeutralDto } from "../../application/dto/neutral.dto";
import { CreateNeutralUseCase } from "../../application/use-cases/create-neutral.use-case";
import { ListNeutralsUseCase } from "../../application/use-cases/list-neutrals.use-case";

@ApiTags("neutrals")
@Controller("neutrals")
export class NeutralsController {
  constructor(
    private readonly createNeutral: CreateNeutralUseCase,
    private readonly listNeutrals: ListNeutralsUseCase
  ) {}

  @Get()
  @ApiOperation({ summary: "Listar neutros guardados" })
  @ApiOkResponse({ description: "Listado de fórmulas de neutro" })
  list() {
    return this.listNeutrals.execute();
  }

  @Post("calculate")
  @ApiOperation({ summary: "Calcular un neutro propio sin guardarlo" })
  @ApiBody({ type: UpsertNeutralDto })
  @ApiOkResponse({ description: "Balance técnico del neutro, dosis recomendada y advertencias" })
  calculate(@Body() body: UpsertNeutralDto) {
    return calculateNeutralFormula(body);
  }

  @Post()
  @ApiOperation({ summary: "Crear fórmula de neutro propio" })
  @ApiBody({ type: UpsertNeutralDto })
  @ApiOkResponse({ description: "Neutro creado" })
  create(@Body() body: UpsertNeutralDto) {
    return this.createNeutral.execute(body);
  }
}

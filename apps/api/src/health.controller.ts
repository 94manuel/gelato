import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOkResponse({
    description: "Servicio activo",
    schema: {
      example: {
        status: "ok",
        service: "gelato-api",
        timestamp: "2026-07-02T20:00:00.000Z"
      }
    }
  })
  health() {
    return {
      status: "ok",
      service: "gelato-api",
      timestamp: new Date().toISOString()
    };
  }
}

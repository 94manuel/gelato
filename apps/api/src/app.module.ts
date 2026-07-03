import { Module } from "@nestjs/common";
import { RecipesModule } from "./modules/recipes/recipes.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [RecipesModule],
  controllers: [HealthController]
})
export class AppModule {}

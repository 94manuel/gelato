import "reflect-metadata";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? true,
    credentials: true
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Ñam Gelato Recipe Balance API")
    .setDescription("API para crear, editar, escalar y balancear recetas de gelato y neutros propios.")
    .setVersion("1.0.0")
    .addTag("health", "Estado del servicio")
    .addTag("recipes", "Recetas, ingredientes, cálculo y escalado")
    .addTag("neutrals", "Cálculo y creación de neutros propios")
    .addTag("catalog", "Ingredientes, composición técnica, precios y proveedor recomendado")
    .addTag("suppliers", "Proveedores, puntajes y precios por ingrediente")
    .addServer("http://localhost:3001", "Local API")
    .addServer("https://gelato.cybervestigio.com", "Production Ingress")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerUiOptions = {
    customSiteTitle: "Ñam Gelato API Docs",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "none",
      tagsSorter: "alpha",
      operationsSorter: "method"
    }
  };

  // Ruta principal recomendada. Con setGlobalPrefix("api"), Swagger NO hereda el prefijo automáticamente,
  // por eso se registra explícitamente en /api/docs.
  SwaggerModule.setup("api/docs", app, document, {
    ...swaggerUiOptions,
    jsonDocumentUrl: "/api/docs-json",
    yamlDocumentUrl: "/api/docs-yaml"
  });

  // Alias cómodo para desarrollo local: http://localhost:3001/docs
  SwaggerModule.setup("docs", app, document, {
    ...swaggerUiOptions,
    jsonDocumentUrl: "/docs-json",
    yamlDocumentUrl: "/docs-yaml"
  });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, "0.0.0.0");

  const logger = new Logger("Bootstrap");
  logger.log(`API NestJS lista en http://localhost:${port}`);
  logger.log(`Swagger disponible en http://localhost:${port}/api/docs`);
  logger.log(`Swagger alias local en http://localhost:${port}/docs`);
}

bootstrap();

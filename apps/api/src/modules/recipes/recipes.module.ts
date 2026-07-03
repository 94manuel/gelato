import { Module } from "@nestjs/common";
import { RECIPE_REPOSITORY } from "./domain/ports/recipe.repository";
import { NEUTRAL_REPOSITORY } from "./domain/ports/neutral.repository";
import { INGREDIENT_CATALOG_REPOSITORY } from "./domain/ports/ingredient-catalog.repository";
import { SUPPLIER_REPOSITORY } from "./domain/ports/supplier.repository";
import { GelatoBalanceDomainService } from "./domain/services/gelato-balance.domain-service";
import { CalculateRecipeUseCase } from "./application/use-cases/calculate-recipe.use-case";
import { CreateRecipeUseCase } from "./application/use-cases/create-recipe.use-case";
import { UpdateRecipeUseCase } from "./application/use-cases/update-recipe.use-case";
import { ListRecipesUseCase } from "./application/use-cases/list-recipes.use-case";
import { DeleteRecipeUseCase } from "./application/use-cases/delete-recipe.use-case";
import { ListProductionRecipesUseCase } from "./application/use-cases/list-production-recipes.use-case";
import { GetRecipeTimelineUseCase } from "./application/use-cases/get-recipe-timeline.use-case";
import { AddRecipeNoteUseCase } from "./application/use-cases/add-recipe-note.use-case";
import { ApproveRecipeProductionUseCase } from "./application/use-cases/approve-recipe-production.use-case";
import { RestoreRecipeVersionUseCase } from "./application/use-cases/restore-recipe-version.use-case";
import { ApproveRecipeVersionProductionUseCase } from "./application/use-cases/approve-recipe-version-production.use-case";
import { CreateNeutralUseCase } from "./application/use-cases/create-neutral.use-case";
import { ListNeutralsUseCase } from "./application/use-cases/list-neutrals.use-case";
import { ListIngredientsUseCase } from "./application/use-cases/procurement/list-ingredients.use-case";
import { CreateIngredientUseCase } from "./application/use-cases/procurement/create-ingredient.use-case";
import { UpdateIngredientUseCase } from "./application/use-cases/procurement/update-ingredient.use-case";
import { DeleteIngredientUseCase } from "./application/use-cases/procurement/delete-ingredient.use-case";
import { ListSuppliersUseCase } from "./application/use-cases/procurement/list-suppliers.use-case";
import { CreateSupplierUseCase } from "./application/use-cases/procurement/create-supplier.use-case";
import { UpdateSupplierUseCase } from "./application/use-cases/procurement/update-supplier.use-case";
import { DeleteSupplierUseCase } from "./application/use-cases/procurement/delete-supplier.use-case";
import { UpsertSupplierPriceUseCase } from "./application/use-cases/procurement/upsert-supplier-price.use-case";
import { UpdateSupplierPriceUseCase } from "./application/use-cases/procurement/update-supplier-price.use-case";
import { DeleteSupplierPriceUseCase } from "./application/use-cases/procurement/delete-supplier-price.use-case";
import { PrismaService } from "./infrastructure/persistence/prisma/prisma.service";
import { PrismaRecipeRepository } from "./infrastructure/persistence/prisma/prisma-recipe.repository";
import { PrismaNeutralRepository } from "./infrastructure/persistence/prisma/prisma-neutral.repository";
import { PrismaIngredientCatalogRepository } from "./infrastructure/persistence/prisma/prisma-ingredient-catalog.repository";
import { PrismaSupplierRepository } from "./infrastructure/persistence/prisma/prisma-supplier.repository";
import { RecipesController } from "./interfaces/http/recipes.controller";
import { NeutralsController } from "./interfaces/http/neutrals.controller";
import { IngredientCatalogController } from "./interfaces/http/ingredient-catalog.controller";
import { SuppliersController } from "./interfaces/http/suppliers.controller";

@Module({
  controllers: [RecipesController, NeutralsController, IngredientCatalogController, SuppliersController],
  providers: [
    PrismaService,
    GelatoBalanceDomainService,
    CalculateRecipeUseCase,
    CreateRecipeUseCase,
    UpdateRecipeUseCase,
    ListRecipesUseCase,
    DeleteRecipeUseCase,
    ListProductionRecipesUseCase,
    GetRecipeTimelineUseCase,
    AddRecipeNoteUseCase,
    ApproveRecipeProductionUseCase,
    RestoreRecipeVersionUseCase,
    ApproveRecipeVersionProductionUseCase,
    CreateNeutralUseCase,
    ListNeutralsUseCase,
    ListIngredientsUseCase,
    CreateIngredientUseCase,
    UpdateIngredientUseCase,
    DeleteIngredientUseCase,
    ListSuppliersUseCase,
    CreateSupplierUseCase,
    UpdateSupplierUseCase,
    DeleteSupplierUseCase,
    UpsertSupplierPriceUseCase,
    UpdateSupplierPriceUseCase,
    DeleteSupplierPriceUseCase,
    { provide: RECIPE_REPOSITORY, useClass: PrismaRecipeRepository },
    { provide: NEUTRAL_REPOSITORY, useClass: PrismaNeutralRepository },
    { provide: INGREDIENT_CATALOG_REPOSITORY, useClass: PrismaIngredientCatalogRepository },
    { provide: SUPPLIER_REPOSITORY, useClass: PrismaSupplierRepository }
  ]
})
export class RecipesModule {}

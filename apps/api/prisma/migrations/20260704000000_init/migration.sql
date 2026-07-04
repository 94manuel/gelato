-- Initial production schema for Ñam Gelato Lab.

CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetWeightGrams" DOUBLE PRECISION NOT NULL,
    "ingredients" JSONB NOT NULL,
    "balance" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bestRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "approvedForProduction" BOOLEAN NOT NULL DEFAULT false,
    "productionApprovedAt" TIMESTAMP(3),
    "productionApprovedBy" TEXT,
    "productionApprovedNotes" TEXT,
    "productionApprovedVersion" INTEGER,
    "productionSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecipeNote" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "author" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecipeNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecipeHistory" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "noteId" TEXT,
    "rating" DOUBLE PRECISION,
    "author" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecipeHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NeutralFormula" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetUsagePercent" DOUBLE PRECISION NOT NULL,
    "components" JSONB NOT NULL,
    "composition" JSONB NOT NULL,
    "balance" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NeutralFormula_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IngredientCatalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "composition" JSONB NOT NULL,
    "basePriceCOPPerKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "selectedSupplierId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IngredientCatalog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "qualityScore" INTEGER NOT NULL DEFAULT 80,
    "serviceScore" INTEGER NOT NULL DEFAULT 80,
    "priceScore" INTEGER NOT NULL DEFAULT 80,
    "deliveryScore" INTEGER NOT NULL DEFAULT 80,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupplierIngredientPrice" (
    "id" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "priceCOPPerKg" DOUBLE PRECISION NOT NULL,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 1,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SupplierIngredientPrice_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RecipeNote_recipeId_createdAt_idx" ON "RecipeNote"("recipeId", "createdAt");
CREATE INDEX "RecipeHistory_recipeId_createdAt_idx" ON "RecipeHistory"("recipeId", "createdAt");
CREATE UNIQUE INDEX "SupplierIngredientPrice_ingredientId_supplierId_key" ON "SupplierIngredientPrice"("ingredientId", "supplierId");

ALTER TABLE "RecipeNote" ADD CONSTRAINT "RecipeNote_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecipeHistory" ADD CONSTRAINT "RecipeHistory_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupplierIngredientPrice" ADD CONSTRAINT "SupplierIngredientPrice_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "IngredientCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupplierIngredientPrice" ADD CONSTRAINT "SupplierIngredientPrice_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

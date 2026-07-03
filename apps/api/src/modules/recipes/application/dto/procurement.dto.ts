import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEmail, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import { IngredientCategory } from "@gelato/gelato-core";
import { IngredientCompositionDto } from "./recipe.dto";

export class UpsertIngredientCatalogDto {
  @ApiProperty({ example: "Leche entera Colanta" })
  @IsString()
  name!: string;

  @ApiProperty({ example: "dairy", enum: ["dairy", "sugar", "flavor", "neutral", "fat", "other"] })
  @IsIn(["dairy", "sugar", "flavor", "neutral", "fat", "other"])
  category!: IngredientCategory;

  @ApiProperty({ type: IngredientCompositionDto })
  @ValidateNested()
  @Type(() => IngredientCompositionDto)
  composition!: IngredientCompositionDto;

  @ApiProperty({ example: 4500 })
  @IsNumber()
  @Min(0)
  basePriceCOPPerKg!: number;

  @ApiProperty({ example: "supplier-id", required: false })
  @IsOptional()
  @IsString()
  selectedSupplierId?: string | null;
}

export class UpsertSupplierDto {
  @ApiProperty({ example: "Distribuidora Láctea Bogotá" })
  @IsString()
  name!: string;

  @ApiProperty({ example: "María Gómez", required: false })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiProperty({ example: "+57 300 000 0000", required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: "ventas@proveedor.com", required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: "Entrega martes y jueves", required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 92 })
  @IsInt()
  @Min(0)
  @Max(100)
  qualityScore!: number;

  @ApiProperty({ example: 88 })
  @IsInt()
  @Min(0)
  @Max(100)
  serviceScore!: number;

  @ApiProperty({ example: 90 })
  @IsInt()
  @Min(0)
  @Max(100)
  priceScore!: number;

  @ApiProperty({ example: 85 })
  @IsInt()
  @Min(0)
  @Max(100)
  deliveryScore!: number;
}

export class UpsertSupplierPriceDto {
  @ApiProperty({ example: "ingredient-id" })
  @IsString()
  ingredientId!: string;

  @ApiProperty({ example: 4500 })
  @IsNumber()
  @Min(0)
  priceCOPPerKg!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  leadTimeDays!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  available!: boolean;

  @ApiProperty({ example: "Precio con IVA", required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ProcurementSeedDto {
  @ApiProperty({ example: true, description: "Si es true inserta el catálogo técnico base cuando no existe en BD." })
  @IsBoolean()
  seedDefaultIngredients!: boolean;
}

import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsIn, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import { RecipeType } from "@gelato/gelato-core";

export const RECIPE_TYPE_VALUES = [
  "milk",
  "fiordilatte",
  "vanilla",
  "coffee",
  "chocolate",
  "fruit",
  "lulo",
  "sorbet",
  "yogurt",
  "nut",
  "vegan"
] as const;

export class IngredientCompositionDto {
  @ApiProperty({ example: 87.5 })
  @IsNumber() water = 0;
  @ApiProperty({ example: 3.2 })
  @IsNumber() fat = 0;
  @ApiProperty({ example: 8.8 })
  @IsNumber() milkSolidsNonFat = 0;
  @ApiProperty({ example: 0 })
  @IsNumber() sucrose = 0;
  @ApiProperty({ example: 0 })
  @IsNumber() dextrose = 0;
  @ApiProperty({ example: 0 })
  @IsNumber() glucose = 0;
  @ApiProperty({ example: 0 })
  @IsNumber() fructose = 0;
  @ApiProperty({ example: 4.7 })
  @IsNumber() lactose = 0;
  @ApiProperty({ example: 0 })
  @IsNumber() stabilizer = 0;
  @ApiProperty({ example: 0 })
  @IsNumber() otherSolids = 0;
  @ApiProperty({ example: 3800, required: false })
  @IsOptional() @IsNumber() costCOPPerKg?: number;
}

export class RecipeIngredientDto {
  @ApiProperty({ example: "leche-entera" })
  @IsString()
  ingredientId!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 520 })
  @IsNumber()
  @Min(0)
  grams!: number;

  @ApiProperty({ example: "base", enum: ["base", "flavor"], required: false, description: "base = ingredientes técnicos requeridos; flavor = saborizante/aditivo de sabor" })
  @IsOptional()
  @IsIn(["base", "flavor"])
  section?: "base" | "flavor";

  @ApiProperty({ type: IngredientCompositionDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => IngredientCompositionDto)
  composition?: IngredientCompositionDto;
}

export class UpsertRecipeDto {
  @ApiProperty({ example: "Gelato de café" })
  @IsString()
  name!: string;

  @ApiProperty({ example: "coffee", enum: RECIPE_TYPE_VALUES })
  @IsIn(RECIPE_TYPE_VALUES)
  type!: RecipeType;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(1)
  targetWeightGrams!: number;

  @ApiProperty({ type: [RecipeIngredientDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients!: RecipeIngredientDto[];
}

export class ScaleRecipeDto extends UpsertRecipeDto {
  @ApiProperty({ example: 2000 })
  @IsNumber()
  @Min(1)
  desiredWeightGrams!: number;
}

export class AddRecipeNoteDto {
  @ApiProperty({ example: "La textura mejoró, pero falta subir aroma de café y bajar dulzor." })
  @IsString()
  comment!: string;

  @ApiProperty({ example: 4.75, minimum: 1, maximum: 5, description: "Calificación decimal entre 1.00 y 5.00" })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ example: "Manuel", required: false })
  @IsOptional()
  @IsString()
  author?: string;
}

export class ApproveRecipeForProductionDto {
  @ApiProperty({ example: "Manuel", required: false })
  @IsOptional()
  @IsString()
  approvedBy?: string;

  @ApiProperty({ example: "Aprobada después de prueba de vitrina. Usar lote de 2 kg para producción diaria.", required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RestoreRecipeVersionDto {
  @ApiProperty({ example: "Manuel", required: false })
  @IsOptional()
  @IsString()
  restoredBy?: string;

  @ApiProperty({ example: "Se regresa a esta versión porque tuvo mejor textura y menor dulzor.", required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApproveRecipeVersionForProductionDto {
  @ApiProperty({ example: "Manuel", required: false })
  @IsOptional()
  @IsString()
  approvedBy?: string;

  @ApiProperty({ example: "Aprobar la v2 porque fue la mejor prueba sensorial. Usar esta versión en producción.", required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

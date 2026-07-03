import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsIn, IsNumber, IsString, Min, ValidateNested } from "class-validator";
import { IngredientCompositionDto } from "./recipe.dto";

export class NeutralComponentDto {
  @ApiProperty({ example: "CMC" })
  @IsString()
  name!: string;

  @ApiProperty({ example: 45 })
  @IsNumber()
  @Min(0)
  grams!: number;

  @ApiProperty({ example: "stabilizer", enum: ["carrier", "stabilizer", "emulsifier", "fiber", "other"] })
  @IsIn(["carrier", "stabilizer", "emulsifier", "fiber", "other"])
  role!: "carrier" | "stabilizer" | "emulsifier" | "fiber" | "other";

  @ApiProperty({ type: IngredientCompositionDto })
  @ValidateNested()
  @Type(() => IngredientCompositionDto)
  composition!: IngredientCompositionDto;
}

export class UpsertNeutralDto {
  @ApiProperty({ example: "Neutro Ñam crema" })
  @IsString()
  name!: string;

  @ApiProperty({ example: 0.45, description: "Porcentaje de uso sobre el peso total de mezcla" })
  @IsNumber()
  @Min(0.1)
  targetUsagePercent!: number;

  @ApiProperty({ type: [NeutralComponentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NeutralComponentDto)
  components!: NeutralComponentDto[];
}

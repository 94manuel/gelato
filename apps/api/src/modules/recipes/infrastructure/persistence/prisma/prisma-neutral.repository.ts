import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { NeutralFormulaInput, NeutralFormulaResult } from "@gelato/gelato-core";
import { NeutralFormulaEntity } from "../../../domain/entities/neutral-formula.entity";
import { NeutralRepository } from "../../../domain/ports/neutral.repository";
import { PrismaService } from "./prisma.service";

@Injectable()
export class PrismaNeutralRepository implements NeutralRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(neutral: NeutralFormulaEntity): Promise<NeutralFormulaEntity> {
    const created = await this.prisma.neutralFormula.create({
      data: {
        id: neutral.id,
        name: neutral.name,
        targetUsagePercent: neutral.targetUsagePercent,
        components: neutral.components as unknown as Prisma.InputJsonValue,
        composition: neutral.composition as unknown as Prisma.InputJsonValue,
        balance: neutral.balance as unknown as Prisma.InputJsonValue
      }
    });
    return this.toEntity(created);
  }

  async findAll(): Promise<NeutralFormulaEntity[]> {
    const neutrals = await this.prisma.neutralFormula.findMany({ orderBy: { updatedAt: "desc" } });
    return neutrals.map((neutral) => this.toEntity(neutral));
  }

  async findById(id: string): Promise<NeutralFormulaEntity | null> {
    const neutral = await this.prisma.neutralFormula.findUnique({ where: { id } });
    return neutral ? this.toEntity(neutral) : null;
  }

  private toEntity(neutral: {
    id: string;
    name: string;
    targetUsagePercent: number;
    components: Prisma.JsonValue;
    composition: Prisma.JsonValue;
    balance: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return new NeutralFormulaEntity(
      neutral.id,
      neutral.name,
      neutral.targetUsagePercent,
      neutral.components as unknown as NeutralFormulaInput["components"],
      neutral.composition as unknown as NeutralFormulaResult["composition"],
      neutral.balance as unknown as NeutralFormulaResult,
      neutral.createdAt,
      neutral.updatedAt
    );
  }
}

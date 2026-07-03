import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { NeutralFormulaInput } from "@gelato/gelato-core";
import { NeutralFormulaEntity } from "../../domain/entities/neutral-formula.entity";
import { NEUTRAL_REPOSITORY, NeutralRepository } from "../../domain/ports/neutral.repository";
import { GelatoBalanceDomainService } from "../../domain/services/gelato-balance.domain-service";

@Injectable()
export class CreateNeutralUseCase {
  constructor(
    @Inject(NEUTRAL_REPOSITORY) private readonly repository: NeutralRepository,
    private readonly balanceService: GelatoBalanceDomainService
  ) {}

  async execute(input: NeutralFormulaInput) {
    const balance = this.balanceService.calculateNeutral(input);
    const neutral = new NeutralFormulaEntity(
      randomUUID(),
      input.name,
      input.targetUsagePercent,
      input.components,
      balance.composition,
      balance,
      new Date(),
      new Date()
    );
    return this.repository.create(neutral);
  }
}

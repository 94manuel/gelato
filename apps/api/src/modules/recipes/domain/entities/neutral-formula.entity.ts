import { NeutralFormulaInput, NeutralFormulaResult } from "@gelato/gelato-core";

export class NeutralFormulaEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public targetUsagePercent: number,
    public components: NeutralFormulaInput["components"],
    public composition: NeutralFormulaResult["composition"],
    public balance: NeutralFormulaResult,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}

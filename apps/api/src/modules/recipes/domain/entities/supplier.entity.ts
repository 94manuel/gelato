import { SupplierDefinition } from "@gelato/gelato-core";

export class SupplierEntity implements SupplierDefinition {
  constructor(
    public readonly id: string,
    public name: string,
    public qualityScore: number,
    public serviceScore: number,
    public priceScore: number,
    public deliveryScore: number,
    public totalScore: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public contactName?: string,
    public phone?: string,
    public email?: string,
    public notes?: string
  ) {}
}

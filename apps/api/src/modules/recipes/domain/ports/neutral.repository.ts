import { NeutralFormulaEntity } from "../entities/neutral-formula.entity";

export const NEUTRAL_REPOSITORY = Symbol("NEUTRAL_REPOSITORY");

export interface NeutralRepository {
  create(neutral: NeutralFormulaEntity): Promise<NeutralFormulaEntity>;
  findAll(): Promise<NeutralFormulaEntity[]>;
  findById(id: string): Promise<NeutralFormulaEntity | null>;
}

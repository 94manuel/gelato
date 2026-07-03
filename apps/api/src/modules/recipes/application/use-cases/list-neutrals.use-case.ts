import { Inject, Injectable } from "@nestjs/common";
import { NEUTRAL_REPOSITORY, NeutralRepository } from "../../domain/ports/neutral.repository";

@Injectable()
export class ListNeutralsUseCase {
  constructor(@Inject(NEUTRAL_REPOSITORY) private readonly repository: NeutralRepository) {}
  execute() {
    return this.repository.findAll();
  }
}

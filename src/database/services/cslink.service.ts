import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { CSLINK_REPOSITORY } from "../constants";
import { CSLink } from "../entities/cslink.entity";

@Injectable()
export class CSLinkService {
  constructor(
    @Inject(CSLINK_REPOSITORY)
    private linksRepository: Repository<CSLink>,
  ) {}

  async FindAllBySongGUID(guid: string): Promise<CSLink[]> {
    return this.linksRepository.createQueryBuilder().where("songGUID = :guid", {guid:guid}).getMany();
  }
}
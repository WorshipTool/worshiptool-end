import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { CSLINK_REPOSITORY } from "../constants";
import { CSVLink } from "../entities/csvlink.entity";

@Injectable()
export class CSVLinkService {
  constructor(
    @Inject(CSLINK_REPOSITORY)
    private linksRepository: Repository<CSVLink>,
  ) {}

  async FindAllBySVGUIDS(songGUID: string, variantGUIDS: string[]): Promise<CSVLink[]> {
    return this.linksRepository.createQueryBuilder()
      .where("songGUID = :guid", {guid:songGUID})
      .orWhere("variantGUID IN (:...guids)", {guids: variantGUIDS}).getMany();
  }
}
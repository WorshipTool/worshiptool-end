import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { CSLINK_REPOSITORY, CREATOR_REPOSITORY } from "../constants";
import { CSVLink } from "../entities/csvlink.entity";
import { Creator } from "../entities/creator.entity";
import { ICreatorLinkPair } from "../interfaces";
import { CSVLinkService } from "./csvlink.service";

@Injectable()
export class CreatorService {
  constructor(
    @Inject(CREATOR_REPOSITORY)
    private authorRepository: Repository<Creator>,
    
    private linksService: CSVLinkService,
  ) {}

  async findByGUID(guid: string): Promise<Creator> {
    return this.authorRepository.createQueryBuilder().where("guid= :guid", {guid: guid}).getOne();
  }

  async findBySVGUIDS(songGUID: string, variantGUIDS: string[]): Promise<ICreatorLinkPair[]>{
    let json : ICreatorLinkPair[] = [];
    const links = await this.linksService.FindAllBySVGUIDS(songGUID,variantGUIDS);
    
    for(let i=0; i<links.length; i++){
      const link = links[i];

      const author = await this.findByGUID(link.creatorGUID);
      const pair : ICreatorLinkPair = {creator: author, link: link};
      
      json.push(pair);
    }
    return json;
  }
}
import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { CSLINK_REPOSITORY, CREATOR_REPOSITORY } from "../constants";
import { CSLink } from "../entities/cslink.entity";
import { Creator } from "../entities/creator.entity";
import { ICreatorLinkPair } from "../interfaces";
import { CSLinkService } from "./cslink.service";

@Injectable()
export class CreatorService {
  constructor(
    @Inject(CREATOR_REPOSITORY)
    private authorRepository: Repository<Creator>,
    
    private linksService: CSLinkService,
  ) {}

  async findByGUID(guid: string): Promise<Creator> {
    return this.authorRepository.createQueryBuilder().where("guid= :guid", {guid: guid}).getOne();
  }

  async findBySong(guid: string): Promise<ICreatorLinkPair[]>{
    let json : ICreatorLinkPair[] = [];
    const links = await this.linksService.FindAllBySongGUID(guid);
    
    for(let i=0; i<links.length; i++){
      const link = links[i];

      const author = await this.findByGUID(link.creatorGUID);
      const pair : ICreatorLinkPair = {creator: author, link: link};
      
      json.push(pair);
    }
    return json;
  }
}
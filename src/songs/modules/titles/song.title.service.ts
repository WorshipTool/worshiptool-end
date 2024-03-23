import { Inject, Injectable } from "@nestjs/common";
import { SONG_TITLE_REPOSITORY } from "../../../database/constants";
import { Repository } from "typeorm";
import { SongTitle } from "../../../database/entities/songtitle.entity";
import normalizeSearchText from "../../../tech/normalizeSearchText";
import { User } from "../../../database/entities/user.entity";

@Injectable()
export class SongTitleService{
    constructor(
        @Inject(SONG_TITLE_REPOSITORY)
        private titleRepository: Repository<SongTitle>
    ){}

    /**
     * Creates new instance of title
     * @param title 
     * @returns new title object
     */
    async createTitleObject(title:string){
        // Create new title
        const titleData : SongTitle = {
            guid:undefined,
            variant: undefined,
            title: title,
            searchValue: normalizeSearchText(title)
        }
        const result = await this.titleRepository.insert(titleData);
        return await this.titleRepository.findOne({where:{guid:result.identifiers[0].guid}});
    }

    /**
     * Edit title
     */
    async editTitle(titleObject:SongTitle, title:string, user:User){

        titleObject = await this.titleRepository.findOne({
            where:{guid:titleObject.guid},
            relations: {
                variant: {
                    createdBy: true
                }
            }
        });

        if(!titleObject) throw new Error("Title not found.");

        const createdBy = titleObject.variant.createdBy;
        if(createdBy.guid !== user.guid) throw new Error("Title can be edited only by creator.");

        
        titleObject.title = title;
        titleObject.searchValue = normalizeSearchText(title);
        return await this.titleRepository.save(titleObject);
    }
}
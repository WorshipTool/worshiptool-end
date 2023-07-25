import { Inject, Injectable } from "@nestjs/common";
import { GROUP_REPOSITORY } from "src/database/constants";
import { Group } from "src/database/entities/group.entity";
import { Repository } from "typeorm";

@Injectable()
export class GroupService{

    constructor(
        
        @Inject(GROUP_REPOSITORY)
        private groupRepository: Repository<Group>,
    ){}

    async getCount() : Promise<number>{
        return await this.groupRepository.count();
    }

    async getGroupsNames(){
        return (await this.groupRepository.find()).map(g=>g.name);
    }

}
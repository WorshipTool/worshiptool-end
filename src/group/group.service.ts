import { Inject, Injectable, Post } from '@nestjs/common';
import { GROUP_REPOSITORY, PLAYLIST_REPOSITORY } from "src/database/constants";
import { Group } from "src/database/entities/group.entity";
import { Repository } from "typeorm";
import { DeleteGroupQuery, GetGroupInfoQuery, PostCreateGroupBody, PostCreateGroupResult } from './dtos';
import { RequestResult, codes, formatted, isRequestError, isRequestSuccess, messages } from 'src/utils/formatted';
import { create } from 'domain';
import { Playlist } from 'src/database/entities/playlist.entity';
import { User } from 'src/database/entities/user.entity';
import { PlaylistService } from 'src/songs/services/playlists/playlist.service';

@Injectable()
export class GroupService{

    constructor(
        
        @Inject(GROUP_REPOSITORY)
        private groupRepository: Repository<Group>,

        @Inject(PLAYLIST_REPOSITORY)
        private playlistRepository: Repository<Playlist>,

        private playlistService: PlaylistService
    ){}

    async getCount() : Promise<number>{
        return await this.groupRepository.count();
    }

    async getGroupsList(){
        return (await this.groupRepository.find());
    }

    async createGroupSelection(owner: User, name: string) : Promise<Playlist>{
        const result =  await this.playlistRepository.createQueryBuilder().insert().values({title: `${name} Selection`, owner, isSelection: true}).execute();
        const guid = (result.identifiers[0].guid)
        return await this.playlistRepository.findOne({where:{guid}});
    }

    async createGroup(data: PostCreateGroupBody, user: User) : Promise<RequestResult<PostCreateGroupResult>>{
        if(await this.groupRepository.findOne({where:{name: data.name}})){
            return formatted(undefined, codes['This name is already taken']);
        };

        // Create an selection
        const selection = await this.createGroupSelection(user, data.name);

        // Create group and add selection
        const group = await this.groupRepository.createQueryBuilder()
            .insert().values({name: data.name, selection, admin: user}).execute();

        const guid = group.identifiers[0].guid;

        const newGroup = await this.groupRepository.findOne({where:{guid: guid}});
        return formatted({
            guid: newGroup.guid,
            name: newGroup.name,
            selection: selection.guid
        });
    }

    async getGroupByGuid(guid: string) : Promise<Group>{
        return await this.groupRepository.findOne({where:{guid}, relations: {selection: true}});
    }
    async getGroupByName(name: string) : Promise<Group>{
        return await this.groupRepository.findOne({where:{name}, relations: {selection: true}});
    }

    async getGroupSelectionGuid(groupGuid: string) : Promise<RequestResult<any>>{
        const group =  await this.groupRepository.findOne({where:{guid:groupGuid}, relations: {selection: true}});
        if(!group)return formatted(undefined, codes['Not Found']);

        return formatted(group.selection.guid);
    }

    async deleteGroup(params: DeleteGroupQuery) : Promise<RequestResult<any>>{
        const group = params.guid ? await this.getGroupByGuid(params.guid) : await this.getGroupByName(params.name);
        if(!group)return formatted(undefined, codes['Not Found']);

        await this.groupRepository.createQueryBuilder().delete().where(group).execute();
        return formatted(undefined);
    }

    async getGroupSelection(guid: string) : Promise<RequestResult<any>>{
        if(!guid)return formatted(undefined, codes['Bad Request'], "No guid provided");

        const selection = await this.getGroupSelectionGuid(guid);
        if(isRequestError(selection))return selection;

        return this.playlistService.getVariantsInPlaylist(selection.data);
    }

    async getGroupInfo(params: GetGroupInfoQuery) : Promise<RequestResult<any>>{
        if(!params.guid && !params.name) return formatted(undefined, codes['Bad Request'], "Neither guid or name not provided");

        const group = (params.guid) ? (await this.getGroupByGuid(params.guid)) : (await this.getGroupByName(params.name));

        if(!group)return formatted(undefined, codes['Not Found']);

        return formatted({
            name: group.name,
            guid: group.guid,
            selection: group.selection.guid
        });
    }

}
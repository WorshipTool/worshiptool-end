import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Post } from '@nestjs/common';
import { Repository } from 'typeorm';
import { GROUP_REPOSITORY, PLAYLIST_REPOSITORY } from '../database/constants';
import { Group } from '../database/entities/group.entity';
import { Playlist } from '../database/entities/playlist.entity';
import { User } from '../database/entities/user.entity';
import { GetVariantsInPlaylistResult } from '../songs/modules/playlists/playlist.dto';
import { PlaylistService } from '../songs/modules/playlists/playlist.service';
import { PostCreateGroupBody, PostCreateGroupResult, DeleteGroupQuery, GetGroupInfoQuery, GetGroupInfoResult } from './group.dto';

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

    async createGroup(data: PostCreateGroupBody, user: User) : Promise<PostCreateGroupResult>{
        if(await this.groupRepository.findOne({where:{name: data.name}})){
            throw new ConflictException("This name is already taken");
        };

        // Create an selection
        const selection = await this.createGroupSelection(user, data.name);

        // Create group and add selection
        const group = await this.groupRepository.createQueryBuilder()
            .insert().values({name: data.name, selection, admin: user}).execute();

        const guid = group.identifiers[0].guid;

        const newGroup = await this.groupRepository.findOne({where:{guid: guid}});
        return ({
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

    async getGroupSelectionGuid(groupGuid: string) : Promise<string>{
        const group =  await this.groupRepository.findOne({where:{guid:groupGuid}, relations: {selection: true}});
        if(!group) throw new NotFoundException("Group not found");

        return (group.selection.guid);
    }

    async deleteGroup(params: DeleteGroupQuery) : Promise<boolean>{
        if(!params.guid && !params.name)
            throw new BadRequestException("Neither guid or name not provided");
        const group = params.guid ? await this.getGroupByGuid(params.guid) : await this.getGroupByName(params.name);
        if(!group) throw new NotFoundException("Group not found");

        await this.groupRepository.createQueryBuilder().delete().where(group).execute();
        return true;
    }

    async getGroupSelection(guid: string) : Promise<GetVariantsInPlaylistResult>{
        if(!guid)
            throw new BadRequestException("Group guid not provided");

        const selectionGuid = await this.getGroupSelectionGuid(guid);

        return await this.playlistService.getVariantsInPlaylist(selectionGuid)
    }

    async getGroupInfo(params: GetGroupInfoQuery) : Promise<GetGroupInfoResult>{
        if(!params.guid && !params.name)
            throw new BadRequestException("Neither guid or name not provided");

        const group = (params.guid) ? (await this.getGroupByGuid(params.guid)) : (await this.getGroupByName(params.name));

        if(!group) throw new NotFoundException("Group not found");

        return ({
            name: group.name,
            guid: group.guid,
            selection: group.selection.guid
        });
    }

}
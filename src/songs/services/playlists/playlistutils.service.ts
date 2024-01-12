import { Playlist } from 'src/database/entities/playlist.entity';
import { PLAYLIST_ITEMS_REPOSITORY, PLAYLIST_REPOSITORY, SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY } from '../../../database/constants';
import { In, MoreThan, Repository } from 'typeorm';
import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/database/entities/user.entity';
import { formatted, codes } from '../../../utils/formatted';
import { SongVariant } from '../../../database/entities/songvariant.entity';
import { PlaylistItem } from 'src/database/entities/playlistitem.entity';
import { RequestResult } from 'src/utils/request.dto';

@Injectable()
export class PlaylistUtilsService{

    constructor(
        @Inject(PLAYLIST_REPOSITORY)
        private playlistRepository: Repository<Playlist>,

        @Inject(SONG_VARIANTS_REPOSITORY)
        private variantRepository: Repository<SongVariant>,


        @Inject(PLAYLIST_ITEMS_REPOSITORY)
        private itemRepository: Repository<PlaylistItem>,

    ){}  


    async addVariantToPlaylist(variantGuid: string, playlistGuid: string, user: User) : Promise<boolean> {

        const playlist = await this.playlistRepository.findOne({
            where:{
                guid: playlistGuid
            },
            relations:{
                owner:true
            }
        });
        if(!playlist) throw new NotFoundException("Playlist not found");
        if(!playlist.owner)
            throw new ForbiddenException("Playlist has no owner");
        if(playlist.owner.guid!==user.guid) 
            throw new UnauthorizedException("You are not the owner of this playlist");

        const variant = await this.variantRepository.findOne({
            where:{
                guid: variantGuid
            }
        });


        if(!variant) throw new NotFoundException("Variant not found");
        const existingItem = await this.itemRepository.findOne({
            where:{
                playlist, variant
            }
        })

        if(existingItem)
            throw new ConflictException("Variant already exists in playlist");

        const items = await this.itemRepository.find({
            where:{
                playlist
            }
        })
        const item = await this.itemRepository.create({
            playlist, variant,
            order: items.length
        });

        await this.itemRepository.save(item);


        return true
    }

    async removeVariantFromPlaylist(variantGuid:string, playlistGuid:string, user:User, ignoreUser: boolean = false) : Promise<boolean> {
        if(!variantGuid || !playlistGuid) 
            throw new BadRequestException("Variant or playlist not specified");

        const playlist = await this.playlistRepository.findOne({
            where:{
                guid: playlistGuid
            },
            relations:{
                owner:true
            }
        });

        if(!playlist) throw new NotFoundException("Playlist not found");
        if(!ignoreUser && playlist.owner.guid!==user.guid)
            throw new UnauthorizedException("You are not authorized to remove this variant from the playlist");

        const variant = await this.variantRepository.findOne({
            where:{
                guid: variantGuid
            }
        });

        
        if(!variant) throw new NotFoundException("Variant not found");
        const item = await this.itemRepository.findOne({
            where:{
                playlist, variant
            }
        })

        if(!item) throw new NotFoundException("Variant not found in playlist");

        // Move all items after this one one position down
        const itemsAfter = await this.itemRepository.find({
            where:{
                playlist,
                order: MoreThan(item.order)
            }
        })

        await Promise.all(itemsAfter.map(async (item)=>{
            item.order--;
            await this.itemRepository.save(item);
        }))


        await this.itemRepository.remove(item);

        return true
    }
}

import { Playlist } from 'src/database/entities/playlist.entity';
import { PLAYLIST_ITEMS_REPOSITORY, PLAYLIST_REPOSITORY, SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY } from '../../../database/constants';
import { In, MoreThan, Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { GetPlaylistsResult, GetSearchInPlaylistResult, GetVariantsInPlaylistResult, PostCreatePlaylistBody, PostCreatePlaylistResult, PostDeletePlaylistResult } from './dtos';
import { User } from 'src/database/entities/user.entity';
import { formatted, codes, RequestResult } from '../../../utils/formatted';
import { Song } from 'src/database/entities/song.entity';
import { SongVariant } from '../../../database/entities/songvariant.entity';
import normalizeSearchText from 'src/utils/normalizeSearchText';
import { SearchSongData } from 'src/songs/dtos';
import { SongService } from '../song.service';
import { PlaylistItem } from 'src/database/entities/playlistitem.entity';
import { PlaylistItemDTO, ReorderPlaylistItemDTO } from 'src/dtos/PlaylistItemDTO';
import { Chord, note } from '@pepavlin/sheet-api';

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


    async addVariantToPlaylist(variantGuid: string, playlistGuid: string, user: User) : Promise<RequestResult<any>> {

        const playlist = await this.playlistRepository.findOne({
            where:{
                guid: playlistGuid
            },
            relations:{
                owner:true
            }
        });
        if(!playlist) return formatted(undefined, codes['Not Found'], "Playlist not found");
        if(!playlist.owner) return formatted(undefined, codes.Unauthorized, "Playlist has no owner");
        if(playlist.owner.guid!==user.guid) return formatted(null, codes.Unauthorized);

        const variant = await this.variantRepository.findOne({
            where:{
                guid: variantGuid
            }
        });


        if(!variant) return formatted(undefined, codes['Not Found'], "Variant not found");

        const existingItem = await this.itemRepository.findOne({
            where:{
                playlist, variant
            }
        })

        if(existingItem)
            return formatted(undefined, codes['Already Added'], "Variant already exists in playlist");

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


        return formatted(undefined, codes.Success);
    }

    async removeVariantFromPlaylist(variantGuid:string, playlistGuid:string, user:User, ignoreUser: boolean = false) : Promise<RequestResult<any>> {
        if(!variantGuid || !playlistGuid) return formatted(undefined, codes['Bad Request'], "Missing parameters");

        const playlist = await this.playlistRepository.findOne({
            where:{
                guid: playlistGuid
            },
            relations:{
                owner:true
            }
        });

        if(!playlist) return formatted(undefined, codes['Not Found'], "Playlist not found");
        if(!ignoreUser && playlist.owner.guid!==user.guid) return formatted(null, codes.Unauthorized);

        const variant = await this.variantRepository.findOne({
            where:{
                guid: variantGuid
            }
        });

        
        if(!variant) return formatted(null, codes['Not Found'], "Variant not found");
        const item = await this.itemRepository.findOne({
            where:{
                playlist, variant
            }
        })

        if(!item) return formatted(null, codes['Not Found'], "Variant not found in playlist");

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

        return formatted(null, codes.Success);
    }
}

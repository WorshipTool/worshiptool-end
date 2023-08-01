import { Playlist } from 'src/database/entities/playlist.entity';
import { PLAYLIST_ITEMS_REPOSITORY, PLAYLIST_REPOSITORY, SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY } from '../../../database/constants';
import { In, Repository } from 'typeorm';
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
import { PlaylistItemDTO } from 'src/dtos/PlaylistItemDTO';

@Injectable()
export class PlaylistService{

    constructor(
        @Inject(PLAYLIST_REPOSITORY)
        private playlistRepository: Repository<Playlist>,

        @Inject(SONG_VARIANTS_REPOSITORY)
        private variantRepository: Repository<SongVariant>,


        @Inject(PLAYLIST_ITEMS_REPOSITORY)
        private itemRepository: Repository<PlaylistItem>,

        private songService: SongService
    ){}  

    async getPlaylistByUser(user: User) : Promise<GetPlaylistsResult>{
        const playlists = await this.playlistRepository.find({
            where:{
                owner: user,
                isSelection: false
            }
        })
        return {
            playlists: playlists.map((p)=>{
                return {
                    guid: p.guid,
                    title: p.title

                }
            })
        }
    }

    async createPlaylist(body: PostCreatePlaylistBody, user: User) : Promise<PostCreatePlaylistResult>{
        const playlistData : Partial<Playlist> = {
            title: body.title,
            owner: user
        }
        const playlistGuid = await (await this.playlistRepository.insert(playlistData)).identifiers[0].guid;

        return {
            guid: playlistGuid
        }
    }

    async deletePlaylist(guid:string, user:User) : Promise<RequestResult<PostDeletePlaylistResult>>{
        const playlist = await this.playlistRepository.findOne({where:{
                guid
            },
            relations:{
                owner:true
            }
        });
        if(!playlist) return formatted(undefined, codes['Not Found']);
        if(playlist.owner.guid != user.guid) return formatted(undefined, codes.Unauthorized);

        await this.playlistRepository.remove(playlist);
        return formatted(undefined)
    }

    async getVariantsInPlaylist(guid : string) : Promise<RequestResult<GetVariantsInPlaylistResult>>{
        if(guid===undefined) 
            return formatted(undefined, codes['Bad Request'], "Playlist's guid is undefined");

        const playlist = await this.playlistRepository.findOne({
            where:{
                guid
            }
        })

        if(!playlist) return formatted(undefined, codes['Not Found'], "Playlist not found");

        const results = await this.itemRepository.find({
            where:{
                playlist
            },
            relations:{
                variant:true
            },
            order:{
                order: 'ASC'
            }
        })

        const items : PlaylistItemDTO[] = await Promise.all(results.map(async (item)=>{
            return {
                guid: item.guid,
                order: item.order,
                toneKey: item.toneKey,
                variant: await this.songService.getVariantByGuid(item.variant.guid)
            }
        }));

        return formatted({
            items,
            title: playlist.title
        }, codes.Success)
    }

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

    async removeVariantFromPlaylist(variantGuid:string, playlistGuid:string, user:User) : Promise<RequestResult<any>> {
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
        if(playlist.owner.guid!==user.guid) return formatted(null, codes.Unauthorized);

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

        await this.itemRepository.remove(item);

        return formatted(null, codes.Success);
    }

    async isVariantInPlaylist(variant:string, playlist:string) : Promise<RequestResult<boolean>>{
        const existingItem = await this.itemRepository.findOne({
            where:{
                variant: {
                    guid: variant
                },
                playlist: {
                    guid: playlist
                }
            }
        });
       
        return formatted(existingItem !== null,);
    }

    async searchInPlaylist(guid: string, searchKey: string, page: number, user: User) : Promise<RequestResult<GetSearchInPlaylistResult[]>>{
        if(!guid) return formatted(undefined, codes['Bad Request'], "Guid is undefined");

        if(searchKey===undefined)searchKey="";
        if(page===undefined)page=0;
        
       const variants =  await this.songService.search({
            searchKey,
            page,
            playlist: guid
       }, user);

       const variantGuids = variants.map((v)=>v.variant.guid);

       const results = await this.itemRepository.find({
              where:{
                    variant: {
                        guid: In(variantGuids)
                    }
                },
                relations:{
                    variant:true
                }
            });


        const items : PlaylistItemDTO[] = await Promise.all(results.map(async (item)=>{
            return {
                guid: item.guid,
                order: item.order,
                toneKey: item.toneKey,
                variant: await this.songService.getVariantByGuid(item.variant.guid)
            }
        }));


       return formatted({
            guid,
            items
        });
    }

    async renamePlaylist(guid: string, title: string, user: User) : Promise<RequestResult<any>>{
        if(!guid) return formatted(undefined, codes['Bad Request'], "Guid is undefined");

        const playlist = await this.playlistRepository.findOne({
            where:{
                guid
            },
            relations:{
                owner:true
            }
        });
        if(!playlist) return formatted(undefined, codes['Not Found'], "Playlist not found");
        if(playlist.owner.guid!==user.guid) return formatted(null, codes.Unauthorized);

        playlist.title = title;
        await this.playlistRepository.save(playlist);
        return formatted(undefined, codes.Success);
    }
}
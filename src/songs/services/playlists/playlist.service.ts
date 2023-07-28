import { Playlist } from 'src/database/entities/playlist.entity';
import { PLAYLIST_REPOSITORY, SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY } from '../../../database/constants';
import { In, Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { GetPlaylistsResult, GetVariantsInPlaylistResult, PostCreatePlaylistBody, PostCreatePlaylistResult, PostDeletePlaylistResult } from './dtos';
import { User } from 'src/database/entities/user.entity';
import { formatted, codes, RequestResult } from '../../../utils/formatted';
import { Song } from 'src/database/entities/song.entity';
import { SongVariant } from '../../../database/entities/songvariant.entity';
import normalizeSearchText from 'src/utils/normalizeSearchText';
import { SearchSongData } from 'src/songs/dtos';
import { SongService } from '../song.service';

@Injectable()
export class PlaylistService{

    constructor(
        @Inject(PLAYLIST_REPOSITORY)
        private playlistRepository: Repository<Playlist>,

        @Inject(SONG_VARIANTS_REPOSITORY)
        private variantRepository: Repository<SongVariant>,

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
            songs: [],
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
            },
            relations:{
                songs:{
                    song:true
                }
            }
        })

        if(!playlist) return formatted(undefined, codes['Not Found'], "Playlist not found");

        const variants = [];
        for(const song of playlist.songs){
            const dto = await this.songService.getVariantByGuid(song.guid);
            variants.push(dto);
        }

        return formatted({
            variants,
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
            },
            relations: {
                playlists:true
            }
        });


        if(!variant) return formatted(undefined, codes['Not Found'], "Variant not found");

        if(variant.playlists.filter((p)=>p.guid==playlist.guid).length>0)
            return formatted(undefined, codes['Already Added'], "Variant already exists in playlist");
        variant.playlists.push(playlist);
        this.variantRepository.save(variant);

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
            },
            relations: {
                playlists:true
            }
        });


        if(!variant) return formatted(null, codes['Not Found'], "Variant not found");

        if(variant.playlists.filter((p)=>p.guid==playlist.guid).length==0)
            return formatted(null, codes['Not Found'], "Variant not found in playlist");

        variant.playlists = variant.playlists.filter((p)=>p.guid!=playlist.guid);
        this.variantRepository.save(variant);

        return formatted(null, codes.Success);
    }

    async isVariantInPlaylist(variant:string, playlist:string) : Promise<RequestResult<boolean>>{
        const v = await this.variantRepository.findOne({
            where:{
                guid:variant
            },
            relations:{
                playlists:true
            }
        });
        if(!v) return formatted(false, codes['Not Found'])
        const ps = v.playlists.filter((p)=>{
            return p.guid==playlist
        });
        if(ps.length>0) return formatted(true);
        return formatted(false);
    }

    async searchInPlaylist(guid: string, searchKey: string, page: number, user: User) : Promise<RequestResult<SearchSongData[]>>{
        if(!guid) return formatted(undefined, codes['Bad Request'], "Guid is undefined");

        if(searchKey===undefined)searchKey="";
        if(page===undefined)page=0;
        
       const variants =  await this.songService.search({
            searchKey,
            page,
            playlist: guid
       }, user);

       return formatted(variants);
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
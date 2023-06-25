import { Playlist } from 'src/database/entities/playlist.entity';
import { PLAYLIST_REPOSITORY, SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY } from '../../../database/constants';
import { In, Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { GetPlaylistsResult, GetSongsInPlaylistResult, PostCreatePlaylistBody, PostCreatePlaylistResult, PostDeletePlaylistResult } from './dtos';
import { User } from 'src/database/entities/user.entity';
import { formatted, codes, RequestResult } from '../../../utils/formatted';
import { Song } from 'src/database/entities/song.entity';
import { SongVariant } from '../../../database/entities/songvariant.entity';

@Injectable()
export class PlaylistService{

    constructor(
        @Inject(PLAYLIST_REPOSITORY)
        private playlistRepository: Repository<Playlist>,

        @Inject(SONG_VARIANTS_REPOSITORY)
        private variantRepository: Repository<SongVariant>
    ){}  

    async getPlaylistByUser(user: User) : Promise<GetPlaylistsResult>{
        const playlists = await this.playlistRepository.find({
            where:{
                owner: user
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
        if(!playlist) return formatted(null, codes['Not Found']);
        if(playlist.owner.guid != user.guid) return formatted(null, codes.Unauthorized);

        await this.playlistRepository.remove(playlist);
        return formatted(true)
    }

    async getSongsInPlaylist(guid : string) : Promise<RequestResult<GetSongsInPlaylistResult>>{

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
        // variantRepository
        //     .createQueryBuilder('variant')
        //     .leftJoin('variant.playlists', 'playlist')
        //     .innerJoinAndSelect("variant.song", "song")
        //     .where('playlist.guid = :guid', {guid})
        //     .getMany();

        return formatted({
            guids: playlist.songs.map(v=>v.song.guid),
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

        if(playlist.owner.guid!==user.guid) return formatted(null, codes.Unauthorized);

        const variant = await this.variantRepository.findOne({
            where:{
                guid: variantGuid
            },
            relations: {
                playlists:true
            }
        });


        if(!variant || !playlist) return formatted(null, codes['Not Found']);

        variant.playlists.push(playlist);
        this.variantRepository.save(variant);

        return formatted(null, codes.Success);
    }

    async removeVariantFromPlaylist(variantGuid:string, playlistGuid:string, user:User) : Promise<RequestResult<any>> {
        const playlist = await this.playlistRepository.findOne({
            where:{
                guid: playlistGuid
            },
            relations:{
                owner:true
            }
        });

        if(playlist.owner.guid!==user.guid) return formatted(null, codes.Unauthorized);

        const variant = await this.variantRepository.findOne({
            where:{
                guid: variantGuid
            },
            relations: {
                playlists:true
            }
        });


        if(!variant || !playlist) return formatted(null, codes['Not Found']);

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
}
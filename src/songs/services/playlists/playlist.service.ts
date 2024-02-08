
import { Playlist } from 'src/database/entities/playlist.entity';
import { PLAYLIST_ITEMS_REPOSITORY, PLAYLIST_REPOSITORY, SONG_REPOSITORY, SONG_VARIANTS_REPOSITORY } from '../../../database/constants';
import { In, MoreThan, Repository } from 'typeorm';
import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { GetPlaylistsResult, GetSearchInPlaylistResult, GetVariantsInPlaylistResult, PostCreatePlaylistBody, PostCreatePlaylistResult, PostDeletePlaylistResult } from './playlist.dto';
import { User } from 'src/database/entities/user.entity';
import { SongVariant } from '../../../database/entities/songvariant.entity';
import { SongService } from '../song.service';
import { PlaylistItem } from 'src/database/entities/playlistitem.entity';
import { PlaylistItemDTO, ReorderPlaylistItemDTO } from 'src/dtos/playlistitem.dto';
import { Chord, note } from '@pepavlin/sheet-api';

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
                owner: {guid: user.guid},
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

    async deletePlaylist(guid:string, user:User) : Promise<PostDeletePlaylistResult>{
        const playlist = await this.playlistRepository.findOne({where:{
                guid
            },
            relations:{
                owner:true
            }
        });
        if(!playlist) throw new NotFoundException("Playlist not found");
        if(playlist.owner.guid != user.guid) 
            throw new UnauthorizedException("You are not the owner of this playlist");

        await this.playlistRepository.remove(playlist);
        return true
    }

    async getVariantsInPlaylist(guid : string) : Promise<GetVariantsInPlaylistResult>{
        const playlist = await this.playlistRepository.findOne({
            where:{
                guid
            }
        })

        if(!playlist) throw new NotFoundException("Playlist not found");

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

        const result : GetVariantsInPlaylistResult = {
            title: playlist.title,
            items
        }
        return result;
    }

    async isVariantInPlaylist(variant:string, playlist:string) : Promise<boolean>{
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
       
        return existingItem !== null;
    }

    async searchInPlaylist(guid: string, searchKey: string, page: number, user: User) : Promise<GetSearchInPlaylistResult>{
        if(!guid) throw new BadRequestException("Guid is undefined");

        if(searchKey===undefined)searchKey="";
        if(page===undefined)page=0;
        
       const variants =  await this.songService.search({
            searchKey,
            page,
            playlist: guid,
       }, user);

       const variantGuids = variants.map((v)=>v.variant.guid);

       const results = await this.itemRepository.find({
              where:{
                    variant: {
                        guid: In(variantGuids)
                    },
                    playlist: {
                        guid
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

        const result : GetSearchInPlaylistResult = {
            guid,
            items
        }

        return result
    }

    async renamePlaylist(guid: string, title: string, user: User) : Promise<boolean>{
        if(!guid) throw new BadRequestException("Guid is undefined");
        if(!title) throw new BadRequestException("Title is undefined");

        const playlist = await this.playlistRepository.findOne({
            where:{
                guid
            },
            relations:{
                owner:true
            }
        });
        if(!playlist) throw new NotFoundException("Playlist not found");
        if(playlist.owner.guid!==user.guid)
            throw new UnauthorizedException("You are not the owner of this playlist");

        playlist.title = title;
        await this.playlistRepository.save(playlist);
        return true
    }

    async reorderPlaylist(guid: string, items: ReorderPlaylistItemDTO[], user: User) : Promise<boolean>{
        if(!guid) throw new BadRequestException("Guid is undefined");
        if(items.length==0) 
            throw new BadRequestException("No items to reorder");

        // check if all items order number is unique
        const orderNumbers = items.map((i)=>i.order);
        if(orderNumbers.length !== new Set(orderNumbers).size) 
            throw new BadRequestException("Item's order are not unique");

        const playlist = await this.playlistRepository.findOne({
            where:{
                guid
            },
            relations:{
                owner:true
            }
        });

        if(!playlist) throw new NotFoundException("Playlist not found");
        if(playlist.owner.guid!==user.guid)
            throw new UnauthorizedException("You are not the owner of this playlist");

        
        const existingItems = await this.itemRepository.find({
            where:{
                playlist
            }
        });

        const existingItemGuids = existingItems.map((i)=>i.guid);

        const itemsToSave = items.filter((i)=> existingItemGuids.includes(i.guid) && i.order);

        let outCount = 0;
        let savedCount = 0;

        await Promise.all(itemsToSave.map(async (item)=>{
            const existingItem = existingItems.find((i)=>i.guid===item.guid);

            // if items order is out of bounds, ignore it
            if(item.order<0 || item.order>=existingItems.length){
                outCount++;
                return;
            };


            if(existingItem){

                const itemWithThatOrder = existingItems.find((i)=>i.order===item.order);
                if(itemWithThatOrder){
                    itemWithThatOrder.order = existingItem.order;
                    await this.itemRepository.save(itemWithThatOrder);
                }

                existingItem.order = item.order;
                await this.itemRepository.save(existingItem);
                savedCount++;
            }
        }));



        if(savedCount==0){
            if(outCount>0)
                throw new BadRequestException("No items changed, because all items were out of bounds");
            throw new BadRequestException("No items changed");     
        };

        // if(outCount>0) 
        //     return formatted(undefined, codes['Success'], "Reordered, but some items ignored as out of bounds");

        return true
    }

    async transposePlaylistItem(guid: string, keyChord: string, user: User) : Promise<boolean>{
        if(!guid) throw new BadRequestException("Guid is undefined");
        if(!keyChord) throw new BadRequestException("Key chord is undefined");
        
        const chord = new Chord(keyChord);

        const existingItem = await this.itemRepository.findOne({
            where:{
                guid
            },
            relations:{
                playlist:{
                    owner:true
                }
            }
        });

        if(!existingItem) throw new NotFoundException("Item not found");
        if(existingItem.playlist.owner.guid!==user.guid) 
            throw new UnauthorizedException("You are not the owner of this playlist");

        existingItem.toneKey = chord.data.rootNote.toString();
        await this.itemRepository.save(existingItem);

        return true
    }
}
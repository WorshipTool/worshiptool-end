import { NotFoundException, UnauthorizedException, BadRequestException, ConflictException, Inject, Injectable } from "@nestjs/common";
import { ROLES, User } from "../../database/entities/user.entity";
import { SONG_VARIANTS_REPOSITORY } from "../../database/constants";
import { Repository } from "typeorm";
import { SongVariant } from "../../database/entities/songvariant.entity";
import { PlaylistUtilsService } from "../modules/playlists/playlistutils.service";

@Injectable()
export class SongDeletingService{
    constructor(
        @Inject(SONG_VARIANTS_REPOSITORY)
        private variantRepository: Repository<SongVariant>,
        private playlistUtils: PlaylistUtilsService

    ){}

    
    async deleteVariant(guid:string, user: User) : Promise<boolean>{
        const variant = (await this.variantRepository.findOne({
            where:{
                guid
            },
            relations:{
                createdBy:true,
                playlistItems:{
                    playlist:true
                }
            }
        }))


        if(!variant)
            throw new NotFoundException("Variant not found");

        if(variant.createdBy.guid!=user.guid && user.role!==ROLES.Admin)
            throw new UnauthorizedException("User doesn't have permission to delete this variant");

        if(variant.verified)
            throw new BadRequestException("Cannot delete verified variant");

        if(variant.deleted)
            throw new ConflictException("Variant has been already deleted");

        // remove from playlists
        await Promise.all(variant.playlistItems.map(async (item)=>{
            this.playlistUtils.removeVariantFromPlaylist(variant.guid, item.playlist.guid, user, true);
        }))

        variant.deleted=true;
        await this.variantRepository.save(variant);

        return true
    }

    
    async restoreVariant(guid:string){
        const variant = (await this.variantRepository.findOneBy({
            guid
        }))
    
        if(!variant) throw new NotFoundException("Variant not found");
    
        if(!variant.deleted)
            throw new ConflictException("Variant has not been deleted");
    
        variant.deleted=false;
        await this.variantRepository.save(variant);

        return true
    }
}
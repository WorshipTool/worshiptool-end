import { Injectable, NotFoundException } from "@nestjs/common";
import { GetSongDataOutDto } from "./song.getting.dto";
import { SongVariantService } from "../modules/variants/song.variant.service";
import { User } from "../../database/entities/user.entity";
import { MediaService } from "../modules/media/media.service";
import { SongVariantDto } from "../../dtos/songvariant.dto";
import { SongDataVariant } from "../songs.dto";

@Injectable()
export class SongGettingService {
    constructor(
        private variantService: SongVariantService,
        private mediaService: MediaService
    ) {}

    async getSongDataByVariantGuid(
        guid: string,
        user?: User
    ): Promise<GetSongDataOutDto> {
        const variant = await this.variantService.getVariantByGuid(guid, user, {
            song: {
                mainTitle: true,
                tags: true
            }
        });

        if (!variant) throw new NotFoundException("Variant not found");

        const songGuid = variant.song.guid;

        const variantObjects = await this.variantService.getVariantsBySongGuid(
            songGuid,
            user,
            {
                prefferedTitle: true,
                titles: true,
                createdBy: true
            }
        );
        const variantsData: SongVariantDto[] = await Promise.all(
            variantObjects.map(async (v) => {
                const d = await this.variantService.mapSongVariantToVariantData(
                    v
                );
                return {
                    ...d,
                    songGuid: songGuid,
                    createdByGuid: v.createdBy.guid
                };
            })
        );

        const media = await this.mediaService.getBySongGuid(songGuid);

        return {
            guid: songGuid,
            mainTitle: variant.song.mainTitle.title,
            creators: [],
            variants: variantsData,
            media: media,
            tags: variant.song.tags.map((t) => t.value)
        };
    }
}

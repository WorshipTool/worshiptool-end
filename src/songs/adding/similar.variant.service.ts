import { Inject, Injectable } from "@nestjs/common";
import { Sheet } from "@pepavlin/sheet-api";
import { calculateSimilarity } from "../../tech/string.tech";
import { Section } from "@pepavlin/sheet-api/lib/models/song/section";
import { VariantRelationInDto } from "./song.adding.dto";
import { SONG_VARIANTS_REPOSITORY } from "../../database/constants";
import { Repository } from "typeorm";
import { SongVariant } from "../../database/entities/songvariant.entity";
import { SongAddingTechService, VariantRelationOutDto } from "./song.adding.tech.service";

@Injectable()
export class SimilarVariantService{
    constructor(
        @Inject(SONG_VARIANTS_REPOSITORY)
        private variantRepository: Repository<SongVariant>,
        private techService: SongAddingTechService
    ){}

    private async getVariantsToCompare(){
        return await this.variantRepository.find({
            relations: {
                prefferedTitle: true,
                song: true,
            }
        });
    }

    async findMostSimilarVariant(variant: VariantRelationInDto, print: boolean = false){
        let variants = await this.getVariantsToCompare();

        // Filter out invalid data, too short, etc.
        variants = variants.filter(v => this.techService.isSheetDataValid(v.sheetData));
        // Sort variants by title
        variants = variants.sort((a,b) => a.prefferedTitle.title.localeCompare(b.prefferedTitle.title));

        let bestSimilarity = 0;
        let bestVariant : SongVariant = null;
        let foundSameSong = false;
        let bestRelation : VariantRelationOutDto = null;

        let i=0;
        for(const v of variants){

            if(print){
                const perc = Math.round((i+1)/variants.length*100);
                console.log("---",i+1,"of",variants.length,"---", perc,"%")
                console.log("Comparing to variant: ", v.prefferedTitle.title)
            }

            const data : VariantRelationInDto = {
                title: v.prefferedTitle.title,
                sheetData: v.sheetData,
            }


            const relation = this.techService.getVariantRelation(variant, data);
            const similarity = relation.similarity;
            if(relation.isSameSong && !foundSameSong){
                foundSameSong = true;
                bestSimilarity = similarity;
                bestVariant = v;
                bestRelation = relation;
            }else if(similarity > bestSimilarity && foundSameSong == relation.isSameSong){
                bestSimilarity = similarity;
                bestVariant = v;
                bestRelation = relation;
            }

            if(print) console.log("Compared with similarity: ", similarity, "Same song:", relation.isSameSong);
            i++;
        }
        if(print){
            console.log();
            console.log("Best similarity: ", bestSimilarity);
            console.log("Best variant: ", bestVariant.prefferedTitle.title);
            console.log(bestVariant.sheetData);
        }

        return {
            relation: bestRelation,
            variant: bestVariant
        };



    }

}
import { Injectable } from "@nestjs/common";
import { SimilarVariantService } from "../similar.variant.service";
import { SongAddingService } from "../song.adding.service";
import { ROLES, User } from "../../../database/entities/user.entity";
import { AuthService } from "../../../auth/auth.service";
import { SourceTypes } from "../../../database/entities/source.entity";
import { CreatedType } from "../../../database/entities/songvariant.entity";
import { url } from "inspector";
import { SongEditingService } from "../../editing/song.editing.service";

export type ProgramSongData = {
    confidence: number, // 0 - 1,
    title: string,
    sheetData: string,
    url: string,
    createdType: CreatedType
}

@Injectable()
export class ProgramSongAddingService{
    constructor(
        private similarService: SimilarVariantService,
        private addingService: SongAddingService,
        private editingService: SongEditingService,
        private authService: AuthService
    ){}

    async getProgramUser() : Promise<User>{
        const email = process.env.PROGRAM_USER_EMAIL;
        const password = process.env.PROGRAM_USER_PASSWORD;

        if(!email || !password){
            console.error("Program user credentials not found")
            return null;
        }

        const data = await this.authService.login({
            email: email,
            password: password
        })

        if(!data.user){
            console.error("Failed to login program user")
            return null;
        }

        if(data.user.role !== ROLES.Loader){
            console.error("Program user is not loader")
            return null;
        }


        return data.user as User;
    }
    
    // All data automatically loaded by program on server flow to this stream function
    async processDataStream(data: ProgramSongData) : Promise<boolean>{
        console.log("- - - Processed data from source: ", data.url, "|", data.title) 

        try{
            const existing = await this.similarService.findVariantWithSameSourceUrl({
                sheetData: data.sheetData,
                title: data.title,
                url: data.url
            })
    
            const user = await this.getProgramUser();
            if(!user){
                console.error("Failed to get program user")
                return;
            }
    
            if(!existing){
                // Variant doesnt exist
                // Create variant
    
                const variant = await this.addingService.createVariant({
                    title: data.title,
                    sheetData: data.sheetData,
                    source: {
                        type: SourceTypes.Url,
                        value: data.url
                    },
                    createdType: data.createdType
                }, user)
    
                if(!variant) console.error("Failed to create variant")
                else console.log("Created new variant: ", variant.guid, data.title)
                
                //Try to find similar song and join variant to it
                let {
                    relation,
                    variant: similarVariant
                } = await this.similarService.findMostSimilarVariant({
                    title: data.title,
                    sheetData: data.sheetData
                },false);
    
                if(relation.isSameSong && !relation.isSameVariant){
                    // Join variant to song
                    if(variant) 
                        this.addingService.joinVariantToSong(variant, similarVariant.song);
                    
                }
            }else{
                // Variant exists
                // Update variant
                // Check if there is a need to update variant
                if(existing.relation.similarity < 1){
                    const edited = await this.editingService.editVariant(existing.variant, {
                        sheetData: data.sheetData,
                        title: data.title,
                        createdType: data.createdType
                    }, user)
                    console.log("Updated variant: ", 
                        existing.variant.guid, edited.prefferedTitle.title)
                }
            }
        }catch(e){
            console.error(e);
            return false;
        }

        return true;


    }
}
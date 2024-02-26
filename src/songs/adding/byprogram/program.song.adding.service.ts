import { Injectable } from "@nestjs/common";

export type ProgramSongData = {
    confidence: number, // 0 - 1,
    title: string,
    sheetData: string,
    url: string
}

@Injectable()
export class ProgramSongAddingService{
    constructor(){}

    
    // All data automatically loaded by program on server
    processDataStream(data: ProgramSongData){
        console.log("- - - Processed data from source: ", data.url)
        // console.log("Data", data)

        // TODO: Implement processing
    }
}
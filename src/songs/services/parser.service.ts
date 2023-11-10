import { Inject, Injectable } from "@nestjs/common";
import { CREATOR_REPOSITORY, CSVLINK_REPOSITORY } from "src/database/constants";
import { Creator } from "src/database/entities/creator.entity";
import { CSVLink } from "src/database/entities/csvlink.entity";
import { In, Repository } from "typeorm";
import { SongDataCreator } from "../dtos";
import { Song } from "src/database/entities/song.entity";
import { SongVariant } from "src/database/entities/songvariant.entity";
import { codes, formatted } from "src/utils/formatted";
import { spawnSync } from "child_process";
import {v4} from "uuid";
import * as fs from 'fs'

interface ParsedSheet{
    "title": string,
    "data": string,
    "inputImagePath": string
}

@Injectable()
export class ParserService{

    constructor(
    ){}  

    async parse(inputImagePath: string){
        const PARSER_SCRIPT_PATH = 'src/pythonscripts/image-parser/main.py'

        const TEMP_IMAGES_FOLDER_PATH = 'public/temp/images'
        const DETECTION_MODEL_PATH = 'src/pythonscripts/parser/240frames.pt'
        const OUTPUT_RESULT_PATH = `public/temp/${v4()}.json`
        

        const pythonProcess = await spawnSync('python3', [
            PARSER_SCRIPT_PATH,
            "-i", inputImagePath,
            "-o", OUTPUT_RESULT_PATH,
            "-m", DETECTION_MODEL_PATH,
            "-t", TEMP_IMAGES_FOLDER_PATH
          ]);
        const result = pythonProcess.stdout?.toString()?.trim();
        const error = pythonProcess.stderr?.toString()?.trim();


        // Read output json file and delete it
        const outputData = fs.readFileSync(OUTPUT_RESULT_PATH, 'utf8');
        fs.unlinkSync(OUTPUT_RESULT_PATH);
        const sheets : ParsedSheet[] = JSON.parse(outputData);
        
        const formattedSheets = sheets.map(sheet => {
            const title = sheet.title
            const data = sheet.data;

            return {
                title,
                data
            }

        });



        return formatted(
            {
                sheets: formattedSheets
            }
        );
    }
}
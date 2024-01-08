import { Injectable } from "@nestjs/common";
import { formatted } from "src/utils/formatted";
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

        const TEMP_IMAGES_FOLDER_PATH = 'public/temp'
        const OUTPUT_RESULT_PATH = `public/temp/${v4()}.json`
        
        // Create public folder if it doesn't exist
        if (!fs.existsSync('public')){
            fs.mkdirSync('public');
        }

        if (!fs.existsSync(TEMP_IMAGES_FOLDER_PATH)){
            fs.mkdirSync(TEMP_IMAGES_FOLDER_PATH);
        }

        const pythonProcess = await spawnSync('python3', [
            PARSER_SCRIPT_PATH,
            "-i", inputImagePath,
            "-o", OUTPUT_RESULT_PATH,
          ]);
        const result = pythonProcess.stdout?.toString()?.trim();
        const error = pythonProcess.stderr?.toString()?.trim();

        console.log(pythonProcess)
        console.log(result);
        console.log(error);

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



        return {
            sheets: formattedSheets
        };
    }
}
import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { spawnSync } from "child_process";
import {v4} from "uuid";
import * as fs from 'fs'
import { getFileFormat, isFilePathValid } from "../../../tech/file.tech";
import * as pdf2img from 'pdf-img-convert';

interface ParsedSheet{
    "title": string,
    "data": string,
    "inputImagePath": string
}

const SUPPORTED_FORMATS = [
    "jpg",
    "jpeg",
    "png",
    "pdf"
]

@Injectable()
export class ParserService{

    constructor(
    ){}  

    async parse(inputImagePath: string, print: boolean = false){
        const PARSER_SCRIPT_PATH = 'src/pythonscripts/image-parser/main.py'

        if(!fs.existsSync(PARSER_SCRIPT_PATH)){
            throw new ServiceUnavailableException("Parser is not available");
        }

        const TEMP_IMAGES_FOLDER_PATH = 'public/temp'
        const OUTPUT_RESULT_PATH = `${TEMP_IMAGES_FOLDER_PATH}/${v4()}.json`
        
        // Create public folder if it doesn't exist
        if (!fs.existsSync('public')){
            fs.mkdirSync('public');
        }

        if (!fs.existsSync(TEMP_IMAGES_FOLDER_PATH)){
            fs.mkdirSync(TEMP_IMAGES_FOLDER_PATH);
        }

        const preprocessed : string[] = [];       
        try{
            const images = await this.preprocessFile(inputImagePath, TEMP_IMAGES_FOLDER_PATH);
            preprocessed.push(...images);
        }catch(e){
            // Unsupported file format
            throw new Error(e);
        }

        console.log("Preprocessed: ", preprocessed)
        console.log("Input: ", inputImagePath);

        if(preprocessed.length === 0){
            throw new Error("No valid images found");
        }

        const pythonProcess = await spawnSync('python3', [
            PARSER_SCRIPT_PATH,
            "-i", ...preprocessed,
            "-o", OUTPUT_RESULT_PATH,
          ]);
        const result = pythonProcess.stdout?.toString()?.trim();
        const error = pythonProcess.stderr?.toString()?.trim();

        if(print){
            console.log(pythonProcess)
            console.log(result);
            console.log(error);
        }

        let sheets : ParsedSheet[] = [];

        try{
            // Read output json file and delete it
            const outputData = fs.readFileSync(OUTPUT_RESULT_PATH, 'utf8');
            fs.unlinkSync(OUTPUT_RESULT_PATH);
            sheets = JSON.parse(outputData);
        }catch(e){
            console.error("Python error: ", error);
            throw new Error(e);
        }

        
        const formattedSheets = sheets.map(sheet => {
            const title = sheet.title
            const data = sheet.data;

            return {
                title,
                data
            }

        });

        return {
            sheets: formattedSheets,
        };
    }

    /**
     * Check if file has supported format, convert to image if needed
     * and return path to the image
     * @param inputPath Path to the file to be preprocessed
     */
    async preprocessFile(inputPath: string, outputPath:string): Promise<string[]>{
        const isValid = isFilePathValid(inputPath);
        if(!isValid){
            throw new Error("File path is not valid");
        }
        const format = getFileFormat(inputPath);

        console.log("Format: ", format)

        const isSupported = SUPPORTED_FORMATS.includes(format);
        if(!isSupported){
            throw new Error("File format not supported");
        }

        switch(format){
            case "pdf":
                const imagesPath = await this.convertPdfToImages(inputPath,outputPath);
                return imagesPath;
            default:
                return [inputPath];
        }
    }

    async convertPdfToImages(inputPath: string, outputFolder: string) : Promise<string[]>{
        const arr = await pdf2img.convert(inputPath);

        const outputs = [];
        for (let i = 0; i < arr.length; i++){
            const outputPath = `${outputFolder}/converted_${v4()}.png`;

            // Write into file
            fs.writeFileSync(outputPath, arr[i]);

            outputs.push(outputPath);
        }

        return outputs;
    }
}
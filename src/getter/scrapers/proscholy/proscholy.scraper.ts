import { ScrapeResult } from "../ScrapeResult";
import { ScraperTemplate } from "../ScraperTemplate";
import * as cheerio from "cheerio";

export default class test implements ScraperTemplate{

    tagCounts = {
        "I": 0,
        "R": 0,
        "B": 0,
        "V": 0
    }

    correctTag(tag:string){
        const tagChar = this.getTagChar(tag);
        this.tagCounts[tagChar[0]]++;
        return tagChar.replace("x", this.tagCounts[tagChar[0]]);
    }

    getTagChar(tag:string){
        switch(tag[0].toUpperCase()){
            case "P":
                return "I";
            case "R": 
                return "Rx";
            case "B":
                return "Bx";
            default:
                return "Vx";

        }
    }

    scrape(html: string): ScrapeResult {

        const $ = cheerio.load(html);

        const title = $(".song-name").text();

        const author = $("p.song-author").text();

        let sheetData = "";

        const pars = $("div.song-part");
        pars.each((i, par)=>{
            // sheetData+="{}";

            const lines = $(par).find(".song-line");
            lines.each((i, el)=>{

                const tag = $(el).find(".song-part-tag").text().trim().replace(/\s/g,'')
                if(tag.length>0){
                    sheetData+=`{${this.correctTag(tag)}}`
                }

                $(el).find(".chord").each((i, chord)=>{
                    const chordText = $(chord).find(".chord-sign").text()
                        .trim().replace(/\s/g,'').replace("​",''); // Removes Zero width space
                    if(chordText.length>0){
                        sheetData+=`[${chordText}]`
                    }
                    const data = $(chord).find(".chord-text").text();
                    if(data.length>0){
                        sheetData+=data;
                    }
                });

                sheetData+="\n";
            })
        })


        return {
            title,
            sheetData : sheetData
        }
    }
    
    
}
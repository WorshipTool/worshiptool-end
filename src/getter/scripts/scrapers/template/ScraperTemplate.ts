import { ScrapeResult } from "./ScrapeResult";

export class ScraperTemplate {
    constructor() { }
    scrape(data: string) : ScrapeResult {
        return {
            title: "",
            sheetData: ""
        };
    }
}

import { ScrapeResult } from "./scrapers/ScrapeResult";

export class PostAddGetterSourceDto {
    url: string;
}
export class PostScreenshotDto {
    url: string;
}
export class GetParseUrlQuery {
    url: string;
}

export class PostProcessNextResult{
    message: string;
    data?: ScrapeResult;
}

export class PostAddSubUrlDomainDto{
    domain: string;
}

export class PostSubUrlLoopDto{
    count: number;
}
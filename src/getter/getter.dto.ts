import { ScrapeResult } from "./scripts/scrapers/template/ScrapeResult";

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
    page: string;
}

export class PostSubUrlLoopDto{
    time: number;
}

export class PostProcessSubUrlDto{
    url: string;
}

export class PostProcessSourceLoopDto{
    time: number;
}
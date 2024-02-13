import { ExploreResult } from "./ExploreResult";

export class ExplorerTemplate {
    constructor() { }

    async explore(getHtml : (url:string)=>Promise<string>) : Promise<ExploreResult> {
        return {
            items: [
                {
                    url: "",
                    title: ""
                }
            ]
        };
    }
}

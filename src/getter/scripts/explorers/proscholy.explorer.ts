import { ExploreResult } from "./template/ExploreResult";
import { ExplorerTemplate } from "./template/ExplorerTemplate";
import * as cheerio from "cheerio";

export default class ProscholyExplorer implements ExplorerTemplate{
    async explore(getHtml): Promise<ExploreResult> {
        const url = "https://zpevnik.proscholy.cz/?razeni=2&sestupne=ano"
        const html = await getHtml(url);


        const $ = cheerio.load(html);

        const e = $("table>tbody>tr>td>a");
        const n = e.first().text();
        const max = Number.parseInt(n);


        const pages = Array(max).fill(0).map((p, i)=>{
            const u =  `https://zpevnik.proscholy.cz/pisen/${i}/`;
            return u;
        });


        return {
            items: pages.map(p=>({
                url: p
            }))
        }
    }

}
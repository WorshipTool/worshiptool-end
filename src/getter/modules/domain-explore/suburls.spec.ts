import { NestFactory } from "@nestjs/core";
import { DomainExploreSuburlsService } from "./domain-explore-suburls.service";
import { Test, TestingModule } from '@nestjs/testing';
import { DomainExploreModule } from "./domain-explore.module";
import { AppModule } from "../../../app.module";
import { DomainExploreUtilsService } from "./domain-explore-utils.service";

const testArray : [string, boolean][] = [
    ["https://oaza.tv/songbook/view/K1/", true],
    // ["https://oaza.tv/songbook/view/CH9/", true],
    ['https://oaza.tv/songbook/all', false],
    // ['https://oaza.tv/songbook/view/A1/', true],
    // ["https://oaza.tv/archive/page/",false],
    // ["https://zpevnik.proscholy.cz/pisen/1055/po-tebe-tuzim-viac", true],
    // ["https://zpevnik.proscholy.cz/?nahoda=50816",false],
    // ["https://zpevnik.proscholy.cz/",false],
    // ["https://zpevnik.proscholy.cz/pisen/1276/hluboka-reka",true],
    // ["https://supermusic.cz/",false],

    // ["https://supermusic.cz/skupina.php?idskupiny=1493369&idpiesne=1507284",true],
    // ["https://supermusic.cz/skupina.php?idpiesne=617063&sid=", true],
    // ["https://pisnicky-akordy.cz/krystof/cesta", true],
    // ["https://pisnicky-akordy.cz/", false],
    // ["https://pisnicky-akordy.cz/sverak-uhlir/sipkova-ruzenka", true],
    // ["https://kytaristka.cz/zpevnik/krystof/cesta", true],
    // ["https://kytaristka.cz/", false],
    // ["https://kytaristka.cz/zpevnik/nezmari/hallelujah-nezmari", true]



]

describe('Html contains a song', () => {
    let suburlsService: DomainExploreSuburlsService;
    let utilsService: DomainExploreUtilsService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [DomainExploreModule],
          }).compile();

        suburlsService = await module.get(DomainExploreSuburlsService);
        utilsService = await module.get(DomainExploreUtilsService);

        await utilsService.prepareBrowser();
        
        return;
    });

    afterAll(async () => {
        await utilsService.closeBrowser();
    })


    it('Test prepared', () => {
        expect(suburlsService).toBeDefined();
    });


    const testPage = async (url:string) => {
        const html = await utilsService.getHtml(url);

        const result =  await suburlsService.containsSong(html);
        console.log("Tested", url, "Result", result);

        expect(result).toBeDefined();
        return result;
    }

    for(const item of testArray){
        it(`Contains a song ${item[0]}`, async () => {
            jest.setTimeout(30000);
            const result = await testPage(item[0]);

            expect(result).toBe(item[1]);
            return;
        });
    }
});
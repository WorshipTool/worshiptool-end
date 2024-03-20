import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { GETTER_SEARCH_REPOSITORY, SONG_TITLE_REPOSITORY } from "../../../database/constants";
import { GetterSearch } from "../../../database/entities/getter/getter-search.entity";
import { SongTitle } from "../../../database/entities/songtitle.entity";

const slovnik = [
    "Křesťanské písně s textem a akordy",
    "Boží láska chválové písně",
    "Vykoupení a odpuštění akordy",
    "Boží věrnost worship songs",
    "Svoboda křesťanské texty",
    "Modlitba a oddanost akordy",
    "Díkůvzdání křesťanské písně",
    "Víra a naděje worship chords",
    "Sláva Boží chvály s textem",
    "Odevzdání se Boží vůli písně",
    "Posvěcení a růst křesťanské akordy",
    "Boží milosrdenství worship songs",
    "Kristův vzkříšení písně s akordy",
    "Boží vedení chvály s textem",
    "Svědectví o věrnosti akordy",
    "Světlo v temnotě křesťanské texty",
    "Boží moudrost worship chords",
    "Naděje ve víře písně s textem",
    "Svátost ve společenství chvály s akordy",
    "Boží pokoj křesťanské texty",
    "Svoboda v Kristu worship songs",
    "Boží milost chvály s textem",
    "Víra jako opora křesťanské akordy",
    "Radost ve službě písně s akordy",
    "Svědectví Boží lásky worship chords",
    "Boží nekonečná trpělivost křesťanské texty"
];


@Injectable()
export class DomainSearchQueryService{
    constructor(
        @Inject(GETTER_SEARCH_REPOSITORY)
        private searchRepository: Repository<GetterSearch>,

        @Inject(SONG_TITLE_REPOSITORY)
        private titlesRepository: Repository<SongTitle>,
    ){}

    async generateQueryFromTitles() : Promise<string | null>{
        // entity title has variable 'title'
        // entity search has variable 'query'
        // find one title, with value of title which doesnt exists in searchRepository's value query

        const t1 : GetterSearch = null;
        const t2 = t1?.query;
        const t3: SongTitle = null;
        const t4 = t3?.title;

        const queryBuilder = this.titlesRepository.createQueryBuilder("title")
            .leftJoinAndSelect("GetterSearch", "search", "search.query = title.title")
            .where("search.query IS NULL")
            .orderBy("RAND()")
            
        const result = await queryBuilder.getOne();
        if(!result) return null;

        const title = result.title;

        const query = title + " Akordy";

        return query;
    }
    
    generateRandomSearchQuery(maxDelkaSlova: number) {
        
        const nahodnaKlicovaSlova : string[] = [];
      
        for (let i = 0; i < 1; i++) {
          let slovo = '';
          const delkaSlova = Math.floor(Math.random() * maxDelkaSlova) + 1;
      
          for (let j = 0; j < delkaSlova; j++) {
            const nahodneIndex = Math.floor(Math.random() * slovnik.length);
            slovo += slovnik[nahodneIndex];
      
            // Přidat mezery mezi slovy (kromě posledního)
            if (j < delkaSlova - 1) {
              slovo += ' ';
            }
          }
      
          nahodnaKlicovaSlova.push(slovo);
        }
        
        return nahodnaKlicovaSlova[0] +" křesťanské písně s akordy -bakalářskápráce -dimpomovaprace";
    }

    async getSearchQuery(returnMock: boolean = false){    

        if(returnMock) return {
            query: "křesťanské písně s akordy - test",
            page: 0
        }

        const existing = await this.searchRepository.findOne({
            where:{
                processedAll: false
            },
            order:{
                lastSearch: "DESC"
            }
        });
        
        if(existing) return {
            query: existing.query,
            page: existing.lastPage+1
        };

        const generateFromTitles = Math.random() > 0.5;

        const grsq = () => this.generateRandomSearchQuery(3);
        const query = generateFromTitles ? 
            (await this.generateQueryFromTitles() || grsq()) : grsq();

        return {
            query: query,
            page: 0
        }
    }
}
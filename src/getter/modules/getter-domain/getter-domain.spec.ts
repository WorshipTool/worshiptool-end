import { Test } from "@nestjs/testing";
import { GetterDomainService } from "./getter-domain.service";
import { GetterDomainModule } from "./getter-domain.module";

describe("GetterSource", () => {

    let domainService: GetterDomainService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [GetterDomainModule],
          }).compile();

          domainService = await module.get(GetterDomainService);

        
        return;
    });

    it("should be defined", () => {
        expect(domainService).toBeDefined();
    });

    it("Get parent domain", ()=>{
        const domain1 = "ahoj.jak.se.mas.cz"
        const parent1 = domainService.getParentDomainString(domain1);
        const parent2 = domainService.getParentDomainString(parent1);
        const parent3 = domainService.getParentDomainString(parent2);
        expect(parent1).toBe("jak.se.mas.cz");
        expect(parent2).toBe("se.mas.cz");
        expect(parent3).toBe("mas.cz");
    
        const parent4 = domainService.getParentDomainString(parent3);
        expect(parent4).toBe("cz");

        const parent5 = domainService.getParentDomainString(parent4);
        expect(parent5).toBe(null);
        
    })

    it("Get domain level", ()=>{
        const domain1 = "ahoj.jak.se.mas.cz"
        const level1 = domainService.getDomainLevel(domain1);
        expect(level1).toBe(4);

        const domain2 = "jak.se.mas.cz"
        const level2 = domainService.getDomainLevel(domain2);
        expect(level2).toBe(3);
        
        const domain3 = "se.mas.cz"
        const level3 = domainService.getDomainLevel(domain3);
        expect(level3).toBe(2);

        const domain4 = "mas.cz"
        const level4 = domainService.getDomainLevel(domain4);
        expect(level4).toBe(1);

        const domain5 = "cz"
        const level5 = domainService.getDomainLevel(domain5);
        expect(level5).toBe(0);
    })
});
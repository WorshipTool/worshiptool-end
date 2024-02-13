import { Test } from "@nestjs/testing";
import { GetterSourceService } from "./getter-source.service";
import { GetterSourceModule } from "./getter-source.module";

describe("GetterSource", () => {

    let sourceService: GetterSourceService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [GetterSourceModule],
          }).compile();

          sourceService = await module.get(GetterSourceService);

        
        return;
    });

    it("should be defined", () => {
        expect(sourceService).toBeDefined();
    });

    it("should add source", async () => {
        const url = `https://www.google.com`;
        const source = await sourceService.addSource(url);
        expect(source.url).toBe(url);
    });

    it("should add sources", async () => {
        const urls = ["https://www.example.com", "https://www.google.com"];
        const result = await sourceService.addSources(urls);
        expect(result).toBeDefined();
    });

    it("should add sources", async () => {
        const urls = ["https://www.google.com", "https://www.google.com"];
        const result1 = await sourceService.addSource(urls[0]);
        const result2 = await sourceService.addSource(urls[1]);
        expect(result1).toBeDefined();
        expect(result2).toBeDefined();

        expect(result1.url).toBe(urls[0]);
        expect(result2.url).toBe(urls[1]);

        expect(result1.guid).toBe(result2.guid);
    });
});
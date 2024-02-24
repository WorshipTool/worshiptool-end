import { calculateSimilarity, normalizeCzechString } from "./string.tech";

describe("StringTech", () => {
    it("Should be same", () => {
        const coef = calculateSimilarity("Ahoj", "ahoj");
        console.log(coef);
        expect(coef).toBe(1);
    });

    it("Should be similar", () => {
        const coef = calculateSimilarity("Ahoj", "Ahoj");
        console.log(coef);
        expect(coef).toBeGreaterThan(0.5);
    });
});

describe('Normalize czech string', () => {
    it('Should be same', () => {
        const result = normalizeCzechString("Ahoj");
        expect(result).toBe("Ahoj");
    });

    it('Should be same - special chars', () => {
        const result = normalizeCzechString("Čučurietka");
        expect(result).toBe("Cucurietka");
    })
})

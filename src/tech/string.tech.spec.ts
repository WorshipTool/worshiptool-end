import { calculateSimilarity } from "./string.tech";

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
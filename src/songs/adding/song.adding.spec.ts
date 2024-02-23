import { Test } from "@nestjs/testing";
import { SongAddingService } from "./song.adding.service";
import { SongAddingModule } from "./song.adding.module";
import { randomString } from "../../tech/string.tech";

describe('Are the variants same?', () => {
    let service: SongAddingService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [SongAddingModule],
          }).compile();

          service = await module.get(SongAddingService);
        
        return;
    });

    it('empty variants should be equal', () => {
        const areSame = service.areSheetDataTheSame("","")
        expect(areSame).toBe(true)
    });

    it('Random variants should be equal', () => {
        for(let i = 0; i < 25; i++){
            const lenght = Math.floor(Math.random() * 100);
            const data = randomString(lenght);
            const areSame = service.areSheetDataTheSame(
                data,
                data
            )
            expect(areSame).toBe(true)
        }
    });

    it('variants should not be equal', () => {
        const areSame = service.areSheetDataTheSame("","a")
        expect(areSame).toBe(false)

        const areSame2 = service.areSheetDataTheSame("a","")
        expect(areSame2).toBe(false)
    });

    it('Ignore char case', () => {
        const areSame = service.areSheetDataTheSame("Ahoj","ahOj")
        expect(areSame).toBe(true)
    });


    it('Transposed variant should be same', () => {
        const sheetData1 = "[C]Ahoj[C]";
        const sheetData2 = "[D]Ahoj[D]";

        const areSame = service.areSheetDataTheSame(sheetData1, sheetData2);
        expect(areSame).toBe(true)
    });

    it('Transposed variant with different text should not be same', () => {
        const sheetData1 = "[C]Ahoj[C]";
        const sheetData2 = "[D]Cuus[D]";

        const areSame = service.areSheetDataTheSame(sheetData1, sheetData2);
        expect(areSame).toBe(false)
    });

    it("Variant with different chords should not be same", () => {
        const sheetData1 = "[C]Ahoj[D]";
        const sheetData2 = "[D]Ahoj[C]";

        const areSame = service.areSheetDataTheSame(sheetData1, sheetData2);
        expect(areSame).toBe(false)
    });

    it("Variant should not be same", () => {
        const sheetData1 = "[C]Ahoj[C]";
        const sheetData2 = "[E]AhTreba takk nejakkoj[E]";

        const areSame = service.areSheetDataTheSame(sheetData1, sheetData2);
        expect(areSame).toBe(false)
    });

    it("Variant with different chords type should not be same", () => {
        const sheetData1 = "[C]Ahoj[C]";
        const sheetData2 = "[Cm]Ahoj[C]";
        
        const areSame = service.areSheetDataTheSame(sheetData1, sheetData2);
        expect(areSame).toBe(false)
    });

    it("Variant with different chords type should not be same", () => {
        const sheetData1 = "[C]Ahoj[C]";
        const sheetData2 = "[E]Ahoj[Em]";
        
        const areSame = service.areSheetDataTheSame(sheetData1, sheetData2);
        expect(areSame).toBe(false)
    });

    it("Should be same", () => {
        const sheetData1 = "[C]Ahoj\n[D]";
        const sheetData2 = "[C]Ahoj\n\n[D]";
        
        const areSame = service.areSheetDataTheSame(sheetData1, sheetData2);
        expect(areSame).toBe(true)
    });



});

describe("GetVariantRelation - sameSong and sameVariant", () => {
    let service: SongAddingService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [SongAddingModule],
          }).compile();

          service = await module.get(SongAddingService);
        
        return;
    });

    it("Empty variants", () => {
        const v1 = {
            title: "",
            sheetData: ""
        }
        const v2 = {
            title: "",
            sheetData: ""
        }
        try{
            const relation = service.getVariantRelation(v1, v2);
        }catch(e){
            const mess : string = e.message;
            expect(mess.includes("not valid")).toBe(true);
        }
    });

    it("Should be same", () => {
        const v1 = {
            title: "Ahoj",
            sheetData: "[C]Ahoj[C] svete\nahoj prirodo"
        }

        const v2 = {
            title: "Ahoj",
            sheetData: "[C]Ahoj[C] svete\nahoj prirodo"
        }

        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(true);
        expect(relation.isSameVariant).toBe(true);
        
        const isSame = service.areSheetDataTheSame(v1.sheetData, v2.sheetData);
        expect(relation.isSameVariant).toBe(isSame);
    });

    it("Transposed should be same", () => {
        const v1 = {
            title: "Ahoj",
            sheetData: "[C]Ahoj[C] svete\nahoj prirodo[C]"
        }

        const v2 = {
            title: "Ahoj",
            sheetData: "[D]Ahoj[D] svete\nahoj prirodo[D]"
        }

        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(true);
        expect(relation.isSameVariant).toBe(true);

        const isSame = service.areSheetDataTheSame(v1.sheetData, v2.sheetData);
        expect(relation.isSameVariant).toBe(isSame);
    });

    it("Different chords should not be same", () => {
        const v1 = {
            title: "Ahoj",
            sheetData: "[C]Ahoj[C] svete\nahoj prirodo[C]"
        }

        const v2 = {
            title: "Ahoj",
            sheetData: "[Dm]Ahoj[D] svete\nahoj prirodo[Dm]"
        }

        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(true);
        expect(relation.isSameVariant).toBe(false);
        
        const isSame = service.areSheetDataTheSame(v1.sheetData, v2.sheetData);
        expect(relation.isSameVariant).toBe(isSame);
    });

    it("Different text should not be same", () => {
        const v1 = {
            title: "Ahojda",
            sheetData: "[C]Nashle[C] svete\nnashle prirodo[C]"
        }

        const v2 = {
            title: "Ahoj",
            sheetData: "[C]Ahoj[C] svete\nahoj prirodo[C]"
        }

        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(false);
        expect(relation.isSameVariant).toBe(false);
        
        const isSame = service.areSheetDataTheSame(v1.sheetData, v2.sheetData);
        expect(relation.isSameVariant).toBe(isSame);
    });


    it("Different text should not be same", () => {
        const v1 = {
            title: "Ahojda",
            sheetData: "[C]Nashle[C] svete\nnashle prirodo[C]"
        }

        const v2 = {
            title: "Ahoj",
            sheetData: "[C]Nashle[C] svete\nnashleee prirodo[C]"
        }

        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(true);
        expect(relation.isSameVariant).toBe(false);
        
        const isSame = service.areSheetDataTheSame(v1.sheetData, v2.sheetData);
        expect(relation.isSameVariant).toBe(isSame);
    });

});

describe("GetVariantRelation - key and title", () => {
    let service: SongAddingService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [SongAddingModule],
          }).compile();

          service = await module.get(SongAddingService);
        
        return;
    });

    it("Same titles", () => {
        const v1 = {
            title: "Ahoj",
            sheetData: "blablabla\njupiiiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "nene\njupiiiiii"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.hasSameTitle).toBe(true);
        expect(relation.inSameKey).toBe(true);
        expect(relation.textIsSame).toBe(false);
        expect(relation.isSameSong).toBe(false);
    });

    it("Different titles", () => {
        const v1 = {
            title: "Ahoj",
            sheetData: "blablabla\njupiiiiii"
        }
        const v2 = {
            title: "Ahojda",
            sheetData: "nene\njupiiiiii"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.hasSameTitle).toBe(false);
        expect(relation.inSameKey).toBe(true);
        expect(relation.textIsSame).toBe(false);
        expect(relation.isSameSong).toBe(false);
    });

    it("Different titles", () => {
        const v1 = {
            title: "Ahoj",
            sheetData: "blablablabla\njupiiiiii"
        }
        const v2 = {
            title: "Ahojda",
            sheetData: "blablablab\njupiiiiii"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.hasSameTitle).toBe(false);
        expect(relation.inSameKey).toBe(true);
        expect(relation.textIsSame).toBe(false);
        expect(relation.isSameSong).toBe(true);
        expect(relation.isSameVariant).toBe(false);
    });

});

describe("GetVariantRelation - text spacing", () => {
    let service: SongAddingService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [SongAddingModule],
          }).compile();

          service = await module.get(SongAddingService);
        
        return;
    });

    it("Same lines", () => {
        const v1 = {
            title: "Ahoj",
            sheetData: "blablabla\njupiiiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "blablabla\njupiiiiii"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.textIsSame).toBe(true);
        expect(relation.isSameSong).toBe(true);
        expect(relation.textHasDifferentSpacing).toBe(false);
    });


    it("Different lines", () => {
        const v1 = {
            title: "Ahoj",
            sheetData: "blablabla\njupiiiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "bla\nblablajupiiiiii"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.textIsSame).toBe(true);
        expect(relation.isSameSong).toBe(true);
        expect(relation.textHasDifferentSpacing).toBe(true);
    });


    it("Different lines", () => {
        const v1 = {
            title: "Ahojda",
            sheetData: "blablabla\njupiiiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "bla\nblablajupi\niiiii"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.textIsSame).toBe(true);
        expect(relation.isSameSong).toBe(true);
        expect(relation.textHasDifferentSpacing).toBe(true);
    });


    it("Different lines", () => {
        const v1 = {
            title: "Ahojda",
            sheetData: "blablabla\njupiiiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "bla\nblabablajupi\niiiii"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.textIsSame).toBe(false);
        expect(relation.isSameSong).toBe(true);
        expect(relation.textHasDifferentSpacing).toBe(true);
    });


    it("Different lines", () => {
        const v1 = {
            title: "Ahojda",
            sheetData: "blablabla\njupii\niiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "bla\nblablajupi\niiiii"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.textIsSame).toBe(true);
        expect(relation.isSameSong).toBe(true);
        expect(relation.textHasDifferentSpacing).toBe(true);
    });


    it("Different spaces", () => {
        const v1 = {
            title: "Ahojda",
            sheetData: "bla\nbla  blajupi\niiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "bla\nblablajupi\nii ii i"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.textIsSame).toBe(true);
        expect(relation.isSameSong).toBe(true);
        expect(relation.textHasDifferentSpacing).toBe(true);
    });


    it("Same spaces", () => {
        const v1 = {
            title: "Ahojda",
            sheetData: "bla\nbla  blajupi\niiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "bla\nbla  blajupi\niiiii"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.textIsSame).toBe(true);
        expect(relation.isSameSong).toBe(true);
        expect(relation.textHasDifferentSpacing).toBe(false);
    });

});

describe("GetVariantRelation - sections", () => {
    let service: SongAddingService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [SongAddingModule],
          }).compile();

          service = await module.get(SongAddingService);
        
        return;
    });

    it("One verse more", () => {
        const v1 = {
            title: "Ahoj",
            sheetData: "{V1}blablabla\njupiiiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "{V1}blablabla\njupiiiiii{V2}jupiijejej\nnevimm"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(true);
        expect(relation.textIsSame).toBe(true);
        expect(relation.textHasDifferentSpacing).toBe(false);
        expect(relation.hasDifferentSection).toBe(true);
        expect(relation.differentCountOfSection).toBe(true);
    });


    it("Sections has different names", () => {
        const v1 = {
            title: "Ahoj",
            sheetData: "{V1}blablabla\njupiiiiii{R1}jupiijejej\nnevimm"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "{V1}blablabla\njupiiiiii{V2}jupiijejej\nnevimm"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(true);
        expect(relation.textIsSame).toBe(true);
        expect(relation.textHasDifferentSpacing).toBe(false);
        expect(relation.hasDifferentSection).toBe(false);
        expect(relation.differentCountOfSection).toBe(false);
    });


    it("Sections without first named", () => {
        console.log("Sections without first named")
        const v1 = {
            title: "Ahoj",
            sheetData: "blablabla\njupiiiiii{R1}jupiijejej\nnevimm"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "{V1}blablabla\njupiiiiii{V2}jupiijejej\nnevimm"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(true);
        expect(relation.textIsSame).toBe(true);
        expect(relation.textHasDifferentSpacing).toBe(false);
        expect(relation.hasDifferentSection).toBe(false);
        expect(relation.differentCountOfSection).toBe(false);
        expect(relation.sectionsHasDifferentNames).toBe(true);
    });


    it("Sections in different order", () => {
        const v1 = {
            title: "Ahoj",
            sheetData: "{V2}jupiijejej\nnevimm{V1}blablabla\njupiiiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "{V1}blablabla\njupiiiiii{V2}jupiijejej\nnevimm"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(true);
        expect(relation.textIsSame).toBe(true);
        expect(relation.textHasDifferentSpacing).toBe(false);
        expect(relation.hasDifferentSection).toBe(false);
        expect(relation.differentCountOfSection).toBe(false);
        expect(relation.sectionsHasDifferentNames).toBe(false);
        expect(relation.sectionsInDifferentOrder).toBe(true);
    });


    it("Sections in different order and names", () => {
        const v1 = {
            title: "Ahoj",
            sheetData: "{V1}jupiijejej\nnevimm{R1}blablabla\njupiiiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "{V1}blablabla\njupiiiiii{V2}jupiijejej\nnevimm"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(true);
        expect(relation.textIsSame).toBe(true);
        expect(relation.textHasDifferentSpacing).toBe(false);
        expect(relation.hasDifferentSection).toBe(false);
        expect(relation.differentCountOfSection).toBe(false);
        expect(relation.sectionsHasDifferentNames).toBe(true);
        expect(relation.sectionsInDifferentOrder).toBe(true);
    });

    it("One more section in middle", () => {
        const v1 = {
            title: "Ahoj",
            sheetData: "{V1}jupiijejej\nnevimm{V2}A tohle je druha sloka{R1}blablabla\njupiiiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "{V1}jupiijejej\nnevimm{R1}blablabla\njupiiiiii"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(true);
        expect(relation.textIsSame).toBe(true);
        expect(relation.textHasDifferentSpacing).toBe(false);
        expect(relation.hasDifferentSection).toBe(true);
        expect(relation.differentCountOfSection).toBe(true);
        expect(relation.sectionsHasDifferentNames).toBe(false);
        expect(relation.sectionsInDifferentOrder).toBe(true);
    });

});

describe("GetVariantRelation - chords", () => {
    let service: SongAddingService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [SongAddingModule],
          }).compile();

          service = await module.get(SongAddingService);
        
        return;
    });

    it("Chords are same", () => {
        const v1 = {
            title: "Ahoj",
            sheetData: "{V1}[C]blablabla\nj[C]upiiiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "{V1}[D]blablabla\nj[D]upiiiiii"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(true);
        expect(relation.textIsSame).toBe(true);
        expect(relation.textHasDifferentSpacing).toBe(false);
        expect(relation.hasDifferentSection).toBe(false);
        expect(relation.differentCountOfSection).toBe(false);
        expect(relation.sectionsHasDifferentNames).toBe(false);
        expect(relation.sectionsInDifferentOrder).toBe(false);
        expect(relation.chordsAreSame).toBe(true);
        expect(relation.chordsHasDifferentPlacing).toBe(false);
    });

    it("Chords are not same", () => {
        const v1 = {
            title: "Ahoj",
            sheetData: "{V1}[C]blablabla\nj[C]upiiiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "{V1}[D]blablabla\nj[C]upiiiiii"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(true);
        expect(relation.chordsAreSame).toBe(false);
        expect(relation.chordsHasDifferentPlacing).toBe(true);
    });

    it("Chords are the same, but one verse more", () => {
        const v1 = {
            title: "Ahoj",
            sheetData: "{V1}[C]blablabla\nj[C]upiiiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "{V1}[D]blablabla\nj[D]upiiiiii{V2}jupii[G]jejej\nnevimm"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(true);
        expect(relation.chordsAreSame).toBe(true);
        expect(relation.chordsHasDifferentPlacing).toBe(false);
        expect(relation.hasDifferentSection).toBe(true);
        expect(relation.differentCountOfSection).toBe(true);
    });

    it("Chords are not the same, but one verse more", () => {
        const v1 = {
            title: "Ahoj",
            sheetData: "{V1}[C]blablabla\nj[C]upiiiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "{V1}[E]blablabla\nj[D]upiiiiii{V2}jupii[G]jejej\nnevimm"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(true);
        expect(relation.chordsAreSame).toBe(false);
        expect(relation.chordsHasDifferentPlacing).toBe(true);
        expect(relation.hasDifferentSection).toBe(true);
        expect(relation.differentCountOfSection).toBe(true);
    });

    it("Chords are the same, but different placing", ()=>{
        const v1 = {
            title: "Ahoj",
            sheetData: "{V1}[C]blablabla\nj[C]upiiiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "{V1}[C]blablabla\njupiiiiii[C]"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(true);
        expect(relation.isSameVariant).toBe(true);
        expect(relation.chordsAreSame).toBe(true);
        expect(relation.chordsHasDifferentPlacing).toBe(true);
    })

    it("Chords are the same, but different placing", ()=>{
        const v1 = {
            title: "Ahoj",
            sheetData: "{V1}[C]blablabla\nj[C]upiiiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "{V1}[D]blabla[D]bla\njupiiiiii"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(true);
        expect(relation.isSameVariant).toBe(true);
        expect(relation.chordsAreSame).toBe(true);
        expect(relation.chordsHasDifferentPlacing).toBe(true);
    })

    it("Chords are not the same, but different placing", ()=>{
        const v1 = {
            title: "Ahoj",
            sheetData: "{V1}[C]blablabla\nj[C]upiiiiii"
        }
        const v2 = {
            title: "Ahoj",
            sheetData: "{V1}[D]blabla[F]bla\njupiiiiii"
        }
        const relation = service.getVariantRelation(v1, v2);
        expect(relation.isSameSong).toBe(true);
        expect(relation.isSameVariant).toBe(false);
        expect(relation.chordsAreSame).toBe(false);
        expect(relation.chordsHasDifferentPlacing).toBe(true);
    })
});
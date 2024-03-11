import { Inject, Injectable } from "@nestjs/common";
import { Sheet } from "@pepavlin/sheet-api";
import { Section } from "@pepavlin/sheet-api/lib/models/song/section";
import { calculateSimilarity, normalizeCzechString } from "../../tech/string.tech";
import { VariantRelationInDto } from "./song.adding.dto";
import { Repository } from "typeorm";
import { SONG_VARIANTS_REPOSITORY } from "../../database/constants";
import { SongVariant } from "../../database/entities/songvariant.entity";
import normalizeSearchText from "../../tech/normalizeSearchText";



export type VariantRelationOutDto = {
    isSameSong: boolean,
    isSameVariant: boolean,

    // Title
    hasSameTitle: boolean,
    titleSimilarity: number,

    // Text
    // is text the same, without case, new lines and new verses
    // If there is different verse, it is not the text
    // If there is one more verse, but rest is the same, it is the same text
    textIsSame: boolean, 
    textHasDifferentSpacing: boolean,
    // Text coeficient
    textSimilarity: number,

    // Total similarity
    similarity: number,

    // Sections
    differentCountOfSection: boolean,
    hasDifferentSection: boolean,
    sectionsHasDifferentNames: boolean,
    sectionsInDifferentOrder: boolean,

    //Chords
    chordsHasDifferentPlacing: boolean,
    chordsAreSame: boolean,
    inSameKey: boolean,
}

@Injectable()
export class SongAddingTechService{

    constructor(
        @Inject(SONG_VARIANTS_REPOSITORY)
        private variantRepository: Repository<SongVariant>,
    ){}

    isSheetDataValid(sheetData: string){
        if(!sheetData) return false;
        return sheetData.length > 10 && sheetData.split("\n").length > 1;
    }

    // Compare two variants, ignores case and new lines
    areSheetDataTheSame(data1: string, data2: string){
        const sheet1 = new Sheet(data1);
        const sheet2 = new Sheet(data2);

        sheet1.setKey("C");
        sheet2.setKey("C");

        const text1 = sheet1.toString().replace(/\s/g, '');
        const text2 = sheet2.toString().replace(/\s/g, '');
        return text1.toLocaleLowerCase() === text2.toLocaleLowerCase();
    }

    private normalizeVariantText(text: string){
        return normalizeCzechString(text.toLocaleLowerCase().replace(/\s/g, ""));
    }

    getVariantRelation(v1:VariantRelationInDto, v2:VariantRelationInDto) : VariantRelationOutDto{
        // Check if both variants are valid
        const vl1 = this.isSheetDataValid(v1.sheetData);
        const vl2 = this.isSheetDataValid(v2.sheetData);
        if(!vl1 && !vl2) throw new Error("Both variants are not valid");
        if(!vl1) throw new Error("Sheet data 1 is not valid");
        if(!vl2) throw new Error("Sheet data 2 is not valid");



        const sheet1 = new Sheet(v1.sheetData);
        const sheet2 = new Sheet(v2.sheetData);

        const key1 = sheet1.getKeyChord()
        const key2 = sheet2.getKeyChord()

        // Compare keys
        const inSameKey = key1?.data.rootNote === key2?.data.rootNote;
        

        sheet1.setKey("C");
        sheet2.setKey("C");

        const sections1 = sheet1.getSections()
        const sections2 = sheet2.getSections()

        type SecData = {
            index: number,
            pairIndex: number,
            similarity: number
        }
        const emptySecData = {
            index: -1,
            pairIndex: -1,
            similarity: 0
        }
        const sectionPair1 : SecData[] = Array(sections1.length).fill(emptySecData);
        const sectionPair2 : SecData[] = Array(sections2.length).fill(emptySecData);

        // For every section find the most similar section in the other variant
        for(let i = 0; i < sections1.length; i++){
            let maxSimilarity = 0;
            let maxSimilarityIndex = -1;
            for(let j = 0; j < sections2.length; j++){
                const similarity = calculateSimilarity(
                    this.normalizeVariantText(sections1[i].text), 
                    this.normalizeVariantText(sections2[j].text));
                if(similarity > maxSimilarity){
                    maxSimilarity = similarity;
                    maxSimilarityIndex = j;
                }
            }
            sectionPair1[i] = {
                index: i,
                pairIndex: maxSimilarityIndex,
                similarity: maxSimilarity
            };
        }

        // Check seconds array 
        for(let i = 0; i < sections2.length; i++){

            let maxSimilarity = 0;
            let maxSimilarityIndex = -1;
            for(let j = 0; j < sections1.length; j++){
                const similarity = calculateSimilarity(
                    this.normalizeVariantText(sections2[i].text), 
                    this.normalizeVariantText(sections1[j].text));
                if(similarity > maxSimilarity){
                    maxSimilarity = similarity;
                    maxSimilarityIndex = j;
                }
            }
            sectionPair2[i] = {
                index: i,
                pairIndex: maxSimilarityIndex,
                similarity: maxSimilarity
            };
        }

        // console.log(sectionPair1, sectionPair2)



        // Calculate sections1 with similarity less than 0.9
        const THRESHOLD = 0.9;
        const sectionPair1LessThan09 = sectionPair1.filter(p => p.similarity < THRESHOLD);
        const sectionPair2LessThan09 = sectionPair2.filter(p => p.similarity < THRESHOLD);

        const hasDifferentSection = sectionPair1LessThan09.length > 0 || sectionPair2LessThan09.length > 0;
        const differentCountOfSection = sectionPair1LessThan09.length !== sectionPair2LessThan09.length;

        
        // Check if similar sections is completely the same
        const similarSections1 = sectionPair1.filter(p => p.similarity >= THRESHOLD);
        const similarSections2 = sectionPair2.filter(p => p.similarity >= THRESHOLD);

        const t1 = normalizeSearchText(this.normalizeVariantText(sheet1.getText()));
        const t2 = normalizeSearchText(this.normalizeVariantText(sheet2.getText()));
        const containsInEachOther = t1.includes(t2) || t2.includes(t1);
        
        const isSameSong = (similarSections1.length>0 && similarSections2.length>0) || containsInEachOther;

        const textIsSame = isSameSong 
            && similarSections1.every((p)=>p.similarity === 1) 
            && similarSections2.every((p)=>p.similarity === 1);

        const smallerSections = similarSections1.length < similarSections2.length 
                ? similarSections1 : similarSections2;

        const textSimilarity = smallerSections.length > 0 
                ? smallerSections.reduce((a, p)=>a+p.similarity, 0) / smallerSections.length
                : calculateSimilarity(sheet1.getText(), sheet2.getText());

        // Compare titles
        const titleSimilarity = calculateSimilarity(v1.title, v2.title);
        const hasSameTitle =  titleSimilarity === 1;

        const weights = [0.95, 0.05]
        const totalSimilarity = (textSimilarity * weights[0] + titleSimilarity * weights[1]) 
                    / (weights[0] + weights[1]);


        const getChords = (s: Section) => {
            return s?.lines?.map(l=>l.segments.map(s=>s.chord?.toString())).flat().filter(s=>s)||[];
        }
        const chordTest = (p: SecData, s1: Section[], s2: Section[]) => {
            const sec1 = getChords(s1[p.index]).join("");
            const sec2 = getChords(s2[p.pairIndex]).join("");
            // console.log(sec1, sec2)
            return sec1 === sec2;
        }
        const chordsAreSame = similarSections1.every((p)=>chordTest(p,sections1,sections2)) && similarSections2.every((p)=>chordTest(p,sections2,sections1));
        const chordsHasDifferentPlacing = !textIsSame 
            || !chordsAreSame 
            || similarSections1.some(p=>{
                const sec1 = sections1[p.index].toString().toLocaleLowerCase().trim();
                const sec2 = sections2[p.pairIndex].toString().toLocaleLowerCase().trim();
                const r = sec1 !== sec2;
                return r;
            })

        const spaceTest = (p: SecData) => {
            const sec1 = sections1[p.index]?.text;
            const sec2 = sections2[p.pairIndex]?.text;

            if(!sec1 || !sec2) return false;

            const noCase1 = sec1.toLocaleLowerCase();
            const noCase2 = sec2.toLocaleLowerCase();

            const noLines1 = noCase1.replace(/\s/g, '');
            const noLines2 = noCase2.replace(/\s/g, '');

            return noLines1 === noLines2 && noCase1 !== noCase2;
        }
        const textHasDifferentSpacing = !textIsSame || similarSections1.some((p)=>spaceTest(p)) || similarSections2.some((p)=>spaceTest(p));

        const sectionsHasDifferentNames = similarSections1.some((p)=>sections1[p.index].name !== sections2[p.pairIndex].name);

        
        const sectionsInDifferentOrder = hasDifferentSection || !(
            similarSections1.map(p=>p.pairIndex).every((p, i, a)=>i===0 || p > a[i-1])
        );
        return {
            isSameSong,
            isSameVariant: isSameSong && !hasDifferentSection && textIsSame && chordsAreSame,
            hasSameTitle,
            titleSimilarity,
            textIsSame,
            textHasDifferentSpacing,
            textSimilarity,

            similarity: totalSimilarity,

            differentCountOfSection,
            hasDifferentSection,
            sectionsHasDifferentNames,
            sectionsInDifferentOrder,

            chordsAreSame,
            chordsHasDifferentPlacing,

            inSameKey
        }
    }
}
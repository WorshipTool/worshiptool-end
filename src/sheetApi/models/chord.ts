import { transposeNote } from "../transpose";
import { alternativeChordQualityNames, changeToCustomName, chordQuality } from "./chordQuality";
import { note, notes } from "./note";

export default interface chord{
    rootNote: note,
    quality: chordQuality
}

export const chordToText = (c: chord) : string => {
    return c.rootNote + changeToCustomName(c.quality, [
        {quality: 'maj', name: ''},
        {quality: 'min', name: 'm'},
        {quality: 'min7', name: "m7"}
    ])
}

export const textToChord = (input: string) : chord => {
    if(input==="") return {
        rootNote: 'C',
        quality: 'maj'
    }
    let root : any = input.slice(0,2);
    if(input.length<1||(input.charAt(1)!='#')) root = input.slice(0,1);

    const bflat = input.charAt(1)=='b';
    let rootNoteTyped : note = root;
    if(bflat){
        rootNoteTyped = transposeNote(rootNoteTyped,-1);
    }

    const letter : string = root.slice(0,1);
    const secondPart = input.slice(root.length+(bflat?1:0),input.length);

    
    if(letter==letter.toLowerCase()){
        return {
            rootNote: rootNoteTyped,
            quality: 'min'
        }
    }

    const arr = alternativeChordQualityNames;

    for(let i=0; i<arr.length; i++){
        const alt = arr[i];

        let found : boolean = false;
        if(alt.main==secondPart)found=true;
        for(let a=0; a<alt.alternatives.length; a++){
            if(found)break;
            if(alt.alternatives[a]===secondPart){
                found = true;
            }
        }

        if(found){
            return {
                rootNote: rootNoteTyped,
                quality: alt.main
            } 
        }
        
        
    }

    const qualityText : any = secondPart;
    const q : chordQuality = qualityText;

    return {
        rootNote: rootNoteTyped,
        quality: q
    }
}
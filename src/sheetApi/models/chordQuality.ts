export type chordQuality = 'maj'|"min"|"7"|"min7"|"2"|"maj7"|"maj9";
export const alternativeChordQualityNames: {main: chordQuality, alternatives: string[]}[] = [
    {main: "maj", alternatives: [""]},
    {main:"min", alternatives: ["m"]},
    {main: "min7", alternatives: ["m7"]}
]


export const changeToCustomName = (q: chordQuality, custom: {quality: chordQuality, name: string}[]) => {
    const found = custom.filter((c)=>{
        return c.quality == q;
    });

    if(found.length>0){
        return found[0].name;
    }

    return q;
}
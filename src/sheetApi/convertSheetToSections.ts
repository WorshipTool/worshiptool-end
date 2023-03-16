import { Line, Section, Segment } from "./models/section";
import chord, { textToChord } from "./models/chord";


export default function convertSheetToSections(sheet: string) : Section[]{
    let isOk = true;
    const sections: Section[] = sheet.split("{").filter((partA, ia)=>{
      if(ia==0&&partA==="")return 0;
      return 1;
    }).map((partA, ia) => {
  
      const arrA: string[] = partA.split("}");
      
      if (ia==0&&arrA.length<2){ //situation when it doesnt begin with {
        arrA.splice(0, 0, "");
      }
  
      
      if (ia!=0&&arrA.length < 2) {
        isOk = false;
        return {};
      }

      let sectionText = "";
  
      const name = arrA[0];
      const lines: Line[] = arrA[1]
      .split("\n")
      .map((partB) => {

        let lineText = "";
  
        const segments: Segment[] = partB.split("[").map((partC, ib) => {
          const arrC = partC.split("]");
  
          if(ib==0){
            const segText = arrC[0];//.replace(/ /g, '\u00A0');
            lineText += segText;
            return { text: segText};
          }else{
            if (ib!=0&&arrC.length < 2) {
              isOk = false;
              return {};
            }
          }
          const segText = arrC[1];//.replace(/ /g, '\u00A0');
          lineText += segText;
          const c : chord = textToChord(arrC[0]);

          return { chord: c, text: segText};
        })
        
        sectionText += (sectionText!=""?"\n":"") + lineText;

        return { segments: segments, text: lineText};
      })
  
  
      return { name: name, lines: lines, text: sectionText }
    })
  
    return sections;
  }
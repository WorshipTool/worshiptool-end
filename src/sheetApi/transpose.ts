import chord from "./models/chord"
import { note, notes } from "./models/note"

export const transposeNote = (n: note, offset: number):note => {
    let index =(notes.indexOf(n) + offset) % notes.length;
    if(index<0)index+=notes.length;
    return notes[index];
}
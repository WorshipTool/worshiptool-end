import { MediaTypes } from "src/database/entities/media.entity";

export default function checkMediaFormat({type, url}:{type: MediaTypes, url: string}) : boolean{
    switch(type){
        case MediaTypes.Youtube:
            const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
            const match = url.match(regExp);
            const id = (match&&match[7].length==11)? match[7] : null;
            return id!=null;
    }
    return true;
}
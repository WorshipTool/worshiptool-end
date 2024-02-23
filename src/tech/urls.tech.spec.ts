import { isUrlInLengthLimit } from "../getter/tech/utils";
import { isUrlValid } from "./urls.tech";

describe('Tech Urls', () => {

    it('Url should be valid', () => {
        const url1 = "http://www.agama2000.cz/24wiso7za5vn9igmvxabceghijlmo/Lutka Petr/hnlzmanrltfgqisyyxbchij/Inzerát/E";
        
        const inLength = isUrlInLengthLimit(url1);
        expect(inLength).toBe(true);
        
        const isValid = isUrlValid(url1);
        expect(isValid).toBe(true);

    });
});
import { SongVariant } from "../database/entities/songvariant.entity";
import { calculateSimilarity, normalizeCzechString } from "../tech/string.tech";

const normalize = (str: string) => {
    // Get only substring before first bracket
    str = str.split("(")[0].trim();
    //Remove all special characters
    str = normalizeCzechString(str);
    str = str.replace(/[^a-zA-Z0-9 ]/g, "");

    // Replace multispaces with dashes
    str = str.replace(/ /g, "-").toLocaleLowerCase();
    return str;
};

export const createVariantAlias = (variant: SongVariant) => {
    if (!variant.prefferedTitle) {
        throw new Error("Variant's title is not reachable.");
    }

    let title = variant.prefferedTitle.title;
    title = normalize(title);

    // Create random hex, 5 characters
    const randomHex = Math.random().toString(16).substr(2, 5);
    return `${randomHex}-${title}`;
};

export const shouldCreateNewAlias = (
    oldAlias: string,
    variant: SongVariant
) => {
    if (!variant.prefferedTitle) {
        throw new Error("Variant's title is not reachable.");
    }

    const SIMILARITY_THRESHOLD = 0.7;

    // Get substring after first - to the end
    const oldStr = oldAlias.split("-").slice(1).join("-");
    const newStr = normalize(variant.prefferedTitle.title);
    const similarity = calculateSimilarity(oldStr, newStr);

    return similarity < SIMILARITY_THRESHOLD;
};

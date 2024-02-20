export const GETTER_URL_MAX_LENGTH = 255;

export const isUrlInLengthLimit = (url: string) => url.length <= GETTER_URL_MAX_LENGTH;
export const getFileFormat = (path: string): string | null => {
    if(!isFilePathValid(path)){
        return null;
    };

    const parts = path.split(".");
    return parts[parts.length - 1];
}

export const isFilePathValid = (path: string): boolean => {
    return path.length > 0;
}
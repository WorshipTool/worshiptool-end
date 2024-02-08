export const isUrlValid = (url: string) => {
    if(!url) return false;
    if(!url.startsWith("http")) return false;

    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}

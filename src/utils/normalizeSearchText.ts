export default function normalizeSearchText(input: string) : string{
    return input.replace(/[^A-Za-z0-9]/gi, "");
}
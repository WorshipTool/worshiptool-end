export default function normalizeSearchText(input: string) : string{
    return input.replace(/\s/gi, "").replace(/_/gi, "");
}
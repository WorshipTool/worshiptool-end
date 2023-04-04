export default function normalizeSearchText(input: string) : string{
    return input.replace(/[\s_\n,.-\[\]:\/\"]/gi, "");
}
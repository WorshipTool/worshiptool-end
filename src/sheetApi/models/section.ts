import chord from "./chord"

export interface Segment {
    chord?: chord,
    text?: string
}
export interface Line {
    segments: Segment[],
    text? : string
}
export interface Section {
    name?: string,
    lines?: Line[],
    text? : string
}


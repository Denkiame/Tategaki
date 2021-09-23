export enum StringFormatGuide {
    default = 'default',
    cjkPunc = 'cjk-punc',
    latin = 'latin',
    ambiguous = 'ambiguous',
}

export type StringFormatSegment = {
    content: string
    formatGuide: StringFormatGuide
}

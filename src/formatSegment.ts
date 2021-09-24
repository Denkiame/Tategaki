export enum StringFormatGuide {
    default = 'default',
    cjkPunc = 'cjk-punc',
    fullwidthAlphabet = 'fullwidth-alphabet',
    latin = 'latin',
    ambiguous = 'ambiguous',
}

export type StringFormatSegment = {
    content: string
    formatGuide: StringFormatGuide
}

export declare enum StringFormatGuide {
    default = "default",
    cjkPunc = "cjk-punc",
    fullwidthAlphabet = "fullwidth-alphabet",
    latin = "latin",
    kana = "kana",
    ambiguous = "ambiguous"
}
export declare type StringFormatSegment = {
    content: string;
    formatGuide: StringFormatGuide;
};

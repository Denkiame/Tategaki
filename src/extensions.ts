enum StringFormatGuide {
    default = 'default',
    cjkPunc = 'cjk-punc',
    latin = 'latin',
    ambiguous = 'ambiguous',
}

interface StringFormatSegment {
    content: string
    formatGuide: StringFormatGuide
}

declare interface String {
    segmentise(re: RegExp): StringFormatSegment[]
}

String.prototype.segmentise = function (re) {
    let str = String(this) 
    let segments: StringFormatSegment[] = []
    let index: number = 0
    let match: RegExpExecArray | null
    while (match = re.exec(str)) {
        if (match.index > index) {
            segments.push({
                content: str.substring(index, match.index),
                formatGuide: StringFormatGuide.default
            })
        }
        let formatGuide = match[1] ? StringFormatGuide.cjkPunc : StringFormatGuide.latin
        segments.push({
            content: match[0],
            formatGuide: formatGuide
        })
        index = match.index + match[0].length
    }
    
    if (str.length > index) {
        segments.push({
            content: str.substring(index),
            formatGuide: StringFormatGuide.default
        })
    }
    return segments
}

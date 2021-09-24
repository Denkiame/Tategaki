import { StringFormatSegment, StringFormatGuide } from './formatSegment'

declare global {
    interface String {
        segmentise(re: RegExp): StringFormatSegment[]
    }
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

        let formatGuide: StringFormatGuide
        if (match[1]) {
            formatGuide = StringFormatGuide.cjkPunc
        } else if (match[2]) {
            formatGuide = StringFormatGuide.fullwidthAlphabet
        } else if (match[3]) {
            formatGuide = StringFormatGuide.latin
        } else if (match[4]) {
            formatGuide = StringFormatGuide.ambiguous
        }

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

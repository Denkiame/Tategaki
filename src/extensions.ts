import { StringFormatSegment, StringFormatGuide } from './formatSegment'

declare global {
    interface String {
        segmentise(re: RegExp): StringFormatSegment[]
        
        replaceDebug(re: RegExp, str: string): String
    }
}

String.prototype.replaceDebug = function(re, to) {
    let str = String(this)
    if (str !== str.replace(re, to))
        console.log(str, str.replace(re, to))
    return str.replace(re, to)
}

/** Separate the string into parts. Each part continas its `StringFormatGuide` type */
String.prototype.segmentise = function(re) {
    let str = String(this) 
    let segments: StringFormatSegment[] = []
    let index = 0
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
            formatGuide = StringFormatGuide.ambiguous
        } else if (match[2]) {
            formatGuide = StringFormatGuide.cjkPunc
        } else if (match[3]) {
            formatGuide = StringFormatGuide.fullwidthAlphabet
        } else if (match[4]) {
            formatGuide = StringFormatGuide.latin
        } else if (match[5]) {
            formatGuide = StringFormatGuide.kana
        } else { formatGuide = StringFormatGuide.default }

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

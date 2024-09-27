import { StringFormatSegment, StringFormatGuide } from './formatSegment'
import './extensions'

interface Config {
    /** Punctuation Squeeze (PcS) */
    shouldPcS?: boolean
    /** Use customised PcS tagging instead of OpenType feature `vhal`. */
    imitatePcS?: boolean
    /** Transform certain half-width puncuations to full-width ones without using OpenType `fwid`. */
    imitatePcFwid?: boolean

    /* imitateTcyShortWord?: boolean (Deprecated)
     *
     * Rotate words of short length.
     * The original width of a word will be calculated and compared with a threshold value.
     */

    /** Not allow the last line of a paragraph to only contain a single Kanji. */
    shouldAdjustOrphanLine?: boolean

    /** Remove `style`, `width` and `height` attributes. */
    shouldRemoveStyle?: boolean
    /** Convert multiple `\n`s to a customised newline element. */
    convertNewlineCustom?: boolean
}

export class Tategaki {
    rootElement: Element
    config: Config
    document: Document

    constructor(rootElement: Element, config?: Config, __document?: Document ) {
        this.rootElement = rootElement

        const defaultConfig: Config = {
            shouldPcS: true,
            imitatePcS: true,
            imitatePcFwid: true,
            shouldAdjustOrphanLine: false,
            shouldRemoveStyle: false,
            convertNewlineCustom: false
        }

        this.config = Object.assign({}, defaultConfig, config)
        this.document = __document ?? document
    }

    parse() {
        this.rootElement.classList.add('tategaki')
        this.rootElement.classList.add(this.config.imitatePcS ? 'imitate-pcs' : 'opentype-pcs')

        if (this.config.shouldRemoveStyle) { this.removeStyle() }
        this.format(this.rootElement)
        this.tcy()
        this.correctAmbiguous()
        if (this.config.shouldAdjustOrphanLine) { this.insertWordJoiner() }
    }

    // TODO: Check number of characters in a paragraph
    // to skip a paragraph which has only one line.
    private insertWordJoiner() {
        let paras = Array.from(
            this.rootElement.querySelectorAll('p:not(.original-post)'))
        paras.forEach(para => {
            let children = para.children
            if (children.length < 2) { return }
            let lastButOneSpan = children[children.length-2]
            let re = /[\p{Script_Extensions=Han}\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}]{2}$/gu
            if ((lastButOneSpan.classList.length === 0 || lastButOneSpan.classList.contains('kana')) &&
                re.test(lastButOneSpan.innerHTML)) {
                let text = lastButOneSpan.innerHTML
                lastButOneSpan.innerHTML =
                    text.slice(0, -1) + '&NoBreak;' + text.slice(-1, text.length)
            }
        })
    }

    private setElementAttributes(element: Element, segment: StringFormatSegment) {
        switch(segment.formatGuide) {
            case StringFormatGuide.default: {
                element.innerHTML = this.postProcess(segment.content)
                return
            }
            case StringFormatGuide.latin: {
                element.setAttribute('lang', 'en')
                element.setAttribute('title', segment.content)
                break
            }
            case StringFormatGuide.kana: {
                element.setAttribute('lang', 'jp')
                break
            }
            case StringFormatGuide.cjkPunc: {
                if (this.config.shouldPcS) {
                    element.innerHTML = this.squeeze(segment.content)
                }
                break
            }
        }

        element.classList.add(segment.formatGuide)
    }

    private postProcess(text: string): string {
        if (this.config.convertNewlineCustom) {
            text = text.replace(/\n[ \n]*/g, `<br /><span class="indent"></span>`)
        }

        return text
    }

    private format(node: Node, passUntilPara=true) {
        if (node.nodeType === this.document.TEXT_NODE) {
            let text = node.nodeValue
            if (text && !text.trim()) { return }
            text = this.correctPuncs(text!)

            // RegEx for dividing text to seperate <span>s.
            // (AMBIGUOUS)|(CJK_PUNC)|(FULL_WIDTH_ALPHABET)|(LATIN)|(KANA)
            let re = /([\u002f\u2013]+|――|⋯⋯)|([\u203c\u2047-\u2049\u3001\u3002\u301d\u301f\uff01\uff0c\uff1a\uff1b\uff1f\u3008-\u3011\u3014-\u301B\uff08\uff09]+)|([\uff21-\uff3a\uff41-\uff5a]+)|([\p{Script=Latin}0-9\u0020-\u0023\u0025-\u002b\u002c-\u002e\u003a\u003b\u003f\u0040\u005b-\u005d\u005f\u007b\u007d\u00a0\u00a1\u00a7\u00ab\u00b2\u00b3\u00b6\u00b7\u00b9\u00bb-\u00bf\u2010-\u2012\u2018\u2019\u201c\u201d\u2020\u2021\u2026\u2027\u2030\u2032-\u2037\u2039\u203a\u203d-\u203e\u204e\u2057\u2070\u2074-\u2079\u2080-\u2089\u2150\u2153\u2154\u215b-\u215e\u2160-\u217f\u2474-\u249b\u2e18\u2e2e]+)|([\u3041-\u309f\u30a0-\u30fa\u30fc\u30ff]+)/gu

            let segments = text.segmentise(re)  // Define in `external.ts`.

            let parentElement = node.parentElement!
            if (!parentElement.childElementCount && segments.length === 1) {
                this.setElementAttributes(parentElement, segments[0])
            } else {
                segments.forEach(segment => {
                    let subElement = this.document.createElement('span')
                    subElement.innerHTML = segment.content
                    this.setElementAttributes(subElement, segment)

                    parentElement.insertBefore(subElement, node)
                })

                parentElement.removeChild(node)
            }

            return
        }

        if (node.nodeName == 'BR') {
            let parentElement = node.parentElement
            if (parentElement) {
                const br = this.document.createElement('br')
                let span = this.document.createElement('span')
                span.classList.add('indent')

                parentElement.insertBefore(br, node)
                parentElement.insertBefore(span, node)
                parentElement.removeChild(node)
            }

            return
        }

        const IGNORE_TAGS = [ 'BR', 'RUBY', 'PRE', 'CODE', 'IMG' ]
        if (IGNORE_TAGS.indexOf(node.nodeName) !== -1) { return }
        const isPara = node.nodeName === 'P' || node.nodeName === 'BLOCKQUOTE'

        Array.from(node.childNodes).forEach(childNode => {
            this.format(childNode, isPara ? false : passUntilPara)
        })
    }

    private removeStyle(element=this.rootElement) {
        element.removeAttribute('style')
        element.removeAttribute('width')
        element.removeAttribute('height')

        Array.from(element.children, child => {
            this.removeStyle(child)
        })
    }

    /** Raw replacements for specific puncs to be correctly displayed */
    private correctPuncs = (text: string) =>
        text.replace(/──/g, '——')  // U+2500 -> U+2014
            // Go evil with Apple Inc.
            .replace(/……/g, '⋯⋯')
            .replace(/！！|\!\!/g, '‼')
            .replace(/？？|\?\?/g, '⁇')
            .replace(/？！|\?\!/g, '⁈')
            .replace(/！？|\!\?/g, '⁉')

    private squeeze(puncs: string): string {
        return puncs.split('').map(punc => {
            if (/[\u203c\u2047-\u2049\u3001\u3002\uff0c\uff01\uff1a\uff1b\uff1f]/.test(punc)) {
                return `<span class="squeeze-other-punc">${punc}</span>`
            }

            const isOpeningBracket = punc === '\u301d' || punc.charCodeAt(0) % 2 === 0
            const squeezeClass = isOpeningBracket ? 'squeeze-in' : 'squeeze-out'
            let result = `<span class="${squeezeClass}">${punc}</span>`

            if (!this.config.imitatePcS) { return result }

            if (isOpeningBracket) {
               return `<span class="squeeze-in-space"></span>` + result 
            } else {
               return result + `<span class="squeeze-out-space"></span>`
            }
        }).join('')
    }

    // Since not all browser support full-width transformation,
    // it'll do some unicode calc to do that.
    // Delta between codes of characters in full-width is as same 
    // as ASCII, so choose zero as base for calculation
    private transfromToFullWidth(x: string): string {
        const base = '0'.charCodeAt(0)
        const newBase = '\uff10'.charCodeAt(0)
        const current = x.charCodeAt(0)
        return String.fromCharCode(current - base + newBase)
    }

    // Yokogaki in Tategaki (Tategaki-Chyu-Yokogaki)
    private tcy() {
        let elements = Array.from(this.rootElement.getElementsByClassName(StringFormatGuide.latin))
        elements.forEach(element => {
            const text = element.innerHTML.trim()
            if (element.previousElementSibling && 
                element.previousElementSibling.classList.contains(StringFormatGuide.ambiguous) || 
                element.nextElementSibling &&
                element.nextElementSibling.classList.contains(StringFormatGuide.ambiguous)) { return }

            if (/^[\w\p{Script=Latin}]/u.test(text) && 
                element.nodeName != 'I' && 
                element.nodeName != 'EM' &&
                (!element.parentElement ||
                element.parentElement &&
                element.parentElement.nodeName != 'I' &&
                element.parentElement.nodeName != 'EM')) {
                // Words with only one lettre should turn to full-width
                // and lose `latin` class
                if (text.length == 1) {
                    if (this.config.imitatePcFwid) {
                        element.innerHTML = this.transfromToFullWidth(text)
                    } else {
                        element.innerHTML = text
                        element.classList.add('full-width')
                    }
                    element.classList.add('tcy-single')
                    element.classList.remove('latin')
                    element.removeAttribute('lang')
                    element.removeAttribute('title')
                // Abbreviations and numbers no more than 4 digits should
                // turn to full-width
                } else if (/^([A-Z]{3,10}|\d{4,10})$/.test(text))  {
                    if (this.config.imitatePcFwid) {
                        element.innerHTML = Array.from(text, x => 
                            this.transfromToFullWidth(x)).join('')
                    } else {
                        element.innerHTML = text
                        element.classList.add('full-width')
                    }
                    element.classList.add('tcy-single')
                    element.classList.remove('latin')
                    element.removeAttribute('lang')
                    element.removeAttribute('title')
                } else if (/^[A-Z]{2}$|^\d{2,3}$/.test(text)) {
                    element.innerHTML = text
                    element.classList.remove('latin')
                    element.removeAttribute('lang')
                    element.removeAttribute('title')
                    element.classList.add('tcy')
                } else if (/^\d{1,3}%$/.test(text)) {  // Percentage
                    const matches = /^(\d{1,3})%$/.exec(text)!
                    let newElement = this.document.createElement('span')
                    let digit = matches[1]
                    if (digit.length === 1) {
                        digit = this.transfromToFullWidth(digit)
                    }
                    newElement.innerHTML = `<span ${digit.length == 1 ? '' : 'class="tcy"'}>${digit}</span>&NoBreak;％`
                    element.replaceWith(newElement)
                }
            }
        })
    }

    private correctAmbiguous() {
        Array.from(this.rootElement.getElementsByClassName(StringFormatGuide.ambiguous), element => {
            if (element.innerHTML === '――') {
                element.classList.add('aalt-on')
                element.classList.add(StringFormatGuide.cjkPunc)
                return
            }

            if (element.innerHTML === '⋯⋯') {
                element.classList.add(StringFormatGuide.cjkPunc)
                return
            }

            if (!element.previousElementSibling || !element.nextElementSibling) {
                element.classList.add(StringFormatGuide.latin)
                return
            }

            if (element.previousElementSibling.classList.contains(StringFormatGuide.latin) &&
                element.nextElementSibling.classList.contains(StringFormatGuide.latin)) {
                element.classList.add(StringFormatGuide.latin)
                return
            }

            switch(element.innerHTML) {
                case '/': {
                    element.innerHTML = '／'
                    break
                }
                case '–': {
                    element.innerHTML = '―'
                    break
                }
            }
        })
    }
}

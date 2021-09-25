import { StringFormatSegment, StringFormatGuide } from './formatSegment'
import './extensions'

export class Tategaki {
    rootElement: Element

    shouldPcS: boolean
    imitatePcS: boolean
    imitateTransfromToFullWidth: boolean

    private setElementAttributes(element: Element, segment: StringFormatSegment) {
        switch(segment.formatGuide) {
            case StringFormatGuide.default: {
                element.innerHTML =  this.postProcess(segment.content)
                return
            }
            case StringFormatGuide.latin: {
                element.setAttribute('lang', 'en')
                break
            }
            case StringFormatGuide.cjkPunc: {
                if (this.shouldPcS) {
                    element.innerHTML = this.squeeze(segment.content)
                }
                break
            }
        }

        element.classList.add(segment.formatGuide)
    }

    private postProcess(text: string): string {
        return text
            .replace(/\n[ \n]*/g, `<br /><span class="indent"></span>`)
    }

    private format(node: Node, passUntilPara: boolean=true) {
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.nodeValue!
            if (!text.trim()) { return }
            text = this.correctPuncs(text)

            // (AMBIGUOUS)|(CJK_PUNC)|(FULL_WIDTH_ALPHABET)|(LATIN)|(KANA)
            let re = /([\u002f\u2013]+|――)|([\u3001\u3002\u301d\u301f\uff01\uff0c\uff1a\uff1b\uff1f\u3008-\u3011\u3014-\u301B\uff08\uff09]+)|([\uff21-\uff3a\uff41-\uff5a]+)|([\p{Script=Latin}0-9\u0020-\u0023\u0025-\u002b\u002c-\u002e\u003a\u003b\u003f\u0040\u005b-\u005d\u005f\u007b\u007d\u00a1\u00a7\u00ab\u00b2\u00b3\u00b6\u00b7\u00b9\u00bb-\u00bf\u2010-\u2012\u2018\u2019\u201c\u201d\u2020\u2021\u2026\u2027\u2030\u2032-\u2037\u2039\u203a\u203c-\u203e\u2047-\u2049\u204e\u2057\u2070\u2074-\u2079\u2080-\u2089\u2150\u2153\u2154\u215b-\u215e\u2160-\u217f\u2474-\u249b\u2e18\u2e2e]+)|([\u3041-\u309f\u30a0-\u30fa\u30fc\u30ff]+)/gu

            let segments = text.segmentise(re)

            let parentElement = node.parentElement
            if (!parentElement.childElementCount && segments.length === 1) {
                this.setElementAttributes(parentElement, segments[0])
            } else {
                segments.forEach(segment => {
                    let subElement = document.createElement('span')
                    subElement.innerText = segment.content
                    this.setElementAttributes(subElement, segment)

                    parentElement.insertBefore(subElement, node)
                })

                parentElement.removeChild(node)
            }

            return
        }

        if (node.nodeName === 'BR') { return }
        const isPara = node.nodeName === 'P' || node.nodeName === 'BLOCKQUOTE'

        let childNodes = Array.from(node.childNodes)
        childNodes.forEach(childNode => {
            this.format(childNode, isPara ? false : passUntilPara)
        })
    }

    private correctPuncs(text: string): string {
        return text
            .replace(/——|──/g, '――')
            .replace(/……/g, '⋯⋯')
    }

    private squeeze(puncs: string): string {
        return puncs.split('').map(punc => {
            if (/[\u3001\u3002\uff0c\uff01\uff1a\uff1b\uff1f]/.test(punc)) {
                return `<span class="squeeze-other-punc">${punc}</span>`
            }

            const isOpeningBracket = punc === '\u301d' || punc.charCodeAt(0) % 2 === 0
            const squeezeClass = isOpeningBracket ? 'squeeze-in' : 'squeeze-out'
            let result = `<span class="${squeezeClass}">${punc}</span>`

            if (!this.imitatePcS) { return result }

            if (isOpeningBracket) {
               return `<span class="squeeze-in-space"> </span>` + result 
            } else {
               return result + `<span class="squeeze-out-space"> </span>`
            }
        }).join('')
    }

    private transfromToFullWidth(x: string): string {
        const base = '0'.charCodeAt(0)
        const newBase = '\uff10'.charCodeAt(0)
        const current = x.charCodeAt(0)
        return String.fromCharCode(current - base + newBase)
    }

    private tcy(imitateTransfromToFullWidth: boolean=false) {
        let documentElement = document.documentElement
        let fontSizeRaw = window.getComputedStyle(documentElement).fontSize.match(/(\d+)px/)[1]
        let fontSize = parseInt(fontSizeRaw)

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
                element.parentElement.nodeName != 'I' &&
                element.parentElement.nodeName != 'EM') {
                if (text.length == 1) {
                    if (imitateTransfromToFullWidth) {
                        element.innerHTML = this.transfromToFullWidth(text)
                    } else {
                        element.innerHTML = text
                        element.classList.add('to-fullwidth')
                    }
                    element.classList.remove('latin')
                    element.removeAttribute('lang')
                } else if (/^([A-Z]{3,10}|\d{4,10})$/.test(text))  {
                    if (imitateTransfromToFullWidth) {
                        element.innerHTML = Array.from(text, x => 
                            this.transfromToFullWidth(x)).join('')
                    } else {
                        element.innerHTML = text
                        element.classList.add('to-fullwidth')
                    }
                    element.classList.remove('latin')
                    element.removeAttribute('lang')
                } else if (/^[A-Z]{2}$|^\d{2,3}$/.test(text)) {
                    element.innerHTML = text
                    element.classList.remove('latin')
                    element.removeAttribute('lang')
                    element.classList.add('tcy')
                } else if (/^\d{1,3}%$/.test(text)) {
                    const matches = /^(\d{1,3})%$/.exec(text)
                    let newElement = document.createElement('span')
                    let digit = matches[1]
                    if (digit.length === 1) {
                        digit = this.transfromToFullWidth(digit)
                    }
                    newElement.innerHTML = `<span ${digit.length == 1 ? '' : 'class="tcy"'}>${digit}</span>&#8288;％`
                    element.replaceWith(newElement)
                } else {
                    let threshold = fontSize
                    if (element.innerHTML != text) {
                        // Need adjusting
                        threshold *= 1.5
                    } else {
                        threshold *= 1.333
                    }

                    if (element.getBoundingClientRect().height <= threshold) {
                        element.innerHTML = text
                        element.classList.add('tcy')
                    }
                }
            }
        })
    }

    private correctAmbiguous() {
        Array.from(document.getElementsByClassName(StringFormatGuide.ambiguous), element => {
            if (!element.previousElementSibling || !element.nextElementSibling) {
                element.classList.add('latin')
                return
            }

            if (element.previousElementSibling.classList.contains(StringFormatGuide.latin) &&
                element.nextElementSibling.classList.contains(StringFormatGuide.latin)) {
                element.classList.add('latin')
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
                case '――': {
                    element.classList.add('aalt-on')
                    break
                }
            }
        })

    }

    parse() {
        this.rootElement.classList.add('tategaki')
        this.rootElement.classList.add(this.imitatePcS ? 'imitate-pcs' : 'opentype-pcs')

        this.format(this.rootElement)

        this.tcy(this.imitateTransfromToFullWidth)

        this.correctAmbiguous()
    }

    constructor(rootElement: HTMLElement, 
                shouldPcS: boolean=true, imitatePcS: boolean=true, 
                imitateTransfromToFullWidth: boolean=true) {
        this.rootElement = rootElement
        this.shouldPcS = shouldPcS
        this.imitatePcS = imitatePcS
        this.imitateTransfromToFullWidth = imitateTransfromToFullWidth
    }
}

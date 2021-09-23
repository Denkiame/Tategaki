import { StringFormatSegment, StringFormatGuide } from './formatSegment'
import './extensions'

export class Tategaki {
    rootElement: Element

    private setElementAttributes(element: Element, segment: StringFormatSegment) {
        switch(segment.formatGuide) {
            case StringFormatGuide.default: { return }
            case StringFormatGuide.latin: {
                element.setAttribute('lang', 'en')
                break
            }
            case StringFormatGuide.cjkPunc: {
                element.innerHTML = this.squeeze(segment.content)
                break
            }
        }

        element.classList.add(segment.formatGuide)
    }

    private format(node: Node, passUntilPara: boolean=true) {
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.nodeValue!
            if (!text.trim()) { return }
            text = this.correctPuncs(text)

            // (CJK_PUNC)|(LATIN)|(AMBIGUOUS)
            let re = /([\u3001\u3002\u301d\u301f\uff01\uff0c\uff1a\uff1b\uff1f\u3008-\u3011\u3014-\u301B\uff08\uff09]+)|([\p{Script=Latin}0-9\u0020-\u0023\u0025-\u002a\u002c-\u002e\u003a\u003b\u003f\u0040\u005b-\u005d\u005f\u007b\u007d\u00a1\u00a7\u00ab\u00b2\u00b3\u00b6\u00b7\u00b9\u00bb-\u00bf\u2010-\u2013\u2018\u2019\u201c\u201d\u2020\u2021\u2026\u2027\u2030\u2032-\u2037\u2039\u203a\u203c-\u203e\u2047-\u2049\u204e\u2057\u2070\u2074-\u2079\u2080-\u2089\u2150\u2153\u2154\u215b-\u215e\u2160-\u217f\u2474-\u249b\u2e18\u2e2e]+)|([\u002f]+)/gu

            let segments = text.segmentise(re)

            let parentElement = node.parentElement
            if (segments.length === 1) {
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

            if (isOpeningBracket) {
               return `<span class="squeeze-in-space"> </span>` + result 
            } else {
               return result + `<span class="squeeze-out-space"> </span>`
            }
        }).join('')
    }

    parse() {
        this.format(this.rootElement)
    }

    constructor(rootElement: HTMLElement) {
        this.rootElement = rootElement
    }
}

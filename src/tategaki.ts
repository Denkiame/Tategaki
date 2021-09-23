import { Unit, ParaUnit, StyledUnit, StringUnit } from './unit'
import './extensions'

export class Tategaki {
    rootElement: HTMLElement
    rootUnit!: Unit

    private buildUnit(node: Node, passUntilPara: boolean=true): Unit | null {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue!
            if (!text.trim()) { return null }

            // /(CJK_PUNC)|(LATIN)/
            let re = /([\u3001\u3002\u301d\u301f\uff01\uff0c\uff1a\uff1b\uff1f\u3008-\u3011\u3014-\u301B\uff08\uff09]+)|([\p{Script=Latin}0-9\u0020-\u0023\u0025-\u002a\u002c-\u002f\u003a\u003b\u003f\u0040\u005b-\u005d\u005f\u007b\u007d\u00a1\u00a7\u00ab\u00b2\u00b3\u00b6\u00b7\u00b9\u00bb-\u00bf\u2010-\u2013\u2018\u2019\u201c\u201d\u2020\u2021\u2026\u2027\u2030\u2032-\u2037\u2039\u203a\u203c-\u203e\u2047-\u2049\u204e\u2057\u2070\u2074-\u2079\u2080-\u2089\u2150\u2153\u2154\u215b-\u215e\u2160-\u217f\u2474-\u249b\u2e18\u2e2e]+)/gu

            let segments = text.segmentise(re)

            console.log(text, segments)
            
            return new StringUnit(node.nodeValue!)
        } else if (node.nodeName === 'P' || node.nodeName === 'BLOCKQUOTE') {
            let unit = new ParaUnit(node.nodeName)
            unit.isBasePara = passUntilPara

            Array.from(node.childNodes, childNode => {
                let child = this.buildUnit(childNode, false)
                
                if (child) { unit.add(child) }
            })
            
            return unit
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            let unit = new StyledUnit(node.nodeName)

            Array.from(node.childNodes, childNode => {
                let child = this.buildUnit(childNode, passUntilPara)

                if (child) { unit.add(child) }
            })

            return unit
        }

        throw new Error('Unsupported Node')
    }

    render(unit: Unit=this.rootUnit): HTMLElement {
        let element: HTMLElement

        if (unit instanceof StringUnit) {
            element = document.createElement('span')
            element.classList.add(unit.formatGuide)
            element.innerText = unit.content
        } else {
            element = document.createElement(unit.nodeName)
            unit.children!.forEach(child => {
                element.appendChild(this.render(child))
            })
        }

        return element
    } 

    parse() {
        this.rootUnit = this.buildUnit(this.rootElement)!
        // console.log(this.rootUnit)

        let newArticle = this.render(this.rootUnit)
        console.log(newArticle)
    }

    constructor(rootElement: HTMLElement) {
        this.rootElement = rootElement
    }
}

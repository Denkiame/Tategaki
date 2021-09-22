interface Unit {
    readonly nodeName?: string
    children?: Unit[]

    add?(unit: Unit): void
}

// <p> or <blockquote>
class ParaUnit implements Unit {
    nodeName: string
    children: Unit[] = []
    isBasePara: boolean = false

    add(unit: Unit) { this.children.push(unit) }

    constructor(nodeName: string = 'P') {
        this.nodeName = nodeName
    }
}

class StringUnit implements Unit {
    nodeName = '#text'
    content: string
    isLatin: boolean = true

    constructor(content: string) {
        this.content = content
    }
}

// <em>, <a>, etc.
class StyledUnit implements Unit {
    nodeName: string
    children: Unit[] = []

    add(unit: Unit) { this.children.push(unit) }
    
    constructor(nodeName: string) {
        this.nodeName = nodeName
    }
}

class RootUnit implements Unit {
    children: Unit[] = []

    add(unit: Unit) { this.children.push(unit) }
}

class Tategaki {
    rootElement: HTMLElement
    rootUnit?: RootUnit

    private buildUnit(node: Node, passUntilPara: boolean=true): Unit | null {
        if (node.nodeType === Node.TEXT_NODE) {
            if (!node.nodeValue!.trim()) { return null }
            
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

    public parse() {
        console.log(this.buildUnit(this.rootElement))
    }

    constructor(rootElement: HTMLElement) {
        this.rootElement = rootElement
    }
}

export interface Unit {
    readonly nodeName: string
    children?: Unit[]

    add?(unit: Unit): void
}

// <p> or <blockquote>
export class ParaUnit implements Unit {
    nodeName: string
    children: Unit[] = []
    isBasePara: boolean = false

    add(unit: Unit) { this.children.push(unit) }

    constructor(nodeName: string = 'P') {
        this.nodeName = nodeName
    }
}

export class StringUnit implements Unit {
    nodeName = '#text'
    content: string
    formatGuide = StringFormatGuide.default

    constructor(content: string) {
        this.content = content
    }
}

// <em>, <a>, etc.
export class StyledUnit implements Unit {
    nodeName: string
    children: Unit[] = []

    add(unit: Unit) { this.children.push(unit) }
    
    constructor(nodeName: string) {
        this.nodeName = nodeName
    }
}

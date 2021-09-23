import { StringFormatSegment } from './formatSegment'

export interface Unit {
    readonly nodeName: string
    children?: Unit[]
    attributes?: NamedNodeMap

    add?(unit: Unit): void
}

// <p> or <blockquote>
export class ParaUnit implements Unit {
    nodeName: string
    children: Unit[] = []
    attributes: NamedNodeMap

    isBasePara: boolean = false

    add(unit: Unit) { this.children.push(unit) }

    constructor(nodeName: string = 'P', attributes: NamedNodeMap) {
        this.nodeName = nodeName
        this.attributes = attributes
    }
}

export class StringUnit implements Unit {
    nodeName = '#text'
    segments: StringFormatSegment[]

    constructor(segments: StringFormatSegment[]) {
        this.segments = segments
    }
}

// <em>, <a>, etc.
export class StyledUnit implements Unit {
    nodeName: string
    children: Unit[] = []
    attributes: NamedNodeMap

    add(unit: Unit) { this.children.push(unit) }
    
    constructor(nodeName: string, attributes: NamedNodeMap) {
        this.nodeName = nodeName
        this.attributes = attributes
    }
}

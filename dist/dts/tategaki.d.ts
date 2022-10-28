import './extensions';
interface Config {
    shouldPcS?: boolean;
    imitatePcS?: boolean;
    imitatePcFwid?: boolean;
    shouldAdjustOrphanLine?: boolean;
    shouldRemoveStyle?: boolean;
    convertNewlineCustom?: boolean;
}
export declare class Tategaki {
    rootElement: Element;
    config: Config;
    document: Document;
    constructor(rootElement: Element, config?: Config, __document?: Document);
    parse(): void;
    private insertWordJoiner;
    private setElementAttributes;
    private postProcess;
    private format;
    private removeStyle;
    private correctPuncs;
    private squeeze;
    private transfromToFullWidth;
    private tcy;
    private correctAmbiguous;
}
export {};

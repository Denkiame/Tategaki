import './extensions';
interface Config {
    shouldPcS?: boolean;
    imitatePcS?: boolean;
    imitateTransfromToFullWidth?: boolean;
    shouldRemoveStyle?: boolean;
}
export declare class Tategaki {
    rootElement: Element;
    config: Config;
    constructor(rootElement: Element, config?: Config);
    parse(): void;
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

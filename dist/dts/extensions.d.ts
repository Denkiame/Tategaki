import { StringFormatSegment } from './formatSegment';
declare global {
    interface String {
        segmentise(re: RegExp): StringFormatSegment[];
        replaceDebug(re: RegExp, str: string): String;
    }
}

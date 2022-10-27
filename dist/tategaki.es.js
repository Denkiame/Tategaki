var StringFormatGuide;
(function (StringFormatGuide) {
    StringFormatGuide["default"] = "default";
    StringFormatGuide["cjkPunc"] = "cjk-punc";
    StringFormatGuide["fullwidthAlphabet"] = "fullwidth-alphabet";
    StringFormatGuide["latin"] = "latin";
    StringFormatGuide["kana"] = "kana";
    StringFormatGuide["ambiguous"] = "ambiguous";
})(StringFormatGuide || (StringFormatGuide = {}));

String.prototype.segmentise = function (re) {
    let str = String(this);
    let segments = [];
    let index = 0;
    let match;
    while (match = re.exec(str)) {
        if (match.index > index) {
            segments.push({
                content: str.substring(index, match.index),
                formatGuide: StringFormatGuide.default
            });
        }
        let formatGuide;
        if (match[1]) {
            formatGuide = StringFormatGuide.ambiguous;
        }
        else if (match[2]) {
            formatGuide = StringFormatGuide.cjkPunc;
        }
        else if (match[3]) {
            formatGuide = StringFormatGuide.fullwidthAlphabet;
        }
        else if (match[4]) {
            formatGuide = StringFormatGuide.latin;
        }
        else if (match[5]) {
            formatGuide = StringFormatGuide.kana;
        }
        else {
            formatGuide = StringFormatGuide.default;
        }
        segments.push({
            content: match[0],
            formatGuide: formatGuide
        });
        index = match.index + match[0].length;
    }
    if (str.length > index) {
        segments.push({
            content: str.substring(index),
            formatGuide: StringFormatGuide.default
        });
    }
    return segments;
};

class Tategaki {
    constructor(rootElement, config) {
        this.correctPuncs = (text) => text.replace(/──/g, '――')
            .replace(/—/g, '―')
            .replace(/……/g, '⋯⋯')
            .replace(/！！|\!\!/g, '‼')
            .replace(/？？|\?\?/g, '⁇')
            .replace(/？！|\?\!/g, '⁈')
            .replace(/！？|\!\?/g, '⁉');
        this.rootElement = rootElement;
        const defaultConfig = {
            shouldPcS: true,
            imitatePcS: true,
            imitatePcFwid: true,
            imitateTcyShortWord: false,
            shouldAdjustOrphanLine: false,
            shouldRemoveStyle: false,
            convertNewlineCustom: false
        };
        this.config = Object.assign({}, defaultConfig, config);
    }
    parse() {
        this.rootElement.classList.add('tategaki');
        this.rootElement.classList.add(this.config.imitatePcS ? 'imitate-pcs' : 'opentype-pcs');
        if (this.config.shouldRemoveStyle) {
            this.removeStyle();
        }
        this.format(this.rootElement);
        this.tcy();
        this.correctAmbiguous();
        if (this.config.shouldAdjustOrphanLine) {
            this.insertWordJoiner();
        }
    }
    insertWordJoiner() {
        let paras = Array.from(this.rootElement.querySelectorAll('p:not(.original-post)'));
        paras.forEach(para => {
            let children = para.children;
            if (children.length < 2) {
                return;
            }
            let lastButOneSpan = children[children.length - 2];
            let re = /[\p{Script_Extensions=Han}\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}]{2}$/gu;
            if ((lastButOneSpan.classList.length === 0 || lastButOneSpan.classList.contains('kana')) &&
                re.test(lastButOneSpan.innerHTML)) {
                let text = lastButOneSpan.innerHTML;
                lastButOneSpan.innerHTML =
                    text.slice(0, -1) + '&NoBreak;' + text.slice(-1, text.length);
            }
        });
    }
    setElementAttributes(element, segment) {
        switch (segment.formatGuide) {
            case StringFormatGuide.default: {
                element.innerHTML = this.postProcess(segment.content);
                return;
            }
            case StringFormatGuide.latin: {
                element.setAttribute('lang', 'en');
                element.setAttribute('title', segment.content);
                break;
            }
            case StringFormatGuide.kana: {
                element.setAttribute('lang', 'jp');
                break;
            }
            case StringFormatGuide.cjkPunc: {
                if (this.config.shouldPcS) {
                    element.innerHTML = this.squeeze(segment.content);
                }
                break;
            }
        }
        element.classList.add(segment.formatGuide);
    }
    postProcess(text) {
        if (this.config.convertNewlineCustom) {
            text = text.replace(/\n[ \n]*/g, `<br /><span class="indent"></span>`);
        }
        return text;
    }
    format(node, passUntilPara = true) {
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.nodeValue;
            if (text && !text.trim()) {
                return;
            }
            text = this.correctPuncs(text);
            let re = /([\u002f\u2013]+|――)|([\u203c\u2047-\u2049\u3001\u3002\u301d\u301f\uff01\uff0c\uff1a\uff1b\uff1f\u3008-\u3011\u3014-\u301B\uff08\uff09]+)|([\uff21-\uff3a\uff41-\uff5a]+)|([\p{Script=Latin}0-9\u0020-\u0023\u0025-\u002b\u002c-\u002e\u003a\u003b\u003f\u0040\u005b-\u005d\u005f\u007b\u007d\u00a0\u00a1\u00a7\u00ab\u00b2\u00b3\u00b6\u00b7\u00b9\u00bb-\u00bf\u2010-\u2012\u2018\u2019\u201c\u201d\u2020\u2021\u2026\u2027\u2030\u2032-\u2037\u2039\u203a\u203d-\u203e\u204e\u2057\u2070\u2074-\u2079\u2080-\u2089\u2150\u2153\u2154\u215b-\u215e\u2160-\u217f\u2474-\u249b\u2e18\u2e2e]+)|([\u3041-\u309f\u30a0-\u30fa\u30fc\u30ff]+)/gu;
            let segments = text.segmentise(re);
            let parentElement = node.parentElement;
            if (!parentElement.childElementCount && segments.length === 1) {
                this.setElementAttributes(parentElement, segments[0]);
            }
            else {
                segments.forEach(segment => {
                    let subElement = document.createElement('span');
                    subElement.innerText = segment.content;
                    this.setElementAttributes(subElement, segment);
                    parentElement.insertBefore(subElement, node);
                });
                parentElement.removeChild(node);
            }
            return;
        }
        if (node.nodeName == 'BR') {
            let parentElement = node.parentElement;
            if (parentElement) {
                const br = document.createElement('br');
                let span = document.createElement('span');
                span.classList.add('indent');
                parentElement.insertBefore(br, node);
                parentElement.insertBefore(span, node);
                parentElement.removeChild(node);
            }
            return;
        }
        const IGNORE_TAGS = ['BR', 'RUBY', 'PRE', 'CODE', 'IMG'];
        if (IGNORE_TAGS.indexOf(node.nodeName) !== -1) {
            return;
        }
        const isPara = node.nodeName === 'P' || node.nodeName === 'BLOCKQUOTE';
        Array.from(node.childNodes).forEach(childNode => {
            this.format(childNode, isPara ? false : passUntilPara);
        });
    }
    removeStyle(element = this.rootElement) {
        element.removeAttribute('style');
        element.removeAttribute('width');
        element.removeAttribute('height');
        Array.from(element.children, child => {
            this.removeStyle(child);
        });
    }
    squeeze(puncs) {
        return puncs.split('').map(punc => {
            if (/[\u203c\u2047-\u2049\u3001\u3002\uff0c\uff01\uff1a\uff1b\uff1f]/.test(punc)) {
                return `<span class="squeeze-other-punc">${punc}</span>`;
            }
            const isOpeningBracket = punc === '\u301d' || punc.charCodeAt(0) % 2 === 0;
            const squeezeClass = isOpeningBracket ? 'squeeze-in' : 'squeeze-out';
            let result = `<span class="${squeezeClass}">${punc}</span>`;
            if (!this.config.imitatePcS) {
                return result;
            }
            if (isOpeningBracket) {
                return `<span class="squeeze-in-space"></span>` + result;
            }
            else {
                return result + `<span class="squeeze-out-space"></span>`;
            }
        }).join('');
    }
    transfromToFullWidth(x) {
        const base = '0'.charCodeAt(0);
        const newBase = '\uff10'.charCodeAt(0);
        const current = x.charCodeAt(0);
        return String.fromCharCode(current - base + newBase);
    }
    tcy() {
        let documentElement = document.documentElement;
        let fontSizeMatch = window.getComputedStyle(documentElement).fontSize.match(/(\d+)px/);
        let fontSize = fontSizeMatch ? parseInt(fontSizeMatch[1]) : 0;
        let elements = Array.from(this.rootElement.getElementsByClassName(StringFormatGuide.latin));
        elements.forEach(element => {
            const text = element.innerHTML.trim();
            if (element.previousElementSibling &&
                element.previousElementSibling.classList.contains(StringFormatGuide.ambiguous) ||
                element.nextElementSibling &&
                    element.nextElementSibling.classList.contains(StringFormatGuide.ambiguous)) {
                return;
            }
            if (/^[\w\p{Script=Latin}]/u.test(text) &&
                element.nodeName != 'I' &&
                element.nodeName != 'EM' &&
                (!element.parentElement ||
                    element.parentElement &&
                        element.parentElement.nodeName != 'I' &&
                        element.parentElement.nodeName != 'EM')) {
                if (text.length == 1) {
                    if (this.config.imitatePcFwid) {
                        element.innerHTML = this.transfromToFullWidth(text);
                    }
                    else {
                        element.innerHTML = text;
                        element.classList.add('full-width');
                    }
                    element.classList.add('tcy-single');
                    element.classList.remove('latin');
                    element.removeAttribute('lang');
                    element.removeAttribute('title');
                }
                else if (/^([A-Z]{3,10}|\d{4,10})$/.test(text)) {
                    if (this.config.imitatePcFwid) {
                        element.innerHTML = Array.from(text, x => this.transfromToFullWidth(x)).join('');
                    }
                    else {
                        element.innerHTML = text;
                        element.classList.add('full-width');
                    }
                    element.classList.add('tcy-single');
                    element.classList.remove('latin');
                    element.removeAttribute('lang');
                    element.removeAttribute('title');
                }
                else if (/^[A-Z]{2}$|^\d{2,3}$/.test(text)) {
                    element.innerHTML = text;
                    element.classList.remove('latin');
                    element.removeAttribute('lang');
                    element.removeAttribute('title');
                    element.classList.add('tcy');
                }
                else if (/^\d{1,3}%$/.test(text)) {
                    const matches = /^(\d{1,3})%$/.exec(text);
                    let newElement = document.createElement('span');
                    let digit = matches[1];
                    if (digit.length === 1) {
                        digit = this.transfromToFullWidth(digit);
                    }
                    newElement.innerHTML = `<span ${digit.length == 1 ? '' : 'class="tcy"'}>${digit}</span>&NoBreak;％`;
                    element.replaceWith(newElement);
                }
                else {
                    if (this.config.imitateTcyShortWord) {
                        let threshold = fontSize;
                        if (element.innerHTML != text) {
                            threshold *= 1.5;
                        }
                        else {
                            threshold *= 1.333;
                        }
                        if (element.getBoundingClientRect().height <= threshold) {
                            element.innerHTML = text;
                            element.classList.add('tcy');
                        }
                    }
                }
            }
        });
    }
    correctAmbiguous() {
        Array.from(document.getElementsByClassName(StringFormatGuide.ambiguous), element => {
            if (element.innerHTML === '――') {
                element.classList.add('aalt-on');
                element.classList.add(StringFormatGuide.cjkPunc);
                return;
            }
            if (!element.previousElementSibling || !element.nextElementSibling) {
                element.classList.add(StringFormatGuide.latin);
                return;
            }
            if (element.previousElementSibling.classList.contains(StringFormatGuide.latin) &&
                element.nextElementSibling.classList.contains(StringFormatGuide.latin)) {
                element.classList.add(StringFormatGuide.latin);
                return;
            }
            switch (element.innerHTML) {
                case '/': {
                    element.innerHTML = '／';
                    break;
                }
                case '–': {
                    element.innerHTML = '―';
                    break;
                }
            }
        });
    }
}

export { Tategaki };

// <p> or <blockquote>
var ParaUnit = /** @class */ (function () {
    function ParaUnit(nodeName) {
        if (nodeName === void 0) { nodeName = 'P'; }
        this.children = [];
        this.isBasePara = false;
        this.nodeName = nodeName;
    }
    ParaUnit.prototype.add = function (unit) { this.children.push(unit); };
    return ParaUnit;
}());
var StringUnit = /** @class */ (function () {
    function StringUnit(content) {
        this.nodeName = '#text';
        this.isLatin = true;
        this.content = content;
    }
    return StringUnit;
}());
// <em>, <a>, etc.
var StyledUnit = /** @class */ (function () {
    function StyledUnit(nodeName) {
        this.children = [];
        this.nodeName = nodeName;
    }
    StyledUnit.prototype.add = function (unit) { this.children.push(unit); };
    return StyledUnit;
}());
var RootUnit = /** @class */ (function () {
    function RootUnit() {
        this.children = [];
    }
    RootUnit.prototype.add = function (unit) { this.children.push(unit); };
    return RootUnit;
}());
var Tategaki = /** @class */ (function () {
    function Tategaki(rootElement) {
        this.rootElement = rootElement;
    }
    Tategaki.prototype.buildUnit = function (node, passUntilPara) {
        var _this = this;
        if (passUntilPara === void 0) { passUntilPara = true; }
        if (node.nodeType === Node.TEXT_NODE) {
            if (!node.nodeValue.trim()) {
                return null;
            }
            return new StringUnit(node.nodeValue);
        }
        else if (node.nodeName === 'P' || node.nodeName === 'BLOCKQUOTE') {
            var unit_1 = new ParaUnit(node.nodeName);
            unit_1.isBasePara = passUntilPara;
            Array.from(node.childNodes, function (childNode) {
                var child = _this.buildUnit(childNode, false);
                if (child) {
                    unit_1.add(child);
                }
            });
            return unit_1;
        }
        else if (node.nodeType === Node.ELEMENT_NODE) {
            var unit_2 = new StyledUnit(node.nodeName);
            Array.from(node.childNodes, function (childNode) {
                var child = _this.buildUnit(childNode, passUntilPara);
                if (child) {
                    unit_2.add(child);
                }
            });
            return unit_2;
        }
        throw new Error('Unsupported Node');
    };
    Tategaki.prototype.parse = function () {
        console.log(this.buildUnit(this.rootElement));
    };
    return Tategaki;
}());

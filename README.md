# Tategaki

**Tategaki** translates HTML elements to vertical writing.

## Usage

### TypeScript Module

Install with `npm install tategaki`.

1. Import `Tategaki`:

```TypeScript
import { Tategaki } from 'tategaki'
```

2. Link an `HTMLElement` and parse. Suppose the root `article` is an `Element`:

```TypeScript
// Example (default configuration)
let tategaki = new Tategaki(article, {
    shouldPcS: true,
    imitatePcS: true,
    imitatePcFwid: true,
    imitateTcyShortWord: false,
    shouldRemoveStyle: false,
    convertNewlineCustom: false
})
tategaki.parse()

// Configuration explained
interface Config {
    /** Punctuation Squeeze (PcS) */
    shouldPcS?: boolean
    /** Use customised PcS tagging instead of OpenType feature `vhal`. */
    imitatePcS?: boolean
    /** Transform certain half-width puncuations to full-width ones without using OpenType `fwid`. */
    imitatePcFwid?: boolean

    /**
     * Rotate words of short length.
     * The original width of a word will be calculated and compared with a threshold value.
     * (Buggy in WebKit on macOS Ventura Beta)
     */
    imitateTcyShortWord?: boolean

    /** Remove `style`, `width` and `height` attributes. */
    shouldRemoveStyle?: boolean
    /** Convert multiple `\n`s to a customised newline element. */
    convertNewlineCustom?: boolean
}
```

- A `tategaki` class will be attached to the root element.
- It'll split the element into several types of `<span>` (`cjk`, `latin`, etc. ) so that the style can be further customised.
- Punctuation squeezing (PcS) will be **automatically applied**. You can turn it off when initialising (`new Tategaki(article, false)`).
- You can import `tategaki.css` (listed below) for styling.

### Embedded in HTML

- In `<head>`:

```HTML
<link rel="stylesheet" href="https://unpkg.com/tategaki/assets/tategaki.css" />
```
- At the bottom of `<body>`:

```HTML
<script src="https://unpkg.com/tategaki/dist/tategaki.min.js"></script>
```

## Recommended Style

### Text

```CSS
.tategaki {
    writing-mode: vertical-rl;

    text-align: justify;
}

.latin {
    -webkit-hyphens: auto;
    hyphens: auto;

    -webkit-hyphenate-limit-before: 3;
    -webkit-hyphenate-limit-after: 2;
    -ms-hyphenate-limit-chars: 6 3 2;
    hyphenate-limit-chars: 6 3 2;
}

.kana {
    font-feature-settings: "vpal";
}
```

### Tategaki-Chyu-Yokogaki

```CSS
.tcy {
    -webkit-text-combine: horizontal;
    -ms-text-combine-horizontal: all;
    text-combine-upright: all;
    position: static !important;
}

.full-width {
    font-feature-settings: "fwid";
    text-transform: full-width;
}
```

### Punctuation Adjustment

```CSS
/* Correct CJK dashes */
.aalt-on {
    font-feature-settings: "aalt";
}

/* Imitate PcS (Add space and strink height)  */
.imitate-pcs .squeeze-out {
    letter-spacing: -0.5rem;
}

.imitate-pcs .squeeze-in {
    margin-top: -0.5rem;
}

.squeeze-in + .squeeze-in-space {
    display: none;
}

.squeeze-other-punc + .squeeze-in-space {
    display: none;
}

.squeeze-out-space {
    display: none;
}

.squeeze-out-space:last-child {
    display: inline;
}

/* PcS: Using OpenType `vhal` */
.opentype-pcs .squeeze-other-punc + .squeeze-in {
    font-feature-settings: "vhal";
}

.opentype-pcs .squeeze-in + .squeeze-in {
    font-feature-settings: "vhal";
}

.opentype-pcs .squeeze-out {
    font-feature-settings: "vhal";
}

.opentype-pcs .squeeze-out:last-child {
    font-feature-settings: "vhal" 0;
}

.safari .squeeze-other-punc {
    font-feature-settings: 'locl';
}
```

### Correct Punctuations for `zh-cn`

```css
.safari .squeeze-other-punc {
    font-feature-settings: 'locl';
}

/* Disable glyph replacement in context for Firefox and Chrome */
.firefox .squeeze-other-punc:last-child {
    margin-bottom: -1rem;
}

.chrome .squeeze-other-punc:only-child,
.firefox .squeeze-other-punc:only-child::before {
    margin-top: -1rem;
}

.chrome .squeeze-other-punc:only-child::before,
.firefox .squeeze-other-punc:only-child::before,
.firefox .squeeze-other-punc:last-child::after {
    content: '\2060〇'; /* U+2060 WORD JOINER, avoid punc being first in a line */
    opacity: 0;
}
```

## License

Distributed under the MIT License. See `LICENSE` for more information.

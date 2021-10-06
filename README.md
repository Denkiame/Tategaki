# Tategaki

**Tategaki** translates HTML elements to tategaki, i.e. vertical writing.

## Usage

### TypeScript module

1. Import `Tategaki`:

```TypeScript
import { Tategaki } from 'tategaki'
```

2. Link an `HTMLElement` and parse. Suppose the root `article` is an `Element`:

```TypeScript
/*
 * `Tategaki` arguments:
 * - rootElement: Element
 * - config: Object
 *   - shouldPcS: boolean=true
 *   - imitatePcS: boolean=true (Using customised PcS instead of OpenType `vhal`)
 *   - imitateTransfromToFullWidth: boolean=true (Using customised full-width transfomation instead of OpenType `fwid`)
 */
let tategaki = new Tategaki(article, {
    shouldPcS: true,
    imitatePcS: false,
    imitateTransfromToFullWidth: false
})
tategaki.parse()
```

- A `tategaki` class will be attached to the root element.
- It'll split the element into several types of `<span>` (`cjk`, `latin`, etc. ) so that the style can be further customised.
- Punctuation squeezing (PcS) will be **automatically applied**. You can turn it off when initialising (`new Tategaki(article, false)`).
- You can import `tategaki.css` (listed below) for styling.

### Embedded in HTML

- In `<head>`:

```HTML
<link rel="stylesheet" href="https://unpkg.com/tategaki@1.0.6/assets/tategaki.css" />
```
- At the bottom of `<body>`:

```HTML
<script src="https://unpkg.com/tategaki@1.0.6/dist/tategaki.min.js"></script>
```

Versions can be found at <https://host.tategaki.de/release.json>.

## Recommended Style

### Text

```cSS
.tategaki {
    writing-mode: vertical-rl;

    hanging-punctuation: allow-end last;

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

.to-fullwidth {
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

.firefox .squeeze-other-punc:last-child {
    text-combine-upright: all;
}
```

## License

Distributed under the MIT License. See `LICENSE` for more information.

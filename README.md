# Tategaki

**Tategaki** translates HTML elements to tategaki, i.e. vertical writing.

## Usage

1. Import `Tategaki`:

```TypeScript
import { Tategaki } from 'tategaki'
```

2. Link an `HTMLElement` and parse. Suppose the root `article` is an `HTMLElement`:

```TypeScript
/*
 * `Tategaki` arguments:
 * - rootElement: HTMLElement
 * - shouldPcS: boolean=true
 * - imitatePcS: boolean=true (Using customised PcS instead of OpenType `vhal`)
 * - imitateTransfromToFullWidth: boolean=true (Using customised full-width transfomation instead of OpenType `fwid`)
 */
let tategaki = new Tategaki(article, true, false, false)
tategaki.parse()
```

- A `tategaki` class will be attached to the root element.
- It'll split the element into several types of `<span>` (`cjk`, `latin`, etc. ) so that the style can be further customised.
- Punctuation squeezing (PcS) will be **automatically applied**. You can turn it off when initialising (`new Tategaki(article, false)`).
- You can import `tategaki.css` (listed below) for styling.

## Recommended Style

### Text

```css
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

```css
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

```css
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
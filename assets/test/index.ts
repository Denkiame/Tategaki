import { Tategaki } from "../../src/tategaki"
import { detect } from 'detect-browser'

const browser = detect()
let isFirefox = browser && browser.name === 'firefox'

let article = document.getElementsByTagName('article')[0]
let tategaki = new Tategaki(article, true, isFirefox, !isFirefox)

tategaki.parse()

if (isFirefox) {
    document.body.classList.add('firefox')
}

import { Tategaki } from "../../src/tategaki"
import { detect } from 'detect-browser'

const browser = detect()
const isFirefox = browser && browser.name === 'firefox'
const isChrome = browser && browser.name === 'chrome'
if (browser) {
    document.body.classList.add(browser.name)
}

let article = document.getElementsByTagName('article')[0]
let tategaki = new Tategaki(article, true, isFirefox || isChrome, !isFirefox)

tategaki.parse()


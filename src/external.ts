import { Tategaki } from './tategaki'
import { detect } from 'detect-browser'

const browser = detect()
const isFirefox = browser && browser.name === 'firefox'
const isChrome = browser && browser.name === 'chrome'
if (browser) {
    document.body.classList.add(browser.name)
}

let kaku = Array.from(document.getElementsByClassName('tategaki'))
kaku.forEach(k => {
    let tategaki = new Tategaki(k, true, isFirefox || isChrome, true)

    tategaki.parse()
})

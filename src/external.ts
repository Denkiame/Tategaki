import { Tategaki } from './tategaki'
import { detect } from 'detect-browser'

const browser = detect()
const isFirefox = browser && browser.name === 'firefox'
const isChrome = browser && browser.name === 'chrome'
if (browser) {
    document.body.classList.add(browser.name)
}

let articles = Array.from(document.querySelectorAll('article'))
articles.forEach(article => {
    let tategaki = new Tategaki(article, true, isFirefox || isChrome, true)

    tategaki.parse()
})

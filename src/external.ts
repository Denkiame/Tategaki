import { Tategaki } from './tategaki'
import { detect } from 'detect-browser'

const browser = detect()
if (browser) {
    document.body.classList.add(browser.name)
}

let kaku = Array.from(document.getElementsByClassName('tategaki'))
kaku.forEach(k => {
    let tategaki = new Tategaki(k, true, true, true)

    tategaki.parse()
})

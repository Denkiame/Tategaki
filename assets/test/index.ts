import { Tategaki } from "../../src/tategaki"
// import { detect } from 'detect-browser'

let article = document.getElementsByTagName('article')[0]
let tategaki = new Tategaki(article, true, false)
tategaki.parse()

import { Tategaki } from "./tategaki"

let article = document.getElementsByTagName('article')[0]
let tategaki = new Tategaki(article)
tategaki.parse()


const urlParams = new URLSearchParams(window.location.search)
const consoleArea = document.getElementById("consoleArea")
const basePath = window.location.href.split("?")[0]

const init = `- osu assets downloader
    * usage: ${basePath}?id=<BEATMAPSET_ID>&server=<SERVERID>
      - server id:
        * 0 or not specified: nerinyan (nerinyan.moe)
        * 1: mino (catboy.best)
        * 2: osu.direct
    * example: ${basePath}?id=1061089

- skips storyboard assets for optimization
`

const MAPDL_URL = [
    "https://proxy.nerinyan.moe/d/",
    "https://catboy.best/d/",
    "https://osu.direct/d/",
]

const getquery = (query) => {
    if (!urlParams.has(query)) return null
    return urlParams.get(query)
}

const scrollWindow = () => window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth"
})

const log = (content) => consoleArea.append(content + "\n")

const start = () => {

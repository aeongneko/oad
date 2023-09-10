const urlParams = new URLSearchParams(window.location.search)
const consoleArea = document.getElementById("consoleArea")
const basePath = window.location.href.split("?")[0]

const init = `- osu assets downloader
    * usage: ${basePath}?id=<BEATMAP_ID>&server=<SERVERID>
      - server id:
        * 0 or not specified: nerinyan (nerinyan.moe)
        * 1: mino (catboy.best)
    * example: ${basePath}?id=2223750

- skips storyboard assets for optimization
`
const API_URL = "https://api.nerinyan.moe"

const MAPDL_URL = [
    "https://proxy.nerinyan.moe/d/",
    "https://catboy.best/d/"
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
    if (window.location.search == "") return log(init)
    const beatmapid = getquery("id")
    const server = getquery("server")
    if (isNaN(beatmapid)) return log("Invalid beatmap id\n\n" + init)
    if (isNaN(server)) return log("Invalid server id\n\n" + init)

    return download(beatmapid, server)
}

const download = async (id, server) => {
    let beatmap

    log(`Finding beatmap ${id}...`)

    const data = await fetch(`${API_URL}/search?q=${id}&option=mapid&s=all&nsfw=1`).then(r => {
        if (!r.ok) return log("Error: " + r.status)
        return r.json()
    })

    const beatmapset = await data?.[0]
    if (!beatmapset) return log("Error: beatmap not found")

    for (const bm of beatmapset.beatmaps) {
        if (bm.id == id) {
            beatmap = bm
            break
        }
    }

    log(`Beatmap found, downloading on mirror id: ${server ?? 0}...`)

    const serverURL = MAPDL_URL[server] ?? MAPDL_URL[0]

    const blob = await fetch(serverURL + beatmapset.id).then(r => {
        if (!r.ok) return log("Error: " + r.status)
        return r.blob()
    })

    log("Beatmap downloaded, extracting...")

    const reader = new zip.ZipReader(new zip.BlobReader(blob))
    const files = await reader.getEntries()
    for (let i = 0; i < files.length; i++) {
        const filename = files[i].filename
        if (filename.startsWith("sb/")) continue

        // wait, this is so bad
        const ext = filename.split(".").pop()
        if (ext == "mp3" || ext == "ogg" || ext == "wav") mime = `audio/${ext}`
        else if (ext == "jpg" || ext == "png") mime = `image/${ext}`
        else mime = "text/plain"

        const fileBlob = await files[i].getData(new zip.BlobWriter(mime))
        const a = document.createElement("a")
        a.href = URL.createObjectURL(fileBlob)
        a.appendChild(document.createTextNode(filename))
        document.body.appendChild(a)
        document.body.appendChild(document.createElement("br"))
        scrollWindow()
    }
    await reader.close()
    log("Extracted, done!")
}

start()
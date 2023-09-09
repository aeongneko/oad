const urlParams = new URLSearchParams(window.location.search)
const consoleArea = document.getElementById("consoleArea")
const basePath = window.location.href.split("?")[0]

const init = `- osu audio downloader
    * usage: ${basePath}?id=<BEATMAP_ID>
    * usage: ${basePath}?id=2407152

- this site uses nerinyan.moe for downloading beatmap
  if you want to download bg, use https://api.nerinyan.moe/bg/<BEATMAPSET_ID>
`
const APIURL = "https://api.nerinyan.moe"

const getquery = (query) => {
    if (!urlParams.has(query)) return null
    return urlParams.get(query)
}

const log = (content, scroll = true) => {
    consoleArea.append(content + "\n")
    if (scroll) consoleArea.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}


const start = () => {
    if (window.location.search == "") return log(init)
    const beatmapid = getquery("id")
    if (isNaN(beatmapid)) return log("Invalid beatmap id\n\n" + init)
    return download(beatmapid)
}

const download = async (id) => {
    let beatmap
    let audioname
    let audioBlob
   
    log("Finding beatmap " + id + " in nerinyan.moe...")

    const data = await fetch(`${APIURL}/search?q=${id}&option=mapid&s=all&nsfw=1`, {
        cache: "no-cache"
    }).then(r => {
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

    log("Beatmap found, downloading...")

    const blob = await fetch(`https://proxy.nerinyan.moe/d/${beatmapset.id}`, {
        cache: "no-cache"
    }).then(r => {
        if (!r.ok) return log("Error: " + r.status)
        return r.blob()
    })

    log("Beatmap downloaded, extracting...")

    const reader = new zip.ZipReader(new zip.BlobReader(blob))
    const files = await reader.getEntries()
    for (const file of files) {
        if (file.filename === beatmap.osu_file) {
            const osu = await file.getData(new zip.TextWriter("utf-8"))
            audioname = osu.match(/(?<=AudioFilename: ).+(?=)/)?.[0]
            if (!audioname) return log("Error: Audio not found")
            for (const file of files) {
                if (file.filename == audioname) {
                    audioBlob = await file.getData(new zip.BlobWriter("audio/" + audioname.split(".").pop()))
                    break
                }
            }
            break
        }
    }
    await reader.close()

    log("Audio extracted! " + audioname)

    const audioElement = document.createElement("audio")
    audioElement.setAttribute("controls", "")
    audioElement.setAttribute("autoplay", "true")
    audioElement.setAttribute("src", URL.createObjectURL(audioBlob))
    document.body.appendChild(audioElement)
}

start()

const { BrowserWindow } = require("electron")
const path = require("node:path")

function cutWindow() {
    const homeWindow = BrowserWindow.getFocusedWindow()

    if (homeWindow) {
        const win = new BrowserWindow({
            width: 800,
            height: 600,
            title: "Findoc",
            icon: "src/public/img/logo.svg",
            autoHideMenuBar: true,
            resizable: false,
            modal: true,
            parent: homeWindow,
            webPreferences: {
                preload: path.join(__dirname, "../preload.js")
            }
        })

        win.loadFile("src/public/ui/cut.html")
    }
}

module.exports = {
    cutWindow
}
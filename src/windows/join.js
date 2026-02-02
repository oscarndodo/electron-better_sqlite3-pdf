const { BrowserWindow } = require("electron")
const path = require("node:path");

function joinWindow() {
    const homeWindow = BrowserWindow.getFocusedWindow()
    if (homeWindow) {

        const win = new BrowserWindow({
            width: 800,
            height: 600,
            autoHideMenuBar: true,
            resizable: false,
            title: "CYFRAS - MANIPULADOR DE ARQUIVOS PDF",
            icon: "src/public/img/logo.png",
            modal: true,
            parent: homeWindow,
            webPreferences: {
                preload: path.join(__dirname, "../preload.js")
            }
        })

        win.loadFile("src/public/ui/join.html")
    }
}

module.exports = {
    joinWindow
}
const { BrowserWindow } = require("electron")

function signatureWindow() {
    const homeWindow = BrowserWindow.getFocusedWindow()
    if (homeWindow) {
        const win = new BrowserWindow({
            width: 800,
            height: 600,
            autoHideMenuBar: true,
            resizable: false,
            modal: true,
            parent: homeWindow
        })

        win.loadFile("src/public/ui/signature.html")
    }
}


module.exports = {
    signatureWindow
}
const { BrowserWindow } = require("electron")
const path = require("node:path");

const homeWindow = () => {
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        title: "cyfras",
        icon: "src/public/img/logo.png",
        backgroundColor: "#f1f5f9",
        backgroundMaterial: "auto",
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "../preload.js")
        }
    })

    win.loadFile("src/public/ui/home.html")
}


module.exports ={
    homeWindow
}
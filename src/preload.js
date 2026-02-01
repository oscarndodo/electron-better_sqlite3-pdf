const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("api", {
    openJoinWindow: () => ipcRenderer.send("open-join-window"),
    openCutWindow: () => ipcRenderer.send("open-cut-window"),
    openSinature: () => ipcRenderer.send("open-signature-window"),
    

    getPages: (data) => ipcRenderer.invoke("pages-count", (data)),

    // Tratamento
    initMerge: (data) => ipcRenderer.invoke("init-merge", (data)),
    initCut: (data) => ipcRenderer.invoke("init-cut", (data)),


    //Analitic from db
    getAllfiles: () => ipcRenderer.invoke("get-all-files")
})
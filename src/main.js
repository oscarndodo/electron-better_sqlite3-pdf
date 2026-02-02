const { app, BrowserWindow, ipcMain, dialog, Notification, shell } = require("electron")
const fs = require("fs")
const path = require("path")

//Libs externas
const { PDFDocument } = require("pdf-lib")
const { getDiskInfo } = require("node-disk-info")

//Modulos internos
const { insert, select } = require("./db/index")
const { homeWindow } = require("./windows/home")
const { joinWindow } = require("./windows/join")
const { cutWindow } = require("./windows/cut")
const { signatureWindow } = require("./windows/signature")
require("electron-reload")(__dirname)







app.whenReady().then(() => {
  homeWindow()
  getAllFiles()
  getMemory()
  //Pegar total de paginas d eum arquivo
  ipcMain.handle("pages-count", async (_, file) => {
    const pdfDoc = await PDFDocument.load(file);
    return pdfDoc.getPageCount();
  })

  ipcMain.on("open-join-window", () => {
    joinWindow()
  })

  ipcMain.on("open-cut-window", () => {
    cutWindow()
  })

  ipcMain.on("open-signature-window", () => {
    signatureWindow()
  })

ipcMain.handle('open-file', async (_, pathFile) => {
  if (!pathFile || !fs.existsSync(pathFile)) {
    new Notification({
      title: 'Findoc',
      body: 'Este arquivo foi movido ou eliminado!',
    }).show();
    return false;
  }

  await shell.openPath(pathFile);
  return true;
});

  //Tratamento

  ipcMain.handle("init-merge", async (_, data) => {
    try {
      // Criar PDF final
      const mergedPdf = await PDFDocument.create();

      for (const file of data.files) {
        // file.buffer deve ser ArrayBuffer
        const pdf = await PDFDocument.load(file.buffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      // Salvar PDF final
      const mergedPdfBytes = await mergedPdf.save();
      // Abrir diálogo para escolher pasta e nome do arquivo
      const { filePath, canceled } = await dialog.showSaveDialog({
        title: "Salvar PDF mesclado",
        defaultPath: path.join(app.getPath("documents"), "MergedPDF.pdf"),
        filters: [{ name: "PDF", extensions: ["pdf"] }]
      });

      if (canceled || !filePath) {
        return { error: true, message: "Salvamento cancelado pelo usuário." };
      }

      fs.writeFileSync(filePath, mergedPdfBytes);

      // pega nome do ficheiro
      const fileName = path.basename(filePath);

      // pega número de páginas
      const pdfDoc = await PDFDocument.load(mergedPdfBytes);
      const totalPages = pdfDoc.getPageCount();

      // insere no DB
      const dbUpdated = insert([fileName, 'merge', filePath, totalPages]);


      new Notification({
        title: "Findoc",
        icon: "public/img/logo.png",
        body: "Junção dos PDFs realizada com sucesso. \n " + filePath,
        closeButtonText: "OK",
      }).show()

      getAllFiles()

      return { error: false, path: filePath, db: dbUpdated };

    } catch (err) {
      // console.error("Erro ao juntar os PDFs:", err);
      return { error: true, message: err.message };
    }
  });

  ipcMain.handle("init-cut", async (_, data) => {
    try {
      const { fileName, fileBuffer, pagesToRemove } = data;

      // Converter ArrayBuffer → Buffer
      const inputBuffer = Buffer.from(fileBuffer);

      // Carregar PDF original
      const pdfDoc = await PDFDocument.load(inputBuffer);

      const totalPages = pdfDoc.getPageCount();

      // Criar novo PDF
      const newPdf = await PDFDocument.create();

      // Converter páginas a remover para 0-based
      const pagesToRemoveSet = new Set(
        pagesToRemove.map(p => p - 1)
      );

      // Copiar apenas páginas NÃO removidas
      for (let i = 0; i < totalPages; i++) {
        if (!pagesToRemoveSet.has(i)) {
          const [page] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(page);
        }
      }

      // Salvar PDF final
      const finalBytes = await newPdf.save();

      const { filePath, canceled } = await dialog.showSaveDialog({
        title: 'Salvar PDF',
        defaultPath: path.join(
          app.getPath('documents'),
          fileName.replace('.pdf', '_cut.pdf')
        ),
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
      });

      if (canceled || !filePath) {
        return { error: true, message: 'Salvamento cancelado' };
      }

      fs.writeFileSync(filePath, finalBytes);

     
      // pega nome do ficheiro
      const fileName_cut = path.basename(filePath);

      // pega número de páginas
      const pdfDoc_cut = await PDFDocument.load(inputBuffer);
      const totalPages_cut = pdfDoc_cut.getPageCount();

      // insere no DB
      insert([fileName_cut, 'cut', filePath, totalPages_cut]);

      new Notification({
        title: 'Findoc',
        body: 'PDF processado com sucesso!',
      }).show();

      return {
        error: false,
        path: filePath,

      };

    } catch (err) {
      console.error(err);
      return {
        error: true,
        message: err.message,
      };
    }
  });


  //  Pegar todos osregisto da DB
  function getAllFiles() {
    ipcMain.handle("get-all-files", () => {
      return select()
    })
  }

  // Pegar espaco restante no HD
  function getMemory(){
    ipcMain.handle("memory", async () => {
      const result = await getDiskInfo().then((drives) => {
        let memory_free = 0;
        drives.forEach(drive => {
          memory_free += drive._available
        });
        return (memory_free / 1024 / 1024 / 1024).toFixed(2);
      })
      return {memory: result + " GB"}
    })
  }


  //Eventos para qualquer SO
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})





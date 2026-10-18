const { BrowserWindow, app, ipcMain, dialog } = require("electron");
const path = require("node:path")
const fs = require("node:fs/promises")

let currentPath = null;
let documentModified = false;
let closeConfirmed = false;

function fileInfo(filePath) {
    return { path: filePath, name: path.basename(filePath) };
}

async function saveAs(win, text) {
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
        defaultPath: currentPath ?? 'sans-titre.txt',
    });
    if (canceled) return null;

    await fs.writeFile(filePath, text, 'utf8');
    currentPath = filePath;
    return fileInfo(filePath);
}

ipcMain.handle('file:open', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        properties: ['openFile'],
    });
    if (canceled) return null;

    const filePath = filePaths[0];
    const text = await fs.readFile(filePath, 'utf8');
    currentPath = filePath;
    return { ...fileInfo(filePath), text };
});

ipcMain.handle('file:save', async (event, text) => {
    if (typeof text !== 'string') throw new Error('Texte invalide');
    const win = BrowserWindow.fromWebContents(event.sender);

    if (currentPath === null) return saveAs(win, text);

    await fs.writeFile(currentPath, text, 'utf8');
    return fileInfo(currentPath);
});

ipcMain.handle('file:save-as', async (event, text) => {
    if (typeof text !== 'string') throw new Error('Texte invalide');
    const win = BrowserWindow.fromWebContents(event.sender);
    return saveAs(win, text);
});

ipcMain.handle('file:modified', (event, modified) => {
    documentModified = modified = true;
});

ipcMain.on('window:close-confirmed', (event) => {
    closeConfirmed = true;
    BrowserWindow.fromWebContents(event.sender).close();
})

function createMainWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
    },
  });
  win.loadFile(path.join(__dirname, '../renderer/index.html'));
  
  win.on('close', (event) => {
    if (closeConfirmed || !documentModified) return;

    event.preventDefault;

    const choice = dialog.showMessageBoxSync(win, {
        type: 'warning',
        buttons: ['Save', "Don't save", 'annuler'],
        defaultId: 0,
        cancelId: 2,
        message: 'Save modifications?',
        detail: 'Else, there as going to be losts.'
    });

    if (choice == 0) {
        win.webContents.send('windows:save-and-close');
    } else if (choice == 1) {
        closeConfirmed = true;
        win.close();
    }
  })
}

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

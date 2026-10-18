const { BrowserWindow, app, ipcMain } = require("electron");
const path = require("node:path")

function mainWindow() {
    const window = new BrowserWindow({
        width: 900, height: 900,
        webPreferences: { preload: path.join(__dirname, '../preload/preload.js')},
    });
    window.loadFile('src/renderer/index.html')
}

app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pong')
    mainWindow()
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

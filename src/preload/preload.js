const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('files', {
    open: () => ipcRenderer.invoke('file:open'),
    save: (text) => ipcRenderer.invoke('file:save', text),
    saveAs: (text) => ipcRenderer.invoke('file:save-as', text),
    setModified: (modified) => ipcRenderer.send('file:modified', modified),
});

contextBridge.exposeInMainWorld('appWindow', {
    onSaveClosed: (callback) => ipcRenderer.on('window:save-and-close', () => callback()),
    confirmClose: () => ipcRenderer.send('window:close-confirmed')
})

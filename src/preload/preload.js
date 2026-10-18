const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('files', {
    open: () => ipcRenderer.invoke('file:open'),
    save: (text) => ipcRenderer.invoke('file:save', text),
    saveAs: (text) => ipcRenderer.invoke('file:save-as', text),
})

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  handleTextUpdate: (callback) => ipcRenderer.on("foo", callback),
  // O exponer ipcRenderer completo (menos seguro)
  ipcRenderer: ipcRenderer,
});

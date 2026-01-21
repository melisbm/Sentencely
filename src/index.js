const {
  app,
  BrowserWindow,
  globalShortcut,
  Notification,
  clipboard,
  nativeImage,
  Tray,
  Menu,
} = require("electron");
const path = require("node:path");
const { keyboard, Key } = require("@nut-tree-fork/nut-js");

if (require("electron-squirrel-startup")) {
  app.quit();
}

const NOTIFICATION_TITLE = "Quick Shortcut!";
const NOTIFICATION_BODY = 'Press "Cmd+Shift+M" to copy some text to MINE';

let mainWindow = null;
let popupWindow = null;
let tray = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
};

const createPopupWindow = () => {
  popupWindow = new BrowserWindow({
    width: 400,
    height: 200,
    frame: true,
    skipTaskbar: true,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  popupWindow.loadFile(path.join(__dirname, "popup.html"));
};

function showNotification() {
  new Notification({
    title: NOTIFICATION_TITLE,
    body: NOTIFICATION_BODY,
  }).show();
}

app.whenReady().then(() => {
  globalShortcut.register("CommandOrControl+Shift+M", async () => {
    const modifier =
      process.platform === "darwin" ? Key.LeftCmd : Key.LeftControl;

    await keyboard.pressKey(modifier, Key.C);
    await keyboard.releaseKey(modifier, Key.C);

    if (popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.close();
    }

    createPopupWindow();

    popupWindow.webContents.on("did-finish-load", () => {
      popupWindow.webContents.send("foo", clipboard.readText());
    });

    popupWindow.once("ready-to-show", () => {
      popupWindow.show();
      popupWindow.focus();
    });
  });

  const iconData =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACTSURBVHgBpZKBCYAgEEV/TeAIjuIIbdQIuUGt0CS1gW1iZ2jIVaTnhw+Cvs8/OYDJA4Y8kR3ZR2/kmazxJbpUEfQ/Dm/UG7wVwHkjlQdMFfDdJMFaACebnjJGyDWgcnZu1/lrCrl6NCoEHJBrDwEr5NrT6ko/UV8xdLAC2N49mlc5CylpYh8wCwqrvbBGLoKGvz8Bfq0QPWEUo/EAAAAASUVORK5CYII=";
  const appIcon = nativeImage.createFromDataURL(iconData);

  tray = new Tray(appIcon);
  const contextMenu = Menu.buildFromTemplate([
    { label: "Show Window", click: () => createWindow() },
    { type: "separator" },
    { role: "quit", label: "Exit" },
  ]);

  tray.setContextMenu(contextMenu);
  showNotification();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

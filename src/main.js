const { app, BrowserWindow, ipcMain } = require('electron')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    ipcMain.on("getCompletion", event => {
        event.reply("getCompletion", {"role": "assistant", "content": "Test"})
    })

    win.menuBarVisible = false;

    win.loadFile("index.html");
}

app.whenReady().then(() => {
    createWindow()
})

const { app, BrowserWindow, ipcMain } = require('electron');
const { OpenAI } = require("openai");
let fs = require("fs");

let config = {
    model: "gpt-3.5-turbo",
    api_key: "",

};

const openai = new OpenAI({
    apiKey: ""
});

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    ipcMain.on("getCompletion", (event, messages) => {
        openai.chat.completions.create({
            messages: messages,
            model: "gpt-3.5-turbo"
        }).then(completion => {
            event.reply("getCompletion", completion.choices[0].message);
        });
    });

    win.menuBarVisible = false;

    win.loadFile("index.html");
}

app.whenReady().then(() => {
    try {
        config = JSON.parse(fs.readFileSync("./config.json").toString());
    } catch {
        console.log("Missing/corrupt config file, using defaults.");
    }

    openai.apiKey = config.api_key;

    createWindow();

    fs.writeFileSync("./config.json", JSON.stringify(config, null, 4));
})

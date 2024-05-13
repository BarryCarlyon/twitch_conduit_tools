import { BrowserWindow, app, ipcMain, screen, session, shell } from "electron";

import Store from "electron-store";
const store = new Store();

import contextMenu from "electron-context-menu";
contextMenu();

app.on("window-all-closed", () => {
    app.quit();
});

/*
not needed/doesn't work for MAS and not needed for mac.
Mac self enforces
and MAS has a fun permissions issue
*/
import { platform } from "os";
if (platform() == "win32") {
    const gotLock = app.requestSingleInstanceLock();
    if (!gotLock) {
        app.quit();
    } else {
        app.on("second-instance", (event, commandLine, workingDirectory) => {
            // Someone tried to run a second instance, we should focus our window.
            if (win) {
                if (win.isMinimized()) {
                    win.restore();
                }
                win.focus();
            }
        });
    }
}

app.on("ready", () => {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                "Content-Security-Policy": ["script-src 'self'"],
            },
        });
    });

    // settings migration
    let options = {
        width: 800,
        height: 500,
        x: 0,
        y: 0,

        show: false,

        title: `BarryCarlyon Twitch Conduit Tools: v${app.getVersion()}`,
        autoHideMenuBar: false,
        backgroundColor: "#000000",

        maximizable: true,
        resizable: true,
        frame: true,

        webPreferences: {
            preload: app.getAppPath() + "/app/preload.js",
        },
    };

    let position = store.get("window.position");
    if (position) {
        delete options.center;
        // validate position
        options.x = position[0];
        options.y = position[1];
    }
    let size = store.get("window.size");
    if (size) {
        options.width = size[0];
        options.height = size[1];
    }

    win = new BrowserWindow(options);
    win.removeMenu();

    // on a display check
    let on_a_display = false;
    let displays = screen.getAllDisplays();
    displays.map(function (display) {
        if (
            win.getPosition()[0] >= display.bounds.x &&
            win.getPosition()[1] >= display.bounds.y &&
            win.getPosition()[0] < display.bounds.x + display.bounds.width &&
            win.getPosition()[1] < display.bounds.y + display.bounds.height
        ) {
            on_a_display = true;
        }
    });
    if (!on_a_display) {
        // reset to center
        win.center();
        store.delete("window.position");
    }
    win.on("moved", (e) => {
        store.set("window.position", win.getPosition());
    });
    win.on("resized", (e) => {
        store.set("window.size", win.getSize());
    });

    win.loadFile("app/views/interface.html");
    win.once("ready-to-show", () => {
        win.show();
        win.setTitle(`BarryCarlyon Twitch Conduit Tools: v${app.getVersion()}`);
    });
    if (!app.isPackaged) {
        setTimeout(() => {
            win.webContents.openDevTools();
        }, 1500);
    }

    ipcMain.on("openWeb", (e, url) => {
        shell.openExternal(url);
    });
    ipcMain.on("minimize", () => {
        win.minimize();
    });
    ipcMain.on("quit", () => {
        app.quit();
    });

    modules({ app, ipcMain, win, store });
});

import moduleConduits from "./modules/conduits.js";
import moduleConfig from "./modules/config.js";
import moduleAccessToken from "./modules/twitch.js";
import moduleUpdater from "./modules/updater.js";

function modules({ app, ipcMain, win, store }) {
    // add updater
    moduleUpdater({ app, ipcMain, win, store });
    // handler
    moduleConfig({ app, ipcMain, win, store });
    // twitch
    let accessToken = moduleAccessToken({ app, ipcMain, win, store });
    // conduits
    moduleConduits({ app, ipcMain, win, store, accessToken });
}

let win;

/**
 * Here lies the implementation of the main functionality of the app.
 * @author Luca Warmenhoven
 * @date 11th of April 2024.
 * @version 1.0.0
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const { createWindow } = require('./util/window');
const path = require("node:path");
const os = require("node:os");
const fs = require('fs');

// Register all event handlers for the main process
require('./util/io/localfs-handlers')(ipcMain);
require('./util/io/ssh')(ipcMain, app);


/** @type {Electron.BrowserWindow} */
let mainWindow = null;
let settingsWindow = null;

let settings = [];

const APP_DIRECTORY = path.join(app.getPath('appData'), app.getName());

app.whenReady().then(async () => {
    let indexPath = path.join(__dirname, 'index.html');

    // Load in all settings before doing anything.
    await fs.promises.readFile(path.join(__dirname, 'resources', 'settings.json'), { encoding: 'utf-8' })
        .then(content => JSON.parse(content))
        .then(parsed => settings = parsed);

    // then create the window once they've loaded.
    mainWindow = createWindow(indexPath, { width: 1400, height: 900 });

    app.on('activate', _ => {
        if ( BrowserWindow.getAllWindows().length === 0 )
            mainWindow = createWindow(indexPath);
    })
    app.on('window-all-closed', _ => os.platform() === 'darwin' || app.quit())
})

ipcMain.on('app:path', event => event.returnValue = APP_DIRECTORY);

/**
 * Handler for opening the settings window.
 */
ipcMain.handle('app:settings', async () => {
    if ( !settingsWindow ) {
        settingsWindow = createWindow(path.join(__dirname, 'settings.html'), {
            width: 800,
            height: 600,
            resizable: false
        });
        settingsWindow.on('closed', _ => settingsWindow.hide());
    }
    settingsWindow.show();
})

ipcMain.on('app:settings:retrieve', event => event.returnValue = settings);
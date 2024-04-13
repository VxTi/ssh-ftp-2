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


/** @type {Electron.BrowserWindow} */
let mainWindow = null;

const APP_DIRECTORY = path.join(app.getPath('appData'), 'SSH-FTP');

app.whenReady().then(_ => {
    let indexPath = path.join(__dirname, 'index.html');
    mainWindow = createWindow(indexPath);

    app.on('activate', _ =>
    {
        if ( BrowserWindow.getAllWindows().length === 0 )
            createWindow(indexPath);
    })
    app.on('window-all-closed', _ => os.platform() === 'darwin' || app.quit())
})

ipcMain.on('app:path', event => event.returnValue = APP_DIRECTORY);
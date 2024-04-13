let { BrowserWindow } = require('electron');
let path = require('path');
let os = require('os');

/**
 * Function for creating a window with the given page path and creation arguments.
 * These can be left empty for default settings.
 * @param {string} pagePath The path to the page to be loaded.
 * @param {Electron.BrowserWindowConstructorOptions} createArgs The arguments to be passed to the window creation.
 * @returns {Electron.BrowserWindow} The created window.
 */
function createWindow(pagePath, createArgs = {})
{
    let window = new BrowserWindow(Object.assign({
        width: 900,
        height: 700,
        transparent: true,
        titleBarOverlay: false,
        show: false,
        icon: './resources/app_icon.png',
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, '..', 'preload.js')
        }
    }, createArgs));

    // Show the window buttons on macOS
    if ( os.platform() === 'darwin' )
        window.setWindowButtonVisibility(true);

    window.webContents.on('did-finish-load', _ => {
        window.show();
        window.on('resized', _ => {
            // Send the 'window:onresize' event to the window renderer process
            // with the window size as arguments ( width, height )
            window.webContents.send('window:onresize', ...window.getSize())
        });
    });
    window.loadFile(pagePath).catch(console.error);

    return window;
}

module.exports = { createWindow };
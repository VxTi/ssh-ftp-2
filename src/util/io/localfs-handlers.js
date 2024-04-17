const path = require("node:path");
const { app } = require("electron");

/**
 * Function for handling local file system
 * events. This has to be done in the main process to
 * allow for access to all files in the file system.
 * @param {IpcMain} ipcMain - The IPC main object.
 * @private
 */
function __init(ipcMain)
{
    let path = require('path');
    let fs = require('fs');

    const appDirectory = path.join(app.getPath('appData'), app.getName());
    if (!fs.existsSync(appDirectory))
    {
        fs.mkdirSync(appDirectory);
        console.log("Creating app directory at: " + appDirectory)
    }
    console.log("Registered event handlers for local file system.");

    /** Read the contents of a file at the given path. */
    ipcMain.handle('localfs:read', async (event, filePath) =>
        fs.promises.readFile(filePath, { encoding: 'utf-8' }))

    /** Get the information about a file at the given path. */
    ipcMain.handle('localfs:info', async (event, filePath) =>
    {
        let fileStats = fs.lstatSync(filePath);
        let fileName = path.basename(filePath);
        return {
            permissions: fileStats.mode,
            size: fileStats.size,
            dateCreated: fileStats.ctime,
            dateModified: fileStats.mtime,
            name: fileName,
            hidden: fileName.startsWith('.'),
            type: fileStats.isDirectory() ? 'directory' : 'file',
            path: filePath,
            isDirectory: fileStats.isDirectory(),
            isFile: fileStats.isFile(),
        };
    });

    /** Move a file from one path to another.*/
    ipcMain.handle('localfs:move', async (event, source, destination) =>
        fs.promises.rename(source, destination));

    /** List the contents of a directory at the given path. */
    ipcMain.handle('localfs:list', async (event, dirPath) =>
        fs.promises.readdir(dirPath));

    /** Delete a file at the given path. */
    ipcMain.handle('localfs:delete', async (_, filePath) =>
        fs.promises.unlink(filePath));

    /** Write data to a file at the given path. */
    ipcMain.handle('localfs:write', async (_, filePath, data) =>
        fs.promises.writeFile(filePath, data, { encoding: 'utf-8' }));

    /** Create a directory at the given path.*/
    ipcMain.handle('localfs:mkdir', async (_, dirPath) =>
        fs.promises.mkdir(dirPath));

    /** Check if a file exists at the given path. */
    ipcMain.on('localfs:exists', (event, filePath) =>
        event.returnValue = fs.existsSync(filePath));
}

module.exports = __init;
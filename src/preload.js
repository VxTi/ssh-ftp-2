/**
 * @fileoverview
 * This file is loaded by the renderer process, and is used to expose
 * functions and variables to the renderer process, from the main process.
 */

const { contextBridge, ipcRenderer } = require('electron');
const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * The functions and variables that are supposed to be exposed
 * to the rendering process, for all windows.
 */
const __app_main_context = {
    name: 'Transference',
    os: {
        isWindows: os.platform() === 'win32',
        isLinux: os.platform() === 'linux',
        isMac: os.platform() === 'darwin',
        platform: os.platform(),
    },
    localFs: {
        appDirectory: ipcRenderer.sendSync('app:path'),
        read: (filePath) =>
            fs.promises.readFile(filePath, { encoding: 'utf-8' }),
        write: (filePath, data) =>
            fs.promises.writeFile(filePath, data, { encoding: 'utf-8' }),
        exists: (filePath) =>
            fs.existsSync(filePath),
    },
    sessions: {
        /** @returns {RemoteSession[]} */
        get: async _ =>
            JSON.parse(await __app_main_context.localFs.read(path.join(__app_main_context.localFs.appDirectory, 'sessions.json'))),
        set: (sessions) =>
            localStorage.setItem('sessions', JSON.stringify(sessions)),
        /** @param {RemoteSession} session */
        update: (session) => {
            let sessions = __app_main_context.sessions.get();
            let index = sessions.findIndex(s => s.sessionUid === session.sessionUid);
            if (index !== -1)
                sessions[index] = session;
            __app_main_context.sessions.set(sessions);
        },
    }
}

// Expose all the defined functions and variables to the renderer process
contextBridge.exposeInMainWorld('app', __app_main_context);
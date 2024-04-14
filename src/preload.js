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

        /**
         * Read the contents of a file at the given path.
         * @param {string} filePath   - The path to the file to read.
         * @returns {Promise<string>} - The contents of the file.
         */
        read: (filePath) =>
            fs.promises.readFile(filePath, { encoding: 'utf-8' }),

        /**
         * Get the information about a file at the given path.
         * @param {string} filePath - The path to the file to get information about.
         * @returns {IFileInfo} - The information about the file.
         */
        info: (filePath) =>
        {
            let fileStats = fs.lstatSync(filePath);
            return {
                permissions: fileStats.mode,
                size: fileStats.size,
                dateCreated: fileStats.ctime,
                dateModified: fileStats.mtime,
                name: path.basename(filePath),
                type: fileStats.isDirectory() ? 'directory' : path.extname(filePath),
                path: filePath,
                isDir: fileStats.isDirectory(),
                isFile: fileStats.isFile(),
            };
        },

        /**
         * Move a file from one path to another.
         * @param {string} oldPath - The path to the file to move.
         * @param {string} newPath - The path to move the file to.
         */
        move: (oldPath, newPath) =>
            fs.promises.rename(oldPath, newPath),

        /**
         * List the contents of a directory at the given path.
         * @param {string} dirPath - The path to the directory to list.
         * @returns {Promise<string[]>} - The contents of the directory.
         */
        list: (dirPath) =>
            fs.promises.readdir(dirPath),

        /**
         * Delete a file at the given path.
         * @param {string} filePath - The path to the file to delete.
         */
        delete: (filePath) =>
            fs.promises.unlink(filePath),

        /**
         * Write data to a file at the given path.
         * @param {string} filePath - The path to the file to write to.
         * @param {string} data - The data to write to the file.
         */
        write: (filePath, data) =>
            fs.promises.writeFile(filePath, data, { encoding: 'utf-8' }),
        /**
         * Check if a file exists at the given path.
         * @param {string} filePath - The path to the file to check.
         * @returns {boolean} - True if the file exists, false otherwise.
         */
        exists: (filePath) =>
            fs.existsSync(filePath),
    },
    sessions: {

        /**
         * Generate a unique ID.
         * @returns {number} - A unique ID.
         */
        genUid: () => Math.floor(Math.random() * 1000000),

        /**
         * Get the sessions from the sessions file.
         * @returns {Promise<RemoteSession[]>} - The sessions from the file.
         */
        get: async () =>
        {
            let content = await __app_main_context.localFs.read(path.join(__app_main_context.localFs.appDirectory, 'sessions.json'));
            let sessions = JSON.parse(content);
            if ( !Array.isArray(sessions) )
                return [];

            let hasChanged = sessions.some(session =>
            {
                if ( !session.hasOwnProperty('sessionUid') )
                {
                    session.sessionUid = __app_main_context.sessions.genUid();
                    return true;
                }
                return false;
            });

            if ( hasChanged )
                await __app_main_context.sessions.set(sessions);

            return sessions;
        },
        /**
         * Add a new session to the sessions file.
         * @param {RemoteSession} session - The session to add to the file.
         */
        add: async (session) =>
        {
            let sessions = await __app_main_context.sessions.get();
            if ( !session.hasOwnProperty('sessionUid') || session.sessionUid === 0)
                session.sessionUid = __app_main_context.sessions.genUid();
            sessions.push(session);
            await __app_main_context.sessions.set(sessions);
        },

        /**
         * Update the sessions file with the new sessions.
         * @param {RemoteSession[]} sessions - The new sessions to write to the file.
         */
        set: (sessions) =>
            __app_main_context.localFs.write(path.join(__app_main_context.localFs.appDirectory, 'sessions.json'),
                JSON.stringify(sessions)),

        /**
         * Update the content of a session in the sessions file.
         * @param {RemoteSession} session - The session to update in the file.
         */
        update: async (session) =>
        {
            let sessions = await __app_main_context.sessions.get();
            let index = sessions.findIndex(s => s.sessionUid === session.sessionUid);
            if ( index > -1 ) // Check if the session exists in the file.
            {
                sessions[index] = session;
                await __app_main_context.sessions.set(sessions);
            }
        },

        /**
         * Delete a session from the sessions file.
         * @param {string} sessionUid - The UID of the session to delete.
         */
        delete: async (sessionUid) =>
        {
            let sessions = await __app_main_context.sessions.get();
            let index = sessions.findIndex(s => s.sessionUid + '' === sessionUid);
            if ( index > -1 ) // Check if the session exists in the file.
            {
                sessions.splice(index, 1);
                await __app_main_context.sessions.set(sessions);
            }
        }
    }
}

// Expose all the defined functions and variables to the renderer process
contextBridge.exposeInMainWorld('app', __app_main_context);
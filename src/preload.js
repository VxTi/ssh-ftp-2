/**
 * @fileoverview
 * This file is loaded by the renderer process, and is used to expose
 * functions and variables to the renderer process, from the main process.
 */

const { contextBridge, ipcRenderer } = require('electron');
const os = require('os');
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
    path: {
        sep: path.sep,
        join: (...args) => path.join(...args),
    },
    /**
     * Open the settings window.
     */
    openSettings: () =>
        ipcRenderer.invoke('app:settings'),
    /**
     * Handle an event from the main process.
     * @param {string} eventName - The name of the event to handle.
     * @param {Function} handler - The handler function for the event.
     */
    handleEvent: (eventName, handler) =>
        ipcRenderer.on(eventName, (event, ...args) => handler(...args)),
    localFs: {
        appDirectory: ipcRenderer.sendSync('app:path'),
        resourcesDirectory: path.join(__dirname, 'resources'),
        homeDir: os.homedir(),

        /**
         * Read the contents of a file at the given path.
         * @param {string} filePath   - The path to the file to read.
         * @returns {Promise<string>} - The contents of the file.
         */
        read: (filePath) =>
            ipcRenderer.invoke('localfs:read', filePath),

        /**
         * Get the information about a file at the given path.
         * @param {string} filePath - The path to the file to get information about.
         * @returns {IFileInfo} - The information about the file.
         */
        info: (filePath) =>
            ipcRenderer.invoke('localfs:info', filePath),

        /**
         * Move a file from one path to another.
         * @param {string} oldPath - The path to the file to move.
         * @param {string} newPath - The path to move the file to.
         */
        move: (oldPath, newPath) =>
            ipcRenderer.invoke('localfs:move', oldPath, newPath),

        /**
         * List the contents of a directory at the given path.
         * @param {string} dirPath - The path to the directory to list.
         * @returns {Promise<string[]>} - The contents of the directory.
         */
        list: (dirPath) =>
            ipcRenderer.invoke('localfs:list', dirPath),

        /**
         * Delete a file at the given path.
         * @param {string} filePath - The path to the file to delete.
         */
        delete: (filePath) =>
            ipcRenderer.invoke('localfs:delete', filePath),

        /**
         * Write data to a file at the given path.
         * @param {string} filePath - The path to the file to write to.
         * @param {string} data - The data to write to the file.
         */
        write: (filePath, data) =>
            ipcRenderer.invoke('localfs:write', filePath, data),
        /**
         * Check if a file exists at the given path.
         * @param {string} filePath - The path to the file to check.
         * @returns {boolean} - True if the file exists, false otherwise.
         */
        exists: (filePath) =>
            ipcRenderer.sendSync('localfs:exists', filePath),

        /**
         * Create a directory at the given path.
         * @param {string} dirPath - The path to the directory to create.
         */
        mkdir: (dirPath) =>
            ipcRenderer.invoke('localfs:mkdir', dirPath),
    },
    // All SSH related functions
    sessions: {

        /**
         * Get the sessions from the sessions file.
         * @returns {Promise<RemoteSession[]>} - The sessions from the file.
         */
        get: async () =>
            ipcRenderer.invoke('ssh:load-sessions'),
        /**
         * Add a new session to the sessions file.
         * @param {RemoteSession} session - The session to add to the file.
         */
        add: async (session) =>
            ipcRenderer.invoke('ssh:add-session', session),


        /**
         * Delete a session from the sessions file.
         * @param {string} sessionUid - The UID of the session to delete.
         */
        delete: async (sessionUid) =>
            ipcRenderer.invoke('ssh:remove-session', sessionUid),

        /**
         * Connect to an SSH session.
         * @param {string} sessionUid - The UID of the session to connect to.
         */
        connect: (sessionUid) =>
            ipcRenderer.invoke('ssh:connect-session', sessionUid),

        /**
         * Disconnect from an SSH session.
         * @param {string} sessionUid - The UID of the session to disconnect from.
         */
        disconnect: async (sessionUid) =>
            ipcRenderer.invoke('ssh:disconnect-session', sessionUid),

        /**
         * Check if an SSH session is connected.
         * @param {string} sessionUid - The UID of the session to check.
         */
        isConnected: async (sessionUid) =>
            ipcRenderer.invoke('ssh:is-connected', sessionUid),

        /**
         * Execute a command on the remote server.
         * @param {string} sessionUid - The UID of the session to execute the command on.
         * @param {string} command - The command to execute.
         * @returns {Promise<string>}
         */
        exec: async (sessionUid, command) =>
            ipcRenderer.invoke('ssh:exec', sessionUid, command),

        // All file system related functions
        fs: {
            /**
             * Retrieves the home directory of the provided SSH session
             * @param {string} sessionUid - The UID of the session to get the home directory of.
             */
            homeDir: (sessionUid) =>
                ipcRenderer.invoke('ssh:home-dir', sessionUid),

            /**
             * Lists the contents of a directory on the remote server.
             */
            list: async (sessionUid, dirPath) =>
                ipcRenderer.invoke('ssh:list-files', sessionUid, dirPath),

            /**
             * Uploads file(s) to the remote server.
             * @param {string} sessionUid - The UID of the session to upload the file(s) to.
             * @param {string[]} localPaths - The path to the local file(s) to upload.
             * @param {string} remotePath - The path to the remote directory to upload the file(s) to.
             */
            upload: async (sessionUid, localPaths, remotePath) =>
                ipcRenderer.invoke('ssh:upload-files', sessionUid, localPaths, remotePath),

            /**
             * Downloads file(s) from the remote server.
             * @param {string} sessionUid - The UID of the session to download the file(s) from.
             * @param {string[]} remotePaths - The path to the remote file(s) to download.
             * @param {string} localPath - The path to the local directory to download the file(s) to.
             */
            download: async (sessionUid, remotePaths, localPath) =>
                ipcRenderer.invoke('ssh:download-files', sessionUid, remotePaths, localPath),

            /**
             * Deletes file(s) on the remote server.
             * @param {string} sessionUid - The UID of the session to delete the file(s) from.
             * @param {string[]} remotePaths - The path to the remote file(s) to delete.
             */
            delete: async (sessionUid, remotePaths) =>
                ipcRenderer.invoke('ssh:delete-files', sessionUid, remotePaths),

            /**
             * Moves a file on the remote server.
             */
            move: async (sessionUid, source, destination) =>
                ipcRenderer.invoke('ssh:move-file', sessionUid, source, destination),

            /**
             * Gives information about a file on the remote server.
             * @param sessionUid
             * @param remotePath
             * @returns {Promise<any>}
             */
            info: async (sessionUid, remotePath) =>
                ipcRenderer.invoke('ssh:file-info', sessionUid, remotePath),
        }
    }
}

// Expose all the defined functions and variables to the renderer process
contextBridge.exposeInMainWorld('app', __app_main_context);
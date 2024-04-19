/**
 * @fileoverview This file contains the SSHConnection class which is used to create an
 * SSH connection to a remote server.
 */

const { NodeSSH } = require('node-ssh');
const path = require('path');
const fs = require('fs');

/**
 * Map containing all registered SSH sessions
 * from local storage.
 * The key is the session UID and the value is the session object.
 * @type {Map<string, IRemoteSessionProperties>}
 */
const sessionMap = new Map();

/**
 * Map containing all active SSH connections.
 * The key is the session UID and the value is the ssh2.Client object.
 * TODO: Remove onData property and convert to just Map<string, NodeSSH>
 * @type {Map<string, {ssh: NodeSSH, onData: Function}>} */
const activeSessions = new Map();

/**
 * Main initializer for handling SSH connections.
 * This function will register all necessary IPC handlers for handling
 * SSH connections.
 * @param {IpcMain} ipcMain - The IPC main object.
 * @param {Electron.App} app - The Electron app object.
 * @private
 */
function __init(ipcMain, app)
{
    const sessionsFilePath = path.join(app.getPath('appData'), app.getName(), 'sessions.json');

    // Ensure the existence of the session file.
    if ( !fs.existsSync(sessionsFilePath) )
        fs.writeFileSync(sessionsFilePath, '[]');

    console.log("Registered event handlers for SSH functionality.");

    function genUid()
    {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    /**
     * Event handler for adding a new SSH session
     * to the session map and updating the sessions file.
     */
    ipcMain.handle('ssh:add-session', (_, session) =>
    {
        session.sessionUid = genUid();
        sessionMap.set(session.sessionUid, session);
        const newData = JSON.stringify(Array.from(sessionMap.values()));
        console.log(newData);
        // Schedule microtask
        Promise.resolve()
            .then(() => fs.promises.writeFile(sessionsFilePath, newData));
    });

    /**
     * Event handler for removing an SSH session from the session map,
     * and updating the sessions file.
     */
    ipcMain.handle('ssh:remove-session', (_, sessionUid) =>
    {
        if ( sessionMap.has(sessionUid) )
        {
            sessionMap.delete(sessionUid);
            // Schedule microtask
            Promise.resolve()
                .then(() => fs.promises.writeFile(sessionsFilePath, JSON.stringify(Array.from(sessionMap.values()))));
        }
    });

    /**
     * Function for checking if an SSH session is connected.
     * @param {string} sessionUid - The UID of the session to check.
     * @returns {boolean} - True if the session is connected, false otherwise.
     */
    function isConnected(sessionUid)
    {
        return activeSessions.has(sessionUid) && activeSessions.get(sessionUid).ssh.isConnected();
    }

    /**
     * Function for validating the data of an SSH session.
     * @param {IRemoteSessionProperties[]} sessionData - The session data to validate.
     * @returns {IRemoteSessionProperties[]} - The validated session data.
     */
    function validateData(sessionData)
    {
        // First, check if the provided parameter is of the correct type.
        if ( !Array.isArray(sessionData) || typeof sessionData[0] != 'object' )
            return [];

        let [ modifications, removals ] = [ 0, 0 ];

        for ( let i = sessionData.length - 1; i >= 0; i-- )
        {
            let session = sessionData[i];
            // Check if the session has a sessionUid property.
            if ( !session.hasOwnProperty('sessionUid') || typeof session.sessionUid !== 'string' )
            {
                session.sessionUid = genUid();
                modifications++;
            }

            // Check if the session has a port property.
            if ( !session.hasOwnProperty('port') || typeof session.port !== 'number' )
            {
                session.port = 22;
                modifications++;
            }

            // Check if the session has a host and password property.
            if ( ( !session.hasOwnProperty('host') || typeof session.host !== 'string') ||
                 ( !session.hasOwnProperty('username') || typeof session.username !== 'string') )
            {
                sessionData.splice(i, 1);
                removals++;
            }
        }

        // If any modifications are made to the file whilst validating,
        // write the new data to the file.
        if ( modifications > 0 || removals > 0 )
        {
            fs.promises.writeFile(sessionsFilePath, JSON.stringify(sessionData))
                .then(() => console.log(`Removed ${removals} and modified ${modifications} session(s) in the sessions file.`));
        }
        return sessionData;
    }

    /**
     * Event handler for loading all SSH sessions from the sessions file.
     */
    ipcMain.handle('ssh:load-sessions', async _ =>
    {
        return fs.promises.readFile(sessionsFilePath, { encoding: 'utf-8' })
            .then(data =>
            {
                // Parse the data and return the session entries,
                // validating the data in the process.
                let sessionEntries = validateData(JSON.parse(data));
                sessionMap.clear();
                sessionEntries.forEach(session =>
                    sessionMap.set(session.sessionUid.toString(), session));
                return sessionEntries;
            })
    });

    /**
     * Event handler for retrieving file info from a specific file
     */
    ipcMain.handle('ssh:file-info', (_, sessionUid, filePath) =>
    {
        if ( !isConnected(sessionUid) )
            return Promise.reject('Session not connected.');

        return activeSessions.get(sessionUid)
            /* Name Type Permissions(rwx) size(bytes) Modified(seconds) Created(seconds) */
            .ssh.execCommand(`stat -c "%n\n%F\n%A\n%s\n%Y\n%X" ${filePath}`)
            .then(result =>
            {
                let segments = result.stdout.split('\n');
                return {
                    name: segments[0],
                    path: filePath,
                    type: segments[1] === 'directory' ? 'directory' : filePath.split('.').pop(),
                    permissions: segments[2],
                    size: parseInt(segments[3]),
                    modified: parseInt(segments[4]),
                    created: parseInt(segments[5]),
                    hidden: segments[0].startsWith('.'),
                    isDirectory: segments[1] === 'directory',
                    isFile: segments[1] !== 'directory'
                }
            })
    })

    /**
     * Event handler for connecting to an SSH session.
     */
    ipcMain.handle('ssh:connect-session', async (event, sessionUid) =>
    {
        console.log("Connecting to session", sessionUid);
        if ( !sessionMap.has(sessionUid) )
            return Promise.reject('Session not found.');

        let session = sessionMap.get(sessionUid);
        let client = new NodeSSH();
        let onData = data => event.sender.send('ssh:data', data);
        event.sender.send('ssh:attempt-connect', sessionUid);
        return client.connect({
            host: session.host,
            username: session.username,
            privateKey: session.privateKey,
            password: session.password,
            passphrase: session.passphrase,
            tryKeyboard: true,
            onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish) =>
            {
                if ( prompts.length > 0 && prompts[0]['prompt'].toLowerCase().includes('password') )
                    finish([ session.password ]);

            }
        }).then(_ =>
        {
            console.log("Connected to session ", sessionUid);
            event.sender.send('ssh:connected', sessionUid);
            client.requestShell()
                .then(stream =>
                {
                    stream.on('data', data => onData(data.toString()));
                    stream.stderr.on('data', data => onData(data.toString()));

                })
            activeSessions.set(sessionUid, { ssh: client, onData: onData });
        })
    });

    /**
     * Event handler for disconnecting from an SSH session.
     */
    ipcMain.handle('ssh:disconnect', (_, sessionUid) =>
    {
        if ( activeSessions.has(sessionUid) )
        {
            activeSessions.get(sessionUid).ssh.dispose();
            activeSessions.delete(sessionUid);
        }
    });

    /**
     * Event handler for sending data to an SSH session.
     */
    ipcMain.handle('ssh:exec', (_, sessionUid, data) =>
    {
        if ( isConnected(sessionUid) )
            return Promise.resolve(activeSessions.get(sessionUid).ssh.execCommand(data)
                .then(result => result.stdout));
        return Promise.reject('Session not connected.');
    })

    /**
     * Event handler for uploading files to an SSH session.
     */
    ipcMain.handle('ssh:upload-files', (event, sessionUid, localFiles, remotePath) =>
    {
        if ( !isConnected(sessionUid) )
            return Promise.reject('Session not connected.');

        return activeSessions.get(sessionUid).ssh.putFiles(localFiles.map(file =>
        {
            return { local: file, remote: remotePath };
        }), {
            concurrency: 10,
            transferOptions: {
                step: (total_transferred, _, total) =>
                    event.sender.send('ssh:upload-progress', total_transferred, total)
            }
        });
    });

    /**
     * Event handler for downloading files from an SSH session.
     * @param {string} sessionUid - The UID of the session to download files from.
     * @param {string[]} remoteFiles - The paths of the files to download. These paths are absolute.
     * @param {string} localPath - The path to download the files to. This path must locate to a directory.
     */
    ipcMain.handle('ssh:download-files', (event, sessionUid, remoteFiles, localPath) =>
    {
        if ( !isConnected(sessionUid) )
            return Promise.reject('Session not connected.');

        return Promise.all(remoteFiles.map(remoteFilePath =>
        {
            let fileName = path.basename(remoteFilePath);
            return activeSessions.get(sessionUid).ssh.getFile(path.join(localPath, fileName), remoteFilePath, null, {
                step: (bytesTransferred, _, totalBytes) =>
                    event.sender.send('ssh:download-progress', bytesTransferred, totalBytes)
            })
        }));
    });

    /**
     * Event handler for listing files in a directory on an SSH session.
     */
    ipcMain.handle('ssh:list-files', (_, sessionUid, remotePath) =>
    {
        if ( !isConnected(sessionUid) )
            return Promise.reject('Session not connected.');

        return Promise.resolve(activeSessions.get(sessionUid).ssh.execCommand(`ls ${remotePath}`)
            .then(result => result.stdout.split('\n')));
    });

    /**
     * Event handler for getting the home directory of the user on an SSH session.
     */
    ipcMain.handle('ssh:home-dir', async (_, sessionUid) =>
    {
        if ( !isConnected(sessionUid) )
            throw new Error('Session not connected.');

        return await activeSessions.get(sessionUid).ssh.execCommand('echo $HOME')
            .then(result => result.stdout.trim());
    });

    /**
     * Event handler for deleting a file on an SSH session.
     */
    ipcMain.handle('ssh:delete-files', (event, sessionUid, remotePaths) =>
    {
        if ( !isConnected(sessionUid) )
            return Promise.reject('Session not connected.');
        let currentConnection = activeSessions.get(sessionUid).ssh;
        return Promise.all(remotePaths.map(remotePath =>
            currentConnection.execCommand(`rm -r ${remotePath}`)));
    })

    /**
     * Event handler for moving a file
     */
    ipcMain.handle('ssh:move-file', (event, sessionUid, source, destination) =>
    {
        if ( !isConnected(sessionUid) )
            return Promise.reject('Session not connected.');
        return activeSessions.get(sessionUid).ssh.execCommand(`mv ${source} ${destination}`);
    });

    /**
     * Event handler for checking if an SSH session is connected.
     */
    ipcMain.handle('ssh:is-connected', (_, sessionUid) => isConnected(sessionUid))
}

module.exports = __init;
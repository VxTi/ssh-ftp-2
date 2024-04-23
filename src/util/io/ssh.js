/**
 * @fileoverview This file contains the SSHConnection class which is used to create an
 * SSH connection to a remote server.
 */

const { Client, SFTPWrapper } = require('ssh2');
const path = require('path');
const fs = require('fs');
const { PromiseQueue } = require("sb-promise-queue");

/**
 * Map containing all registered SSH sessions
 * from local storage.
 * The key is the session UID and the value is the session object.
 * @type {Map<string, IRemoteSessionProperties>}
 */
const sessionMap = new Map();

const DEFAULT_FILE_VALIDATION = (fileName) => fileName.charAt(0) !== '.'

/**
 * Map containing all active SSH connections.
 * The key is the session UID and the value is the ssh2.Client object.
 * @type {Map<string, {client: Client, sftp: SFTPWrapper}>} */
const activeSessions = new Map();

const DEFAULT_CONCURRENCY = 5;

/**
 * Main initializer for handling SSH connections.
 * This function will register all necessary IPC handlers for handling
 * SSH connections.
 * @param {IpcMain} ipcMain - The IPC main object.
 * @param {Electron.App} app - The Electron app object.
 * @private
 */
function __init(ipcMain, app) {
    const sessionsFilePath = path.join(app.getPath('appData'), app.getName(), 'sessions.json');

    // Ensure the existence of the session file.
    if ( !fs.existsSync(sessionsFilePath) )
        fs.writeFileSync(sessionsFilePath, '[]');

    console.log("Registered event handlers for SSH functionality.");


    /**
     * Function for validating the data of an SSH session.
     * @param {IRemoteSessionProperties[]} sessionData - The session data to validate.
     * @returns {IRemoteSessionProperties[]} - The validated session data.
     */
    function validateSession(sessionData) {
        // First, check if the provided parameter is of the correct type.
        if ( !Array.isArray(sessionData) || typeof sessionData[0] != 'object' )
            return [];

        let [ modifications, removals ] = [ 0, 0 ];

        for ( let i = sessionData.length - 1; i >= 0; i-- ) {
            let session = sessionData[i];
            // Check if the session has a sessionUid property.
            if ( !session.hasOwnProperty('sessionUid') || typeof session.sessionUid !== 'string' ) {
                session.sessionUid = genUid();
                modifications++;
            }

            // Check if the session has a port property.
            if ( !session.hasOwnProperty('port') || typeof session.port !== 'number' ) {
                session.port = 22;
                modifications++;
            }

            // Check if the session has a host and password property.
            if ( ( !session.hasOwnProperty('host') || typeof session.host !== 'string') ||
                ( !session.hasOwnProperty('username') || typeof session.username !== 'string') ) {
                sessionData.splice(i, 1);
                removals++;
            }
        }

        // If any modifications are made to the file whilst validating,
        // write the new data to the file.
        if ( modifications > 0 || removals > 0 ) {
            fs.promises.writeFile(sessionsFilePath, JSON.stringify(sessionData))
                .then(() => console.log(`Removed ${removals} and modified ${modifications} session(s) in the sessions file.`));
        }
        return sessionData;
    }

    /**
     * Event handler for adding a new SSH session
     * to the session map and updating the sessions file.
     * This handler only appends the provided session object to the `sessionMap` object.
     */
    ipcMain.handle('ssh:add-session', (_, session) => {
        session.sessionUid = genUid();
        sessionMap.set(session.sessionUid, session);
        const newData = JSON.stringify(Array.from(sessionMap.values()));
        // Schedule microtask
        Promise.resolve()
            .then(() => fs.promises.writeFile(sessionsFilePath, newData));
    });

    /**
     * Event handler for removing an SSH session from the session map,
     * and updating the sessions file.
     */
    ipcMain.handle('ssh:remove-session', (_, sessionUid) => {
        if ( sessionMap.has(sessionUid) ) {
            sessionMap.delete(sessionUid);
            // Schedule microtask
            Promise.resolve()
                .then(() => fs.promises.writeFile(sessionsFilePath, JSON.stringify(Array.from(sessionMap.values()))));
        }
    });

    /**
     * Event handler for loading all SSH sessions from the sessions file.
     */
    ipcMain.handle('ssh:load-sessions', async _ => {
        return fs.promises.readFile(sessionsFilePath, { encoding: 'utf-8' })
            .then(data => {
                // Parse the data and return the session entries,
                // validating the data in the process.
                let sessionEntries = validateSession(JSON.parse(data));
                sessionMap.clear();
                sessionEntries.forEach(session =>
                    sessionMap.set(session.sessionUid.toString(), session));
                return sessionEntries;
            })
    });

    /**
     * Event handler for retrieving file info from a specific file
     */
    ipcMain.handle('ssh:file-info', (_, sessionUid, filePath) => {
        if ( !isConnected(sessionUid) )
            return Promise.reject('Session not connected.');

        return new Promise((resolve, reject) => {
            return activeSessions.get(sessionUid).sftp.stat(unixifyPath(filePath), (err, stats) => {
                if ( err )
                    reject(err);
                else
                    resolve({
                        name: path.basename(filePath),
                        path: filePath,
                        type: stats.isDirectory() ? 'directory' : filePath.split('.').pop(),
                        permissions: stats.mode.toString(8),
                        size: stats.size,
                        modified: stats.mtime,
                        created: stats.atime,
                        hidden: path.basename(filePath).startsWith('.'),
                        isDirectory: stats.isDirectory(),
                        isFile: !stats.isDirectory()
                    });
            })
        })
    })

    /**
     * Event handler for connecting to an SSH session.
     */
    ipcMain.handle('ssh:connect-session', async (event, sessionUid) => {
        console.log("Connecting to session", sessionUid);

        if ( !sessionMap.has(sessionUid) )
            throw new Error('Session not found.');

        if ( activeSessions.has(sessionUid) ) {
            event.sender.send('ssh:connected', sessionUid);
            return;
        }

        let session = sessionMap.get(sessionUid);
        let client = new Client({
            debug: (msg) => console.log('ssh2 | ' + msg)
        }); // Create client instance

        // Send event to web content to indicate that a connection is being attempted.
        event.sender.send('ssh:attempt-connect', sessionUid);

        client // Whenever the client is ready ( connected )
            .on('ready', () => {
                client.sftp((err, sftp) => {
                    if ( err )
                        event.sender.send('ssh:error', sessionUid, err);
                    else {
                        activeSessions.set(sessionUid, { client: client, sftp: sftp });
                        event.sender.send('ssh:connected', sessionUid);
                    }
                })
            }) // Whenever an error occurs
            .on('error', err => {
                console.log("Error occured whilst attempting to connect to remote server", err);
                activeSessions.delete(sessionUid);
                event.sender.send('ssh:error', sessionUid, err);
                event.sender.send('ssh:disconnected', sessionUid);
            }) // Whenever the connection ends
            .on('end', () => {
                activeSessions.delete(sessionUid);
                event.sender.send('ssh:disconnected', sessionUid);
            }) // Whenever the socket was closed ( connection closed )
            .on('close', () => {
                activeSessions.delete(sessionUid);
                event.sender.send('ssh:disconnected', sessionUid);
            }) // Whenever the server requests keyboard input
            .on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
                console.log(prompts);
                if ( prompts.length > 0 && prompts[0]['prompt'].toLowerCase().includes('password') )
                    finish([ session.password ]);
            })
            .connect({
                host: session.host,
                port: session.port,
                username: session.username,
                password: session.password,
                privateKey: session.privateKey,
                passphrase: session.passphrase,
                tryKeyboard: true
            })
    });

    /**
     * Event handler for disconnecting from an SSH session.
     */
    ipcMain.handle('ssh:disconnect', (_, sessionUid) => {
        if ( activeSessions.has(sessionUid) ) {
            let session = activeSessions.get(sessionUid);
            session.sftp.end();
            session.client.end();
            activeSessions.delete(sessionUid);
        }
    });

    /**
     * Event handler for sending data to an SSH session.
     */
    ipcMain.handle('ssh:exec', (_, sessionUid, data) => {
        return new Promise((resolve, reject) => {
            if ( !isConnected(sessionUid) )
                return reject('Session not connected.');

            activeSessions.get(sessionUid).client.exec(data, (err, stream) => {
                if ( err )
                    return reject(err);

                stream.on('error', (err) => reject(err));

                let result = { stdout: [], stderr: [], code: null, signal: null };

                // Whenever data is received, both stdout and stderr
                stream.on('data', (data) => result.stdout.push(data.toString()));
                stream.stderr.on('data', (data) => result.stderr.push(data.toString()));

                stream.on('exit', (code, signal) => {
                    result.code = code;
                    result.signal = signal;
                })
                stream.on('close', () => resolve({
                    stdout: result.stdout.join('').trim(),
                    stderr: result.stderr.join('').trim(),
                    code: result.code,
                    signal: result.signal
                }));
            })
        })
    })

    /**
     * Event handler for uploading files to an SSH session.
     */
    ipcMain.handle('ssh:upload-files', (event, sessionUid, localFilePaths, remotePath) => {
        if ( !isConnected(sessionUid) )
            return Promise.reject('Session not connected.');

        return new Promise((resolve, reject) => {

            let sftp = activeSessions.get(sessionUid).sftp;
            let promiseQueue = new PromiseQueue({ concurrency: DEFAULT_CONCURRENCY });

            console.log("Uploading files to", remotePath, localFilePaths);
            // Go through all provided paths and check whether it's a directory.
            // If it is, call the 'putDirectory' method, which recursively uploads
            // the contents of the folder, otherwise use 'putFile'
            localFilePaths.forEach(localPath =>
                promiseQueue.add(async () => await ((fs.lstatSync(localPath).isDirectory()) ?
                    putDirectory(sftp, localPath, remotePath)
                    : putFile(sftp, localPath, remotePath))
                    .catch(e => {
                        console.log("Error occurred whilst attempting to upload file to remote server", e);
                        reject(e)
                    })));
            promiseQueue.waitTillIdle()
                .then(resolve)
                .catch(e => {
                    console.log("Error occurred whilst attempting to upload file to remote server", e);
                    reject(e)
                })
        })
    });

    /**
     * Event handler for downloading files from an SSH session.
     * @param {string} sessionUid - The UID of the session to download files from.
     * @param {string[]} remoteFiles - The paths of the files to download. These paths are absolute.
     * @param {string} localPath - The path to download the files to. This path must locate to a directory.
     */
    ipcMain.handle('ssh:download-files', (event, sessionUid, remoteFiles, localPath) => {
        if ( !isConnected(sessionUid) )
            return Promise.reject('Session not connected.');

        localPath = unixifyPath(localPath); // unixify

        // Retrieve all files from remote server asynchronously
        return new Promise((resolve, reject) => {
            remoteFiles.forEach(async remoteFile =>
                getSftp(sessionUid).fastGet(unixifyPath(remoteFile), path.join(localPath, path.basename(remoteFile)), {
                    step: (total_transferred, _, total) =>
                        event.sender.send('ssh:download-progress', total_transferred, total, remoteFile)
                }, (err) => {
                    if ( err )
                        reject(err);
                    else
                        resolve();
                }))
        })
    });

    /**
     * Event handler for listing files in a directory on an SSH session.
     */
    ipcMain.handle('ssh:list-files', (_, sessionUid, remotePath) => {
        if ( !isConnected(sessionUid) )
            return Promise.reject('Session not connected.');

        return new Promise((resolve, reject) => {
            getSftp(sessionUid).readdir(unixifyPath(remotePath), (err, files) => {
                if ( err )
                    return reject(err);
                resolve(files.map(file => {
                    let fileType = file.longname[0] === 'd' ? 'directory' : file.filename.split('.').pop();
                    return {
                        name: file.filename,
                        type: fileType,
                        hidden: file.filename.charAt(0) === '.',
                        size: file.attrs.size,
                        dateModified: file.attrs.mtime,
                        permissions: file.longname.slice(1, 10),
                        path: path.join(remotePath, file.filename),
                        isFile: fileType !== 'directory',
                        isDirectory: fileType === 'directory',
                    }
                }));
            });
        })
    });

    /**
     * Event handler for getting the home directory of the user on an SSH session.
     */
    ipcMain.handle('ssh:home-dir', async (_, sessionUid) => {
        if ( !isConnected(sessionUid) )
            throw new Error('Session not connected.');

        return new Promise((resolve, reject) => {
            getSftp(sessionUid).realpath('', (err, path) => {
                if ( err )
                    reject(err);
                resolve(path);
            })
        })
    });

    /**
     * Event handler for deleting a file on an SSH session.
     */
    ipcMain.handle('ssh:delete-files', (event, sessionUid, remotePaths) => {
        if ( !isConnected(sessionUid) )
            return Promise.reject('Session not connected.');

        return new Promise((resolve, reject) => {
            remotePaths.forEach(async remotePath =>
                getSftp(sessionUid).unlink(unixifyPath(remotePath), (err) => {
                    if ( err )
                        return reject(err);
                    resolve();
                }))
        })
    })

    /**
     * Event handler for moving a file
     */
    ipcMain.handle('ssh:move-file', (event, sessionUid, source, destination) => {
        if ( !isConnected(sessionUid) )
            return Promise.reject('Session not connected.');
        return new Promise((resolve, reject) => {
            getSftp(sessionUid).rename(unixifyPath(source), unixifyPath(destination), (err) => {
                if ( err )
                    return reject(err);
                resolve();
            })
        })
    });

    /**
     * Event handler for checking if an SSH session is connected.
     */
    ipcMain.handle('ssh:is-connected', (_, sessionUid) => isConnected(sessionUid))
}

/**
 * Function for checking if an SSH session is connected.
 * @param {string} sessionUid - The UID of the session to check.
 * @returns {boolean} - True if the session is connected, false otherwise.
 */
function isConnected(sessionUid) {
    return activeSessions.has(sessionUid); // If the session is in the active sessions map, it is connected.
}

/**
 * Function for retrieving the SFTP protocol from the active sessions map.
 * @param {string} sessionUid - The UID of the session to retrieve the SFTP protocol from.
 * @returns {SFTPWrapper | null} - The SFTP protocol.
 */
function getSftp(sessionUid) {
    return activeSessions.get(sessionUid).sftp;
}

/**
 * Function for recursively reading paths from the local system.
 * This function skips hidden files.
 * @param {string} pathToCheck - The path to read.
 * @param {Function} fileValidation - The file filter. Default is skip hidden.
 * @param {string} previous - The previous path.
 * @returns {{directories: string[], files: string[]}} - The paths read from the local system.
 */
function getPaths(pathToCheck, previous = '/', fileValidation = DEFAULT_FILE_VALIDATION) {
    let data = { directories: [], files: [] }

    if ( fs.statSync(pathToCheck).isDirectory() ) {
        data.directories.push(path.join(previous, path.basename(pathToCheck)));
        fs.readdirSync(pathToCheck, { withFileTypes: true }).forEach(file => {
            if ( !fileValidation(file.name) )
                return;
            if ( file.isDirectory() ) {
                let innerContent = getPaths(path.join(pathToCheck, file.name), path.join(previous, path.basename(pathToCheck)));
                data.directories.push(...innerContent.directories);
                data.files.push(...innerContent.files);
            }
            else
                data.files.push(path.join(previous, path.basename(pathToCheck), file.name));
        });
    }
    else data.files.push(path.join(previous, path.basename(pathToCheck)));

    return data;
}

/**
 * Function for generating a unique identifier string.
 * This is used to identify sessions.
 * @returns {string} - The unique ID
 */
function genUid() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}

/**
 * Function for formatting the provided path to be unix-compatible
 * @param {string} path - The path to format
 * @returns {string} - The formatted path
 */
function unixifyPath(path) {
    if ( path.includes('\\') )
        return path.split('\\').join('/');
    return path
}

/**
 * Function for uploading a file to a provided SFTP server.
 * @param {SFTPWrapper} sftp - The SFTP Protocol to use
 * @param {string} localPath - The location of the path on the local system
 * @param {string} remotePath - The path where to upload the file to.
 * @returns {Promise<unknown>} - A promise that resolves once the file transfer was successful; rejection otherwise.
 */
async function putFile(sftp, localPath, remotePath) {
    console.log("Uploading regular file:", localPath, remotePath);
    return new Promise((resolve, reject) => {
        if ( fs.lstatSync(localPath).isDirectory() ) {
            console.log("Provided file was a directory")
            return reject('File at provided path is a directory');
        }

        sftp.fastPut(localPath, unixifyPath(remotePath), (err) => {
            if ( err ) {
                reject(err);
            }
            else {
                resolve();
            }
        })
    })
}

/**
 * Function for uploading the provided files to the remote server.
 * @param {SFTPWrapper} sftp - The SFTP Protocol to use
 * @param {{localPath: string, remotePath: string}[]} files - The files to upload.
 * @param {number} concurrency - How many files to concurrently upload to the remote server. Default is DEFAULT_CONCURRENCY (10)
 */
function putFiles(sftp, files, concurrency = DEFAULT_CONCURRENCY) {
    return new Promise((resolve, reject) => {
        let promiseQueue = new PromiseQueue({ concurrency: concurrency })
        files.forEach(target => async () =>
            putFile(sftp, target.localPath, target.remotePath));
        promiseQueue.waitTillIdle()
            .then(resolve)
            .catch(reject);
    });
}

/**
 * Function for checking whether the provided path contains a directory
 * @param {SFTPWrapper} sftp - The SFTP Protocol to use
 * @param {string} remotePath - The path to check
 * @returns {Promise<boolean>} - A promise that resolves with a boolean indicating
 * whether the provided path is a directory.
 */
function isDir(sftp, remotePath) {
    return new Promise((resolve, reject) => {
        sftp.stat(remotePath, (err, stats) => {
            if ( err )
                return reject();
            resolve(stats.isDirectory());
        })
    })
}

/**
 * Function for uploading all the contents of the provided directory to the server.
 * @param {SFTPWrapper} sftp - The SFTP Protocol to use
 * @param {string} localPath - The local path of the directory
 * @param {string} remotePath - The path to upload the directory and its contents to
 * @param {number} concurrency - How many files to concurrently upload to the remote server. Default is 10
 */
function putDirectory(sftp, localPath, remotePath, concurrency = DEFAULT_CONCURRENCY) {
    console.log("Uploading directory contents", localPath, remotePath)
    return new Promise(async (resolve, reject) => {
        if ( !fs.lstatSync(localPath).isDirectory() )
            return reject('File at provided path is not a directory');

        let paths = getPaths(localPath);
        paths.directories.sort((a, b) => a.length - b.length); // Sort on path length

        remotePath = unixifyPath(remotePath); // Convert to be unix-compatible

        // If no files were found at the provided path, resolve the promise.
        // Nothing needs to be done.
        if ( paths.directories.length === 0 && paths.files.length === 0 )
            return resolve();

        // Upload directories
        await new Promise((resolve2, _) => {
            let dPromiseQueue = new PromiseQueue({ concurrency: concurrency });
            paths.directories.forEach(dirPath => dPromiseQueue.add(async () => mkdir(sftp, dirPath, remotePath)));
            dPromiseQueue.waitTillIdle().then(resolve2);
        }).catch(reject);

        await new Promise((resolve2, _) => {
            let fPromiseQueue = new PromiseQueue({ concurrency: concurrency });
            paths.files.forEach(filePath => fPromiseQueue.add(async () => putFile(sftp, filePath, remotePath)));
            fPromiseQueue.waitTillIdle().then(resolve2);
        }).catch(reject);
        resolve();
    });
}

/**
 * Function for creating a directory on the remote server.
 * When the directory already exists, the returned promise will still resolve.
 * @param {SFTPWrapper} sftp - The SFTP protocol to use
 * @param {string} dirName - The name of the directory to create
 * @param {string} remotePath - The remote location to create the directory at
 * @returns {Promise<unknown>}
 */
function mkdir(sftp, dirName, remotePath) {
    return new Promise((resolve, reject) => {
        sftp.stat(dirName, (err, stats) => {

            // If the file was found and is a directory, no need to continue.
            if ( stats ) {
                if ( stats.isDirectory() )
                    return resolve();
                return reject('mkdir on remote server failed: File already exists and is not a directory.');
            }

            // If the directory does not exist,
            if ( err ) {
                sftp.mkdir(unixifyPath(path.join(remotePath, dirName)), (err) => {
                    if ( err )
                        return reject(err);
                    resolve();
                })
            }
        })
    })
}

module.exports = __init;
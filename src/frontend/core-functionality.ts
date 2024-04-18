/**
 * This file is used to define the core functionality of the application.
 */

import { setContentDefault } from "./window-content/window-content-manager";
import { assembleFileViewer } from "./window-content/main-session-file-viewer";
import { assembleSessionList } from "./window-content/sidebar-view-sessions";
import { LocalFileSystem } from "./util/file-management/local-file-system";
import { RemoteFileSystem } from "./util/file-management/remote-file-system";
import { AbstractFileSystem } from "./util/file-management/abstract-file-system";
import { appendTo, createElement } from "./util/element-assembler";
import { applyTheme, getThemes, loadThemes } from "./util/theme-manager";
import { AbstractFile } from "./util/file-management/abstract-file";
import { assembleFileEditor } from "./window-content/main-file-editor";

let localFileSystem: AbstractFileSystem;
let remoteFileSystem: AbstractFileSystem;

document.addEventListener('DOMContentLoaded', _ =>
{

    // Create navigator if the user is on a Mac
    if ( window[ 'app' ][ 'os' ].isMac )
    {
        let navigator = document.createElement('div');
        navigator.id = 'navigator';
        navigator.classList.add('navigator', 'border-bottom');
        document.body.prepend(navigator);
    }
    setContentDefault();
    assembleSessionList();
    loadThemes()
        .then((themes) => {
            if (themes.length > 0)
                applyTheme(themes[0]);
        })
});

/**
 * Event listener for when a session is created.
 * This event is called from `./util/ssh.js` when one attempts to connect
 * with it, when calling `window.app.sessions.connect(sessionUid)`
 */
window.addEventListener('session:attempt-connect', (event: CustomEvent) =>
{
    console.log("Attempting to connect to session with UID: ", event.detail.sessionUid);
    // Set all session elements to in-active
    // This is a temporary solution to prevent multiple connections
    document.querySelectorAll('session-element').forEach((element: HTMLElement) =>
    {
        element.setAttribute('inactive', '');
        element.removeAttribute('connecting');
        if ( element.getAttribute('sessionUid') === event.detail.sessionUid )
            element.setAttribute('connecting', '');
    })
})

/**
 * Event listener for when a user clicks outside a selected element.
 * This will remove the selected attribute from all elements.
 */
window.addEventListener('click', event =>
{
    if ( event.target instanceof HTMLElement && event.target.closest(':is([selected], .action)') === null )
        document.querySelectorAll('[selected]').forEach((element: HTMLElement) =>
            element.removeAttribute('selected'));
})

/**
 * Function to load files into a file viewer
 * with the given path, target element and file system.
 * @param path - The path to load files from.
 * @param targetElement - The target element to load files into.
 * @param fileSystem - The file system to load files from.
 */
function loadFiles(path: string, targetElement: HTMLElement, fileSystem: AbstractFileSystem)
{

    if ( !path || typeof path !== 'string' )
        throw new Error("'loadFiles' was called with an invalid path value.");

    targetElement.innerHTML = '';
    let prevDirFile = createElement('file-element', [], [], {}, {
        name: '..',
        path: path,
        'file-type': 'directory',
    });
    appendTo(targetElement, prevDirFile);
    prevDirFile.addEventListener('click', (event: MouseEvent) =>
    {
        let pathParts = path.split('/');
        pathParts.pop();
        let newPath = pathParts.join('/') || '/';
        console.log("Navigating to: ", newPath);
        if ( newPath !== path )
            loadFiles(newPath, targetElement, fileSystem);
    });
    fileSystem.listFiles(path)
        .then((files: AbstractFile[]) =>
        {
            files.forEach((file: AbstractFile) =>
            {
                if ( !file)
                {
                    console.error("File is undefined", files)
                    return;
                }

                if ( file.info?.hidden )
                    return;
                let foundFile = createElement('file-element', [], [], {}, {
                    name: file.name,
                    path: file.path,
                    'file-type': file.type
                })
                appendTo(targetElement, foundFile);
                foundFile.addEventListener('click', (event: MouseEvent) =>
                {
                    console.log("File clicked: ", file, path);
                    let nextPath = window[ 'app' ][ 'path' ].join(path, file.name);

                    if ( file.info.isDirectory )
                        loadFiles(nextPath, targetElement, fileSystem);
                    else fileSystem.readFile(nextPath)
                        .then(content => assembleFileEditor({
                            parameters: {
                                content: content,
                                fileType: file.type
                            },
                            previousWindowGenerator: assembleFileViewer,
                            previousWindowParameters: {

                            }
                        }));
                })
            });
        })
}

/**
 * Event listener for when a session is connected.
 * This event is emitted from `./util/ssh.js` when a connection is established.
 */
window[ 'app' ].handleEvent('ssh:connected', (sessionUid: string) =>
{
    document.querySelectorAll('session-element').forEach((element: HTMLElement) =>
    {
        element.removeAttribute('inactive');
        element.removeAttribute('connecting');
        if ( element.getAttribute('sessionUid') === sessionUid )
            element.setAttribute('connected', '');
    });
    // Assemble page
    assembleFileViewer();

    (async () =>
    {
        localFileSystem = new LocalFileSystem();
        remoteFileSystem = new RemoteFileSystem(sessionUid);
        /** Assemble the file system components */

        loadFiles(await localFileSystem.homeDirectory(), document.getElementById('localfs'), localFileSystem);
        loadFiles(await remoteFileSystem.homeDirectory(), document.getElementById('remotefs'), remoteFileSystem);
    })();
})

/**
 * Event listener for when a session is deleted.
 */
window.addEventListener('session:delete', () =>
{
    document.querySelectorAll('session-element[selected]').forEach((element: HTMLElement) =>
    {
        window[ 'app' ][ 'sessions' ].delete(element.getAttribute('sessionUid'))
            .then(() => element.remove());
    });
});

window.addEventListener('session:file-viewer:navigate', (event: CustomEvent) =>
{
    if ( event.detail.target === 'local' )
    {
        console.log("Navigating to local file system with path: ", event.detail.path);

    }
    else
    {
        console.log("Navigating to session with UID: ", event.detail.sessionUid, " and path: ", event.detail.path);
    }
})

window.addEventListener('file-viewer-action-interact', (event: CustomEvent) => {
    switch (event.detail)
    {
        case 'back':

            break;
        case 'forward':

            break;
        case 'view-icons':

            break;
        case 'view-rows':

            break;
        case 'add-file':

            break;
        case 'refresh':

            break;
        case 'delete-file':

            break;
        case 'home':

            break;
    }
})
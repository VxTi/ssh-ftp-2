import { showContent } from "../window-content-manager";
import {
    appendTo,
    attachFutureListener,
    CONTAINER_HORIZONTAL_CENTER,
    CONTAINER_LEFT_RIGHT,
    CONTAINER_RIGHT_LEFT,
    CONTAINER_TOP_BOTTOM,
    createElement
} from "../../util/element-assembler";
import { IFrameState } from "../../util/IFrameState";
import { IAbstractFileSystem } from "../../util/file/IAbstractFileSystem";
import { AbstractFile } from "../../util/file/AbstractFile";
import { LocalFileSystem } from "../../util/file/LocalFileSystem";
import { RemoteFileSystem } from "../../util/file/RemoteFileSystem";
import { notify } from "../notification";

/**
 * File system instances for the local and remote file systems.
 */
let localFileSystem: IAbstractFileSystem = null;
let remoteFileSystem: IAbstractFileSystem = null;

/**
 * The maximum number of items to keep in the window activity history.
 * If no maximum is set, it might result in a memory leak on long-running applications
 * or low memory devices.
 */
const MAX_WINDOW_ACTIVITY_HISTORY = 25;

/**
 * Function for generating the file viewer.
 */
export function assembleFileViewer(frameContext: IFrameState)
{
    /*
     * Attach event listeners to the action buttons.
     * These will dispatch custom events to the window object in
     * the format of 'file-viewer:<action>'.3
     */
    [ 'back', 'forward', 'view-icons', 'view-rows', 'add-file', 'refresh', 'delete-file', 'home' ]
        .forEach(action =>
            attachFutureListener(`action-${action}`, 'click', _ => handleActionEvent(action)));


    appendTo(frameContext.container,
        /* Action container */
        createElement('div', [ 'container', 'align-horizontal', 'main-space-between', 'cross-start', 'border-bottom', 'bg-secondary', 'fit-v-content' ], [
            /* Navigation actions */
            createElement('div', CONTAINER_LEFT_RIGHT, [
                createElement('span', [ 'action', 'action-back' ], [], { title: 'Go back', id: 'action-back' }),
                createElement('span', [ 'action', 'action-forward' ], [], {
                    title: 'Go forward',
                    id: 'action-forward'
                }),
            ]),
            /* File actions */
            createElement('div', CONTAINER_RIGHT_LEFT, [
                    /* View mode container */
                    createElement('div', [ ...CONTAINER_HORIZONTAL_CENTER, 'view-mode-container' ], [
                        /* View mode icons */
                        createElement('span', [ 'action', 'view-mode-icons' ], [], {
                            title: 'Icons',
                            id: 'action-view-icons'
                        }),
                        /* View mode rows */
                        createElement('span', [ 'action', 'view-mode-rows' ], [], {
                            title: 'Rows',
                            id: 'action-view-rows'
                        }),
                    ]),

                    createElement('span', [ 'action', 'action-add' ], [], { title: 'Add file', id: 'action-add-file' }),
                    createElement('span', [ 'action', 'action-refresh' ], [], {
                        title: 'Refresh',
                        id: 'action-refresh'
                    }),
                    createElement('span', [ 'action', 'action-home' ], [], {
                        id: 'action-home',
                        title: 'Go to home directory'
                    }),
                    createElement('span', [ 'action', 'action-delete' ], [], {
                        title: 'Delete',
                        id: 'action-delete-file'
                    }),
                ]
            ),
        ]),
        /* File viewer container */
        createElement('div', [ ...CONTAINER_LEFT_RIGHT, 'grow-1', 'scroll' ], [

            createElement('div', [ ...CONTAINER_TOP_BOTTOM, 'border-right', 'file-pre-container' ], [
                /* Local file system container */
                createElement('div', [ ...CONTAINER_TOP_BOTTOM, 'full-width', 'file-container' ], [], { id: 'localfs' }),
            ]),

            createElement('div', [ ...CONTAINER_TOP_BOTTOM, 'file-pre-container' ], [
                /* Remote file system container */
                createElement('div', [ ...CONTAINER_TOP_BOTTOM, 'full-width', 'file-container' ], [], { id: 'remotefs' })
            ])

        ]),
        /* Terminal container */
        createElement('div', [ 'container', 'align-vertical', 'main-start', 'border-top', 'terminal', 'resize-vertical' ], [
            /* Open terminal windows container */
            createElement('div', [ ...CONTAINER_LEFT_RIGHT, 'full-width', 'bg-secondary' ], [
                createElement('div', [ 'terminal-tab' ])
            ]),
            /* Main terminal content */
            createElement('div', [ ...CONTAINER_LEFT_RIGHT, 'full-width', 'full-height', 'terminal-content' ], [], { id: 'terminal-content' })
        ], { id: 'terminal' })
    );
    document.querySelectorAll('.terminal-tab')
        .forEach((tab: HTMLElement) => tab.innerText = 'Terminal')

    if ( localFileSystem !== null && remoteFileSystem !== null )
    {
        console.warn("Navigating to paths upon creation")
        navigateTo(frameContext.parameters[ 'localCwd' ], localFileSystem, document.getElementById('localfs'));
        navigateTo(frameContext.parameters[ 'remoteCwd' ], remoteFileSystem, document.getElementById('remotefs'));
    }
}

/**
 * Function for navigating through a file system.
 */
export function navigateTo(path: string, fileSystem: IAbstractFileSystem, targetElement: HTMLElement)
{
    if ( !path || typeof path !== 'string' || !fileSystem || !targetElement )
        throw new Error("'loadFiles' was called with invalid parameters.");

    fileSystem.cwd = path;
    targetElement.innerHTML = '';

    let prevDirFile = createElement('file-element', [], [], {}, {
        name: '..', path: path, 'file-type': 'directory',
    });
    appendTo(targetElement, prevDirFile);
    prevDirFile.addEventListener('click', (event: MouseEvent) =>
    {
        let pathParts = path.split('/');
        pathParts.pop();
        let newPath = pathParts.join('/') || '/';
        if ( newPath !== path )
            navigateTo(newPath, fileSystem, targetElement);
    });

    // List all files in the provided path
    // on the provided file system and show them on the page.
    fileSystem
        .listFiles(path)
        .then((files: AbstractFile[]) => files.filter(file => !file.info?.hidden))
        .then(files => files.forEach(file =>
            createFileElement(file, targetElement, path, fileSystem)))
        .catch(error =>
        {
            console.error('Error whilst attempting to list files:', error);
            targetElement.innerHTML = '';
        });
}

/**
 * Function for creating a file element.
 */
function createFileElement(file: AbstractFile, targetElement: HTMLElement, path: string, fileSystem: IAbstractFileSystem)
{
    let newElement = createElement('file-element', [], [], {}, {
        name: file.name,
        path: file.path,
        'file-type': file.type
    })
    appendTo(targetElement, newElement);
    newElement.addEventListener('click', (event: MouseEvent) =>
    {
        let nextPath = window[ 'app' ][ 'path' ].join(path, file.name);

        if ( file.info.isDirectory )
            navigateTo(nextPath, fileSystem, targetElement);
        else
        {
            fileSystem.readFile(nextPath)
                .then(content =>
                    {
                        showContent('file-editor', {
                            parameters: { content: content, fileType: file.type },
                            container: document.getElementById('inner-content'),
                            previousWindowId: 'file-viewer',
                            previousWindowParameters: {
                                localCwd: localFileSystem.cwd,
                                remoteCwd: remoteFileSystem.cwd,
                            }
                        })
                    }
                );
        }
    });
}

/**
 * Event listener for when a session is connected.
 * This event is emitted from `./util/ssh.js` when a connection is established.
 */
window[ 'app' ].handleEvent('ssh:connected', async (sessionUid: string) =>
{
    document.querySelectorAll('session-element').forEach((element: HTMLElement) =>
    {
        element.removeAttribute('inactive');
        element.removeAttribute('connecting');
        if ( element.getAttribute('sessionUid') === sessionUid )
            element.setAttribute('connected', '');
    });

    // Assemble page
    showContent('file-viewer', {
        container: document.getElementById('inner-content')
    });

    localFileSystem = new LocalFileSystem();
    remoteFileSystem = new RemoteFileSystem(sessionUid);

    let [ localCwd, remoteCwd ] = [
        await localFileSystem.homeDirectory(),
        await remoteFileSystem.homeDirectory()
    ];

    /** Assemble the file system components */
    navigateTo(localCwd, localFileSystem, document.getElementById('localfs'));
    navigateTo(remoteCwd, remoteFileSystem, document.getElementById('remotefs'));
})

/**
 * Function for handling file viewer actions.
 * @param action - The action to handle.
 */
function handleActionEvent(action: string)
{
    notify(action, 'warning');
}
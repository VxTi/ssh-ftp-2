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

/**
 * File system instances for the local and remote file systems.
 */
let localFileSystem: IAbstractFileSystem = null;
let remoteFileSystem: IAbstractFileSystem = null;

let currentSessionUid: string = null;

/**
 * The maximum number of items to keep in the window activity history.
 * If no maximum is set, it might result in a memory leak on long-running applications
 * or low memory devices.
 */
const MAX_WINDOW_ACTIVITY_HISTORY = 25;

/**
 * Function for generating the file viewer.
 */
export function assembleFileViewer(frameContext: IFrameState) {
    /*
     * Attach event listeners to the action buttons.
     * These will dispatch custom events to the window object in
     * the format of 'file-viewer:<action>'.3
     */
    [ 'back', 'forward', 'view-icons', 'view-rows', 'add-file', 'refresh', 'delete-file', 'home' ]
        .forEach(action =>
            attachFutureListener(`action-${action}`, 'click', event => handleActionEvent(action, event.target as HTMLElement)));

    attachFutureListener('fs-search-local', 'keydown', (event: KeyboardEvent) => {
        let target = event.target as HTMLInputElement;
        if ( event.key === 'Enter' )
        {
            navigateTo(target.value, localFileSystem, document.getElementById('localfs'), () => {
                target.value = localFileSystem.cwd;
            });
        }
    })

    attachFutureListener('fs-search-remote', 'keydown', (event: KeyboardEvent) => {
        let target = event.target as HTMLInputElement;
        if ( event.key === 'Enter' )
        {
            navigateTo(target.value, remoteFileSystem, document.getElementById('remotefs'), () => {
                target.value = remoteFileSystem.cwd;
            });
        }
    })


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
                        createElement('span', [ 'action', 'viewmode', 'view-mode-icons' ], [], {
                            title: 'Icons',
                            id: 'action-view-icons'
                        }),
                        /* View mode rows */
                        createElement('span', [ 'action', 'viewmode', 'view-mode-rows' ], [], {
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
                createElement('input', [ 'fs-search' ], [], { placeholder: 'Search', id: 'fs-search-local' }),
                /* Local file system container */
                createElement('div', [ ...CONTAINER_TOP_BOTTOM, 'full-width', 'file-container' ], [], { id: 'localfs' }),
            ], { id: 'fs-container-local' }),

            createElement('div', [ ...CONTAINER_TOP_BOTTOM, 'file-pre-container' ], [
                createElement('input', [ 'fs-search' ], [], { placeholder: 'Search', id: 'fs-search-remote' }),
                /* Remote file system container */
                createElement('div', [ ...CONTAINER_TOP_BOTTOM, 'full-width', 'file-container' ], [], { id: 'remotefs' })
            ], { id: 'fs-container-remote' })

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

    configureDragAndDrop(document.getElementById('fs-container-local'), 'local');
    configureDragAndDrop(document.getElementById('fs-container-remote'), 'remote');
}

/**
 * Function for configuring drag and drop events on a given element.
 * This function will add event listeners for dragover, dragleave, dragend, and drop.
 * @param element - The element to configure drag and drop events on.
 * @param location - The location of the file system. This can be 'local' or 'remote'.
 */
function configureDragAndDrop(element: HTMLElement, location: 'local' | 'remote') {

    element
        .addEventListener('dragover', (event: DragEvent) => {
            event.preventDefault()
            if ( event.dataTransfer.getData('text/plain') != location )
                element.setAttribute('drag-over', '');
        });
    element
        .addEventListener('dragleave', () => element.removeAttribute('drag-over'));
    element
        .addEventListener('dragend', () => element.removeAttribute('drag-over'));

    element
        .addEventListener('drop', (event: DragEvent) => {
            element.removeAttribute('drag-over');
            event.preventDefault();
            event.stopPropagation();
            let fileOrigin = event.dataTransfer.getData('text/plain');
            if ( fileOrigin === location )
                return;

            let data = JSON.parse(event.dataTransfer.getData('application/json'));

            let [ fsFrom, fsTo ] = fileOrigin === 'local' ?
                [ localFileSystem, remoteFileSystem ] : [ remoteFileSystem, localFileSystem ];

            let targetContainer = document.getElementById(
                location === 'local' ? 'localfs' : 'remotefs'
            )

            fsFrom.moveFile(data.path, fsTo.cwd, fsTo)
                .then(() => reloadFileSystem(fsTo, targetContainer))
                .catch(error => console.error("Error whilst moving files:", error));

        });
}

/**
 * Function for navigating through a file system.
 * This function will retrieve all files on the provided path in the provided file system
 * and display them on the provided target element.
 * @param path - The path to navigate to.
 * @param fileSystem - The file system to navigate on.
 * @param targetElement - The element to display the files on.
 * @param onFailure - The function to call if the navigation fails.
 */
export function navigateTo(path: string, fileSystem: IAbstractFileSystem, targetElement: HTMLElement, onFailure = () => {}) {
    if ( !path || typeof path !== 'string' || !fileSystem || !targetElement )
        throw new Error("'loadFiles' was called with invalid parameters.");

    // List all files in the provided path
    // on the provided file system and show them on the page.
    fileSystem
        .listFiles(path)
        .then((files: AbstractFile[]) => files.filter(file => !file.info?.hidden))
        .then(files => {

            targetElement.innerHTML = '';

            fileSystem.cwd = path;

            let prevDirFile = createElement('file-element', [], [], {}, {
                name: '..', path: path, 'file-type': 'directory',
            });
            appendTo(targetElement, prevDirFile);
            prevDirFile.addEventListener('dblclick', (event: MouseEvent) => {
                let pathParts = path.split('/');
                pathParts.pop();
                let newPath = pathParts.join('/') || '/';
                if ( newPath !== path )
                    navigateTo(newPath, fileSystem, targetElement);
            });
            files.forEach(file =>
                createFileElement(file, targetElement, path, fileSystem));

        })
        .catch(onFailure);
}

/**
 * Function for creating a file element and appending
 * it to the provided target element.
 */
function createFileElement(file: AbstractFile, targetElement: HTMLElement, path: string, fileSystem: IAbstractFileSystem) {
    let fileElement = createElement('file-element', [], [], {}, {
        name: file.name,
        path: file.path,
        'file-type': file.type
    })
    appendTo(targetElement, fileElement);

    // Drag and drop event listeners
    fileElement.addEventListener('dragstart', (event: DragEvent) => {
        if ( file.name === '..' ) {
            event.preventDefault();
            return;
        }
        let origin = fileSystem instanceof LocalFileSystem ? 'local' : 'remote';
        event.dataTransfer.setData('text/plain', origin);
        event.dataTransfer.setData('application/json', JSON.stringify({ name: file.name, path: file.path }));
        event.dataTransfer.dropEffect = 'move';
        console.log(event.dataTransfer.getData('text/plain'), event.dataTransfer.getData('application/json'));
    })

    fileElement.addEventListener('click', (event: MouseEvent) =>
        fileElement.setAttribute('selected', ''))

    fileElement.addEventListener('dblclick', (event: MouseEvent) => {
        let nextPath = window[ 'app' ][ 'path' ].join(path, file.name);

        if ( file.info.isDirectory )
            navigateTo(nextPath, fileSystem, targetElement);
        else {
            fileSystem.readFile(nextPath)
                .then(content => {
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
window[ 'app' ].handleEvent('ssh:connected', async (sessionUid: string) => {
    document.querySelectorAll('session-element').forEach((element: HTMLElement) => {
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

    currentSessionUid = sessionUid;

    let [ localCwd, remoteCwd ] = [
        await localFileSystem.homeDirectory(),
        await remoteFileSystem.homeDirectory()
    ];

    let fsSearchLocal = document.getElementById('fs-search-local') as HTMLInputElement;
    let fsSearchRemote = document.getElementById('fs-search-remote') as HTMLInputElement;

    localFileSystem.cwd = localCwd;
    fsSearchLocal.value = localCwd;

    remoteFileSystem.cwd = remoteCwd;
    fsSearchRemote.value = remoteCwd;

    /** Assemble the file system components */
    navigateTo(localCwd, localFileSystem, document.getElementById('localfs'));
    navigateTo(remoteCwd, remoteFileSystem, document.getElementById('remotefs'));
})

/**
 * Function for handling file viewer actions.
 * @param action - The action to handle.
 * @param element - The element associated with the event.
 */
function handleActionEvent(action: string, element: HTMLElement) {
    switch ( action ) {
        case 'view-rows':
            setViewMode('rows');
            break;
        case 'view-icons':
            setViewMode('icons');
            break;
        case 'delete-file':
            let selected = document.querySelectorAll('file-element[selected]');
            if ( selected.length === 0 )
                return;

            window[ 'app' ][ 'sessions' ][ 'fs' ].delete(
                currentSessionUid,
                Array.from(selected).map((element: HTMLElement) => element.getAttribute('path'))
            ).then(() => reloadFileSystem(remoteFileSystem, document.getElementById('remotefs')))
                .catch(error => console.error("Error whilst deleting files:", error));
            break;
    }
}

/**
 * Function for setting the viewing mode of the file viewer.
 * @param viewmode - The viewing mode of the file viewer. This can be 'icons' or 'rows'.
 */
function setViewMode(viewmode: 'icons' | 'rows') {
    // Update the attribute indicating which viewing mode the file containers have
    document.querySelectorAll('.file-container')
        .forEach(element => element.setAttribute('viewmode', 'icons'))
    // Set the appropriate element to be active
    document.querySelectorAll('.action.viewmode')
        .forEach(element => element.setAttribute('selected', 'false'));

    document
        .getElementById(viewmode === 'icons' ? 'action-view-icons' : 'action-view-rows')
        .setAttribute('selected', 'true');

}

function reloadFileSystem(fileSystem: IAbstractFileSystem, targetElement: HTMLElement) {
    navigateTo(fileSystem.cwd, fileSystem, targetElement);
}



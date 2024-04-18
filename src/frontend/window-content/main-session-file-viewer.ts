import { clearWindowContent } from "./window-content-manager";
import {
    appendTo,
    attachFutureListener,
    CONTAINER_HORIZONTAL_CENTER,
    CONTAINER_LEFT_RIGHT,
    CONTAINER_RIGHT_LEFT,
    CONTAINER_TOP_BOTTOM,
    createElement
} from "../util/element-assembler";

/**
 * Function for generating the file viewer.
 */
export function assembleFileViewer()
{
    clearWindowContent('inner-content');

    /*
     * Attach event listeners to the action buttons.
     * These will dispatch custom events to the window object in
     * the format of 'file-viewer:<action>'.3
     */
    [ 'back', 'forward', 'view-icons', 'view-rows', 'add-file', 'refresh', 'delete-file', 'home' ]
        .forEach(action =>
            attachFutureListener(`action-${action}`, 'click', _ =>
                window.dispatchEvent(new CustomEvent('file-viewer-action-interact', { detail: action }))));

    // TODO - Fix the file content containers to be scrollable and not overflow.

    appendTo(document.getElementById('inner-content'),
        /* Action container */
        createElement('div', [ 'container', 'align-horizontal', 'main-space-between', 'cross-start', 'border-bottom', 'bg-secondary' ], [
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
                    createElement('span', [ 'action', 'action-home'], [], {
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

            createElement('div', [...CONTAINER_TOP_BOTTOM, 'file-pre-container'], [
                /* Remote file system container */
                createElement('div', [ ...CONTAINER_TOP_BOTTOM, 'full-width', 'file-container' ], [], { id: 'remotefs' })
            ])

        ]),
        /* Terminal container */
        createElement('div', [ 'container', 'align-vertical', 'main-start', 'border-top', 'terminal' ], [
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
}
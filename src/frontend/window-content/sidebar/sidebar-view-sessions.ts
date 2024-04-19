/**
 * @module session-list
 */
import { showContent } from "../window-content-manager";
import { RemoteSession } from "../../sessions/RemoteSession";
import {
    appendTo,
    attachFutureListener,
    CONTAINER_HORIZONTAL_CENTER,
    CONTAINER_LEFT_RIGHT,
    CONTAINER_TOP_BOTTOM,
    createElement
} from "../../util/element-assembler";
import { IFrameState } from "../../util/IFrameState";

/**
 * Function to assemble the session list.
 * @param frameContext The initialization
 */
export function assembleSessionList(frameContext: IFrameState)
{
    // When clicked on the 'Add session' button, show the 'create-session' window
    attachFutureListener('action-add-session', 'click', () => showContent('create-session', {
        container: document.getElementById('side-container'),
        previousWindowId: 'sessions-list',
        previousWindowParameters: frameContext.parameters
    }));
    attachFutureListener('action-delete-session', 'click', _ =>
        window.dispatchEvent(new CustomEvent('session:delete')));
    attachFutureListener('action-refresh-sessions', 'click', _ =>
    {
        document.getElementById('side-container')
            .querySelectorAll('session-element')
            .forEach((element: HTMLElement) => element.remove());

        loadSessionList(document.getElementById('session-list-container'));
    });

    /* Add the selected attribute to the search input and focus the textbox */
    attachFutureListener('action-search-session', 'click', _ =>
    {
        document.getElementById('action-search-session')
            .setAttribute('selected', '');
        let inputBox = document.getElementById('search-input-session');
        inputBox.focus();
        inputBox.addEventListener('blur', () => (inputBox as HTMLInputElement).value = '');
    });
    attachFutureListener('search-input-session', 'input', event =>
    {
        let searchValue = (event.target as HTMLInputElement).value;
        document.getElementById('side-container')
            .querySelectorAll('session-element')
            .forEach((element: HTMLElement) =>
            {
                if ( element.getAttribute('username').includes(searchValue) )
                    element.removeAttribute('hidden');
                else
                    element.setAttribute('hidden', '');
            });
    })

    /** Side container content */
    appendTo(frameContext.container,
        /* Action container */
        createElement('div', [ ...CONTAINER_HORIZONTAL_CENTER, 'nowrap', 'grow-1', 'sidebar-action-container', 'fit-v-content' ], [
            /* Actions */

            /* 'Add Session' container (icon and text) */
            createElement('div', [ ...CONTAINER_LEFT_RIGHT, 'action', 'grow-1', 'action-add-container', 'round-5' ], [
                createElement('span', [ 'icon', 'rect-fit-vertical', 'action-add' ]),
                createElement('span', [ ...CONTAINER_HORIZONTAL_CENTER, 'grow-1' ], [], { textContent: 'Add session' })
            ], { id: 'action-add-session', title: 'Add a new session' }),

            /* Search input container */
            createElement('div', [ ...CONTAINER_LEFT_RIGHT, 'action', 'action-search-container', 'round-5' ], [
                createElement('span', [ 'icon', 'rect-fit-vertical', 'action-search' ]),
                createElement('input', [ 'search-input' ], [], {
                    id: 'search-input-session',
                    title: 'Search session'
                })
            ], { id: 'action-search-session', title: 'Search session' }),
            createElement('div', [ 'action', 'action-refresh' ], [], {
                id: 'action-refresh-sessions',
                title: 'Reload session page'
            }),
            createElement('div', [ 'action', 'action-delete' ], [], {
                id: 'action-delete-session',
                title: 'Delete selected session'
            })
        ]),

        /* Container with border */
        createElement('div', [ ...CONTAINER_TOP_BOTTOM, 'holding-container', 'cross-center', 'h-max-500' ], [
            /* Title */
            createElement('h3', [], [], { textContent: 'Sessions' }),
        ], { id: 'session-list-container' }),
    );

    loadSessionList(document.getElementById('session-list-container'));
}

/**
 * Function to load the session list.
 * @param targetContainer The container to load the session list into.
 */
function loadSessionList(targetContainer: HTMLElement)
{

    window[ 'app' ][ 'sessions' ].get()
        .then((sessions: RemoteSession[]) =>
        {
            sessions.forEach(session =>
            {

                let sessionElement = document.createElement('session-element');
                sessionElement.setAttribute('username', session.username);
                sessionElement.setAttribute('host', session.host);
                sessionElement.setAttribute('port', (session.port || 22).toString());
                sessionElement.setAttribute('sessionUid', session.sessionUid.toString());
                targetContainer.appendChild(sessionElement);
            })
        });
}

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
/**
 * This file is used to define the core functionality of the application.
 */

import { clearWindowContent, setContentDefault } from "./window-content/window-content-manager";
import { assembleFileViewer } from "./window-content/session-file-viewer";
import { assembleSessionList } from "./window-content/session-view-list";

document.addEventListener('DOMContentLoaded', _ => {

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
});

window.addEventListener('session:request-connect', (event: CustomEvent) => {
    console.log("Attempting to connect to session with UID: ", event.detail.sessionUid);

    // Set all session elements to in-active
    // This is a temporary solution to prevent multiple connections
    document.querySelectorAll('session-element').forEach((element: HTMLElement) =>
    {
        element.setAttribute('inactive', '');
        if ( element.hasAttribute('connecting'))
            element.removeAttribute('connecting');
        if ( element.getAttribute('sessionUid') === event.detail.sessionUid )
            element.setAttribute('connecting', '');
    })

    // Simulate connection
    setTimeout(_ => window.dispatchEvent(new CustomEvent('session:connected', {
        detail: {
            sessionUid: event.detail.sessionUid
        }
    })), 1000);
})

/**
 * Event listener for when a user clicks outside a selected element.
 * This will remove the selected attribute from all elements.
 */
window.addEventListener('click', event => {
    if ( event.target instanceof HTMLElement && event.target.closest(':is([selected], .action)') === null )
        document.querySelectorAll('[selected]').forEach((element: HTMLElement) =>
            element.removeAttribute('selected'));
})

// Event listener for when a session is connected
window.addEventListener('session:connected', (event: CustomEvent) => {
    console.log("Connected to session with UID: ", event.detail.sessionUid);
    document.querySelectorAll('session-element').forEach((element: HTMLElement) =>
    {
        element.removeAttribute('inactive');
        if ( element.hasAttribute('connecting'))
            element.removeAttribute('connecting');
        if ( element.getAttribute('sessionUid') === event.detail.sessionUid )
            element.setAttribute('connected', '');
    });
    // Assemble page
    assembleFileViewer();
});

/**
 * Event listener for when a session is deleted.
 */
window.addEventListener('session:delete', () => {
    document.querySelectorAll('session-element[selected]').forEach((element: HTMLElement) =>
    {
        window[ 'app' ][ 'sessions' ].delete(element.getAttribute('sessionUid'));
        element.remove();
    });
});


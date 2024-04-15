/**
 * @module session-list
 */
import { clearWindowContent } from "./window-content-manager";
import { RemoteSession } from "../sessions/remote-session";
import { assembleAddSessionMenu } from "./session-add-new";
import {
    appendTo,
    attachFutureListener,
    CONTAINER_HORIZONTAL_CENTER,
    CONTAINER_LEFT_RIGHT,
    CONTAINER_TOP_BOTTOM,
    createElement
} from "../util/element-assembler";

/**
 * Function to assemble the session list.
 * @param loadFromStorage Whether to load the session list from the local storage object.
 * Default is false.
 */
export function assembleSessionList()
{
    clearWindowContent( 'side-container' ); // Clear the side container

    attachFutureListener( 'action-add-session', 'click', assembleAddSessionMenu );
    attachFutureListener( 'action-delete-session', 'click', _ =>
        window.dispatchEvent( new CustomEvent( 'session:delete' ) ) );
    attachFutureListener( 'action-refresh-sessions', 'click', _ =>
    {
        document.getElementById( 'side-container' )
            .querySelectorAll( 'session-element' )
            .forEach( (element: HTMLElement) => element.remove() );

        loadSessionList( document.getElementById('session-list-container') );
    } );

    /* Add the selected attribute to the search input and focus the textbox */
    attachFutureListener( 'action-search-session', 'click', _ =>
    {
        document.getElementById( 'action-search-session' )
            .setAttribute( 'selected', '' );
        let inputBox = document.getElementById( 'search-input-session' );
        inputBox.focus();
        inputBox.addEventListener('blur', () => (inputBox as HTMLInputElement).value = '' );
    } )

    appendTo( document.getElementById( 'side-container' ),
            /* Action container */
            createElement( 'div', [ ...CONTAINER_HORIZONTAL_CENTER, 'nowrap', 'grow-1', 'sidebar-action-container' ], [
                /* Actions */

                /* 'Add Session' container (icon and text) */
                createElement( 'div', [ ...CONTAINER_LEFT_RIGHT, 'action', 'grow-1', 'action-add-container', 'round-5' ], [
                    createElement( 'span', [ 'icon', 'rect-fit-vertical', 'action-add' ] ),
                    createElement( 'span', [ ...CONTAINER_HORIZONTAL_CENTER, 'grow-1' ], [], { textContent: 'Add session' } )
                ], { id: 'action-add-session', title: 'Add a new session' } ),

                /* Search input container */
                createElement( 'div', [ ...CONTAINER_LEFT_RIGHT, 'action', 'action-search-container', 'round-5' ], [
                    createElement( 'span', [ 'icon', 'rect-fit-vertical', 'action-search' ] ),
                    createElement( 'input', [ 'search-input' ], [], {
                        id: 'search-input-session',
                        title: 'Search session'
                    } )
                ], { id: 'action-search-session', title: 'Search session' } ),
                createElement( 'div', [ 'action', 'action-refresh' ], [], {
                    id: 'action-refresh-sessions',
                    title: 'Reload session page'
                } ),
                createElement( 'div', [ 'action', 'action-delete' ], [], {
                    id: 'action-delete-session',
                    title: 'Delete selected session'
                } )
            ] ),

        /* Container with border */
        createElement( 'div', [ ...CONTAINER_TOP_BOTTOM, 'holding-container' ], [
            /* Title */
            createElement( 'h3', [], [], { textContent: 'Sessions' } ),
        ], { id: 'session-list-container' } ),
    );

    loadSessionList( document.getElementById('session-list-container') );
}

/**
 * Function to load the session list.
 * @param targetContainer The container to load the session list into.
 */
function loadSessionList(targetContainer: HTMLElement)
{

    window[ 'app' ][ 'sessions' ].get()
        .then( (sessions: RemoteSession[]) =>
        {
            sessions.forEach( session =>
            {

                let sessionElement = document.createElement( 'session-element' );
                sessionElement.setAttribute( 'username', session.username );
                sessionElement.setAttribute( 'host', session.host );
                sessionElement.setAttribute( 'port', (session.port || 22).toString() );
                sessionElement.setAttribute( 'sessionUid', session.sessionUid.toString() );
                targetContainer.appendChild( sessionElement );
            } )
        } );
}
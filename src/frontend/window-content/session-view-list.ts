/**
 * @module session-list
 */
import { clearWindowContent } from "./window-content-manager";
import { RemoteSession } from "../sessions/RemoteSession";
import { assembleAddSessionMenu } from "./session-add-new";
import { appendTo, attachFutureListener, createElement } from "../util/element-assembler";

/**
 * Function to assemble the session list.
 * @param loadFromStorage Whether to load the session list from the local storage object.
 * Default is false.
 */
export function assembleSessionList()
{
    clearWindowContent( 'side-container' ); // Clear the side container
    let targetContainer = document.getElementById( 'side-container' );

    attachFutureListener( 'action-add-session', 'click', assembleAddSessionMenu );
    attachFutureListener( 'action-delete-session', 'click', _ =>
        window.dispatchEvent( new CustomEvent( 'session:delete' ) ) );
    attachFutureListener( 'action-refresh-sessions', 'click', _ =>
    {
        document.getElementById( 'side-container' )
            .querySelectorAll( 'session-element' )
            .forEach( (element: HTMLElement) => element.remove() );

        loadSessionList( targetContainer );
    } );

    appendTo( targetContainer,
        /* Action container */
        createElement( 'div', [ 'container', 'align-horizontal', 'main-end', 'nowrap', 'grow-1', 'session-actions' ], [
            /* Actions */
            createElement( 'div', [ 'action', 'action-delete' ], [], { id: 'action-delete-session', title: 'Delete selected session' } ),
            createElement( 'div', [ 'action', 'action-refresh' ], [], { id: 'action-refresh-sessions', title: 'Reload session page' } ),
            createElement( 'div', [ 'action', 'action-add' ], [], { id: 'action-add-session', title: 'Add a new session' } )
        ] ),
        /* Title */
        createElement( 'h3', [], [], { textContent: 'Sessions' } ),

    );

    loadSessionList( targetContainer );
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
            })
        } );
}
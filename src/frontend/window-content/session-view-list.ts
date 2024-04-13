/**
 * @module session-list
 */
import { clearWindowContent } from "./window-content-manager";
import { RemoteSession } from "../sessions/RemoteSession";
import { assembleAddSessionMenu } from "./session-add-new";
import { appendTo, attachFutureListener, createElement } from "../util/element-assembler";

/**
 * Function to assemble the session list.
 */
export function assembleSessionList(loadFromStorage: boolean = false)
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

        loadSessionList( targetContainer, false );
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

    loadSessionList( targetContainer, loadFromStorage );
}

/**
 * Function to load the session list.
 * @param targetContainer The container to load the session list into.
 * @param fromLocalStorageObj Whether to load the session list from the local storage object.
 */
function loadSessionList(targetContainer: HTMLElement, fromLocalStorageObj: boolean)
{

    acquireSessionsList( fromLocalStorageObj )
        .then( (sessions: RemoteSession[]) =>
        {
            for ( let session of sessions )
            {
                if ( !session || !session.username || !session.host )
                {
                    console.error( "Corrupted session data: ", session );
                    continue;
                }

                let sessionElement = document.createElement( 'session-element' );
                sessionElement.setAttribute( 'username', session.username );
                sessionElement.setAttribute( 'host', session.host );
                sessionElement.setAttribute( 'port', (session.port || 22).toString() );
                sessionElement.setAttribute( 'fingerprint', (session.fingerprint || false).toString() );
                sessionElement.setAttribute( 'sessionUid', session.sessionUid.toString() );
                targetContainer.appendChild( sessionElement );
            }
        } );
}

/**
 * Function to acquire the sessions list either from the
 * local storage object or the local file system.
 * @param fromLocalStorageObj
 */
function acquireSessionsList(fromLocalStorageObj: boolean)
{
    return new Promise( (resolve, _) =>
    {
        if ( fromLocalStorageObj )
            if ( localStorage.getItem( 'sessions' ) )
                return resolve( JSON.parse( localStorage.getItem( 'sessions' ) ) );

        window[ 'app' ][ 'sessions' ].get()
            .then( (sessions: RemoteSession[]) =>
            {
                localStorage.setItem( 'sessions', JSON.stringify(
                    sessions.map( (session: RemoteSession) => Object.assign( session, { sessionUid: genSessionUid() } ) )
                ) );

                console.log( "Sessions: ", sessions );
                resolve( sessions )
            } );
    } )
}

/**
 * Function to generate a session UID.
 */
function genSessionUid()
{
    return Math.floor( Math.random() * 1000000 );
}
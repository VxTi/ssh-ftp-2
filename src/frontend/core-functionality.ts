/**
 * This file is used to define the core functionality of the application.
 */

import { setContentDefault } from "./window-content/window-content-manager";
import { assembleFileViewer } from "./window-content/session-file-viewer";
import { assembleSessionList } from "./window-content/session-view-list";
import { LocalFileSystem } from "./util/file-management/local-file-system";
import { RemoteFileSystem } from "./util/file-management/remote-file-system";
import { AbstractFileSystem } from "./util/file-management/abstract-file-system";
import { appendTo, createElement } from "./util/element-assembler";

let localFileSystem: AbstractFileSystem;
let remoteFileSystem: AbstractFileSystem;

document.addEventListener( 'DOMContentLoaded', _ =>
{

    // Create navigator if the user is on a Mac
    if ( window[ 'app' ][ 'os' ].isMac )
    {
        let navigator = document.createElement( 'div' );
        navigator.id = 'navigator';
        navigator.classList.add( 'navigator', 'border-bottom' );
        document.body.prepend( navigator );
    }
    setContentDefault();
    assembleSessionList();
} );

window.addEventListener( 'session:request-connect', (event: CustomEvent) =>
{
    console.log( "Attempting to connect to session with UID: ", event.detail.sessionUid );

    // Set all session elements to in-active
    // This is a temporary solution to prevent multiple connections
    document.querySelectorAll( 'session-element' ).forEach( (element: HTMLElement) =>
    {
        element.setAttribute( 'inactive', '' );
        if ( element.hasAttribute( 'connecting' ) )
            element.removeAttribute( 'connecting' );
        if ( element.getAttribute( 'sessionUid' ) === event.detail.sessionUid )
            element.setAttribute( 'connecting', '' );
    } )

    // Simulate connection
    setTimeout( _ => window.dispatchEvent( new CustomEvent( 'session:connected', {
        detail: {
            sessionUid: event.detail.sessionUid
        }
    } ) ), 500 );
} )

/**
 * Event listener for when a user clicks outside a selected element.
 * This will remove the selected attribute from all elements.
 */
window.addEventListener( 'click', event =>
{
    if ( event.target instanceof HTMLElement && event.target.closest( ':is([selected], .action)' ) === null )
        document.querySelectorAll( '[selected]' ).forEach( (element: HTMLElement) =>
            element.removeAttribute( 'selected' ) );
} )

// Event listener for when a session is connected
window.addEventListener( 'session:connected', (event: CustomEvent) =>
{
    console.log( "Connected to session with UID: ", event.detail.sessionUid );
    document.querySelectorAll( 'session-element' ).forEach( (element: HTMLElement) =>
    {
        element.removeAttribute( 'inactive' );
        if ( element.hasAttribute( 'connecting' ) )
            element.removeAttribute( 'connecting' );
        if ( element.getAttribute( 'sessionUid' ) === event.detail.sessionUid )
            element.setAttribute( 'connected', '' );
    } );
    // Assemble page
    assembleFileViewer();
    localFileSystem = new LocalFileSystem();
    remoteFileSystem = new RemoteFileSystem();
    /** Assemble the file system components */
    let localFs = document.getElementById( 'localfs' );
    let remoteFs = document.getElementById( 'remotefs' );
    loadFiles( '/', localFs, localFileSystem );
    loadFiles( '/', remoteFs, remoteFileSystem );
} );

/**
 * Function to load files into a file viewer
 * with the given path, target element and file system.
 */
function loadFiles(path: string, targetElement: HTMLElement, fileSystem: AbstractFileSystem)
{
    fileSystem.listFiles( path )
        .then( (files: string[]) =>
        {
            files.forEach( (file: string) =>
            {
                fileSystem.getFileInfo( file )
                    .then( fileInfo =>
                    {
                        appendTo(targetElement, createElement( 'file-element', [], [], {
                            name: file,
                            path: path,
                            type: fileInfo.type,
                            size: fileInfo.size,
                        } ));
                    })
            } );
        })
}

/**
 * Event listener for when a session is deleted.
 */
window.addEventListener( 'session:delete', () =>
{
    document.querySelectorAll( 'session-element[selected]' ).forEach( (element: HTMLElement) =>
    {
        window[ 'app' ][ 'sessions' ].delete( element.getAttribute( 'sessionUid' ) )
            .then( () => element.remove() );
    } );
} );

window.addEventListener( 'session:file-viewer:navigate', (event: CustomEvent) =>
{
    if ( event.detail.target === 'local' )
    {
        console.log( "Navigating to local file system with path: ", event.detail.path );

    }
    else
    {
        console.log( "Navigating to session with UID: ", event.detail.sessionUid, " and path: ", event.detail.path);
    }
})


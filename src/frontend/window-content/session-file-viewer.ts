import { clearWindowContent } from "./window-content-manager";
import { appendTo, attachFutureListener, createElement } from "../util/element-assembler";
import { LocalFileSystem } from "../util/file-management/local-file-system";

/**
 * Function for generating the file viewer.
 */
export function assembleFileViewer()
{
    clearWindowContent( 'inner-content' );

    /*
     * Attach event listeners to the action buttons.
     * These will dispatch custom events to the window object in
     * the format of 'file-viewer:<action>'.
     */
    [ 'back', 'forward', 'view-icons', 'view-rows', 'add-file', 'refresh', 'delete-file' ]
        .forEach( action =>
            attachFutureListener( `action-${ action }`, 'click', _ =>
                window.dispatchEvent( new CustomEvent( `file-viewer:${ action }` ) ) ) );

    appendTo( document.getElementById( 'inner-content' ),
        /* Action container */
        createElement( 'div', [ 'container', 'align-horizontal', 'main-space-between', 'cross-start', 'border-bottom' ], [
            /* Navigation actions */
            createElement( 'div', [ 'container', 'align-horizontal', 'cross-start', 'main-start' ], [
                createElement( 'span', [ 'action', 'action-back' ], [], { title: 'Go back', id: 'action-back' } ),
                createElement( 'span', [ 'action', 'action-forward' ], [], {
                    title: 'Go forward',
                    id: 'action-forward'
                } ),
            ] ),
            /* File actions */
            createElement( 'div', [ 'container', 'align-horizontal', 'main-end', 'cross-center', 'border-bottom' ], [
                    createElement( 'div', [ 'container', 'align-horizontal', 'main-center', 'cross-center', 'view-mode-container' ], [
                        createElement( 'span', [ 'action', 'view-mode-icons' ], [], {
                            title: 'Icons',
                            id: 'action-view-icons'
                        } ),
                        createElement( 'span', [ 'action', 'view-mode-rows' ], [], {
                            title: 'Rows',
                            id: 'action-view-rows'
                        } ),
                    ] ),
                    createElement( 'span', [ 'action', 'action-add' ], [], { title: 'Add file', id: 'action-add-file' } ),
                    createElement( 'span', [ 'action', 'action-refresh' ], [], { title: 'Refresh', id: 'action-refresh' } ),
                    createElement( 'span', [ 'action', 'action-delete' ], [], { title: 'Delete', id: 'action-delete-file' } ),
                ]
            ),
        ] ),
        /* File viewer container */
        createElement( 'div', [ 'container', 'align-horizontal', 'main-start', 'cross-start', 'grow-1' ], [
            createElement( 'div', [ 'container', 'align-vertical', 'main-start', 'cross-start', 'grow-1', 'full-height', 'border-right' ], [], { id: 'localfs' }),
            createElement( 'div', [ 'container', 'align-vertical', 'main-start', 'cross-start', 'full-height', 'grow-1' ], [], { id: 'remotefs' })
        ] ),
        /* Terminal container */
        createElement( 'div', [ 'container', 'align-horizontal', 'main-start', 'cross-start', 'border-top', 'terminal' ], [], { id: 'terminal' } )
    );

    let localFs = document.getElementById( 'localfs' );
    let localfsObj: LocalFileSystem = new LocalFileSystem();
    localfsObj.listFiles( '/' )
        .then( files =>
        {
            files.forEach( file =>
            {
                appendTo( localFs, createElement( 'file-element', [], [], {}, { name: file } ) );
            } );
        } );

}
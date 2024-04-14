import { clearWindowContent } from "./window-content-manager";
import { appendTo, attachFutureListener, createElement } from "../util/element-assembler";

/**
 * Function for generating the file viewer.
 */
export function assembleFileViewer()
{
    clearWindowContent( 'inner-content' );

    attachFutureListener( 'action-back', 'click', _ => window.dispatchEvent( new CustomEvent( 'file-viewer:back' ) ) );
    attachFutureListener( 'action-forward', 'click', _ => window.dispatchEvent( new CustomEvent( 'file-viewer:forward' ) ) );
    attachFutureListener( 'action-view-icons', 'click', _ => window.dispatchEvent( new CustomEvent( 'file-viewer:view-icons' ) ) );
    attachFutureListener( 'action-view-rows', 'click', _ => window.dispatchEvent( new CustomEvent( 'file-viewer:view-rows' ) ) );
    attachFutureListener( 'action-add', 'click', _ => window.dispatchEvent( new CustomEvent( 'file-viewer:add-file' ) ) );
    attachFutureListener( 'action-refresh', 'click', _ => window.dispatchEvent( new CustomEvent( 'file-viewer:refresh' ) ) );
    attachFutureListener( 'action-delete', 'click', _ => window.dispatchEvent( new CustomEvent( 'file-viewer:delete-file' ) ) );

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
                    createElement( 'span', [ 'action', 'action-add' ], [], { title: 'Add file', id: 'action-add' } ),
                    createElement( 'span', [ 'action', 'action-refresh' ], [], { title: 'Refresh', id: 'action-refresh' } ),
                    createElement( 'span', [ 'action', 'action-delete' ], [], { title: 'Delete', id: 'action-delete' } ),
                ]
            ),
        ] ),
        /* File viewer container */
        createElement( 'div', [ 'container', 'align-horizontal', 'main-start', 'cross-start', 'grow-1' ], [
            createElement( 'div', [ 'container', 'align-vertical', 'main-start', 'cross-start', 'grow-1', 'full-height', 'border-right' ] ),
            createElement( 'div', [ 'container', 'align-vertical', 'main-start', 'cross-start', 'full-height', 'grow-1' ] )
        ] ),
        /* Terminal container */
        createElement( 'div', [ 'container', 'align-horizontal', 'main-start', 'cross-start', 'border-top', 'terminal' ], [], { id: 'terminal' } )
    );

}
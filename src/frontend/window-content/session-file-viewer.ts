import { clearWindowContent } from "./window-content-manager";
import { appendTo, createElement } from "../util/element-assembler";

/**
 * Function for generating the file viewer.
 */
export function assembleFileViewer()
{
    clearWindowContent( 'inner-content' );

    appendTo( document.getElementById( 'inner-content' ),
        /* File viewer action container */
        createElement( 'div', [ 'container', 'align-horizontal', 'main-end', 'cross-center', 'info-container', 'border-bottom' ], [
                /* File viewer actions */
                createElement( 'div', [ 'container', 'align-horizontal', 'main-center', 'cross-center', 'view-mode-container' ], [
                    createElement( 'span', [ 'action', 'view-mode-icons' ] ),
                    createElement( 'span', [ 'action', 'view-mode-rows' ] ),
                ] ),
                createElement( 'span', [ 'action', 'action-add' ] ),
                createElement( 'span', [ 'action', 'action-refresh' ] ),
                createElement( 'span', [ 'action', 'action-delete' ] )
            ]
        ),
        /* File viewer container */
        createElement( 'div', [ 'container', 'align-horizontal', 'main-start', 'cross-start', 'grow-1' ], [
            createElement( 'div', [ 'container', 'align-vertical', 'main-start', 'cross-start', 'grow-1', 'full-height', 'border-right' ] ),
            createElement( 'div', [ 'container', 'align-vertical', 'main-start', 'cross-start', 'full-height', 'grow-1' ] )
        ] ),
        /* Terminal container */
        createElement( 'div', [ 'container', 'align-horizontal', 'main-start', 'cross-start', 'terminal' ] )
    );
}
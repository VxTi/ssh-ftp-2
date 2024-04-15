/**
 * This file is responsible for managing the window state.
 * The main functionality is updating the content of the window.
 */

import { createElement } from "../util/element-assembler";

/**
 * Function for setting the content of the window to the default content.
 */
export function setContentDefault()
{
    // The element to clear
    let container = document.getElementById( 'inner-content' );

    container.appendChild(
        createElement( 'div', [ 'container', 'align-horizontal', 'main-center', 'cross-center', 'grow-1' ], [
            createElement('span', [ 'icon', 'icon-logo' ], [], { style: {
                backgroundImage: `url(./assets/icons/${ window[ 'app' ].icon })`
                } } ),
            createElement('div', [ 'container', 'align-vertical', 'main-center', 'cross-center' ], [
                createElement( 'h1', ['text-color-secondary'], [], { textContent: `Welcome to ${ window[ 'app' ].name }.` } ),
                createElement( 'span', ['text-color-secondary'], [], { innerHTML: 'To get started, add a session on the left, and join<br>it by double-clicking it.' } )
            ])
        ], { id: 'default-content' } )
    );
}

/**
 * Function for clearing the content of the window.
 * @param containerId The ID of the container element to clear
 */
export function clearWindowContent(containerId: string)
{
    let container = document.getElementById( containerId );
    if ( !container )
    {
        console.error( 'Error whilst attempting to clear container:' );
        console.error( `Container with ID ${ containerId } not found.` );
        return;
    }
    container.innerHTML = '';
}
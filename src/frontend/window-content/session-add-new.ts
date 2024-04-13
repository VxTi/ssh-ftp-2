/**
 *
 */


import { clearWindowContent } from "./window-content-manager";
import { assembleSessionList } from "./session-view-list";
import { appendTo, attachFutureListener, createElement } from "../util/element-assembler";

/**
 * Function to assemble the add session menu.
 * This function will be called when the user clicks the add session button.
 */
export function assembleAddSessionMenu()
{
    clearWindowContent( 'side-container' );

    let container = document.getElementById( 'side-container' );

    attachFutureListener( 'action-cancel-session', 'click', _ => assembleSessionList( true ) );

    appendTo( container,
        /* Action container */
        createElement( 'div', [ 'container', 'align-horizontal', 'main-end', 'nowrap', 'grow-1', 'session-actions' ], [
            /* Cancel add session */
            createElement( 'div', [ 'action', 'action-cancel' ], [], {
                id: 'action-cancel-session',
                title: 'Go back to sessions page'
            } )
        ] ),
        /* Title */
        createElement( 'h3', [], [], { textContent: 'Add Session' } ),
        createElement( 'div', [ 'add-session-input-container', 'container', 'align-horizontal', 'main-start', 'cross-start', 'grow-1' ], [
            createElement( 'input', [ 'input-box' ], [], {
                type: 'text',
                name: 'host',
                id: 'session-host',
                title: 'The host address of the session',
                placeholder: 'Host address'
            } ),
            createElement( 'input', [ 'input-box', 'ssh-port' ], [], {
                type: 'number',
                name: 'port',
                id: 'session-port',
                title: 'The port of the session',
                placeholder: 'Port'
            } )
        ] ),
        /* Username */
        createElement( 'input', [ 'add-session-input-container', 'input-box' ], [], {
            type: 'text',
            name: 'username',
            id: 'session-username',
            title: 'The username for the session',
            placeholder: 'Username'
        } ),
        /* Password */
        createElement( 'div', [ 'add-session-input-container', 'container', 'align-horizontal', 'main-start', 'cross-start', 'grow-1' ], [
            createElement( 'input', [ 'input-box' ], [], {
                type: 'password',
                name: 'password',
                id: 'session-password',
                title: 'The password for the session',
                placeholder: 'Password'
            } ),
            createElement( 'input', [ 'show-password', 'nested-button' ], [], {
                type: 'button',
                name: 'show-password',
                id: 'session-show-password',
                title: 'Show or hide password visibility'
            } )
        ] ),
        /* Private key and select private key from local storage  */
        createElement( 'div', [ 'add-session-input-container', 'input-button-container' ], [
            createElement( 'input', [ 'input-box', 'nested-input' ], [], {
                type: 'text',
                name: 'private-key',
                id: 'ssh-private-key',
                title: 'The private key for the server',
                placeholder: 'Private Key'
            } ),
            createElement( 'div', [ 'select-private-key', 'nested-button' ], [], {
                title: 'Select a private key file',
                id: 'ssh-select-private-key'
            } )
        ] ),
        /* Passphrase */
        createElement( 'input', [ 'add-session-input-container', 'input-box' ], [], {
            type: 'text',
            name: 'passphrase',
            id: 'ssh-passphrase',
            title: 'The passphrase for the private key',
            placeholder: 'Passphrase'
        } ),
        /* Connect button */
        createElement( 'input', [ 'add-session-input-container', 'add-session-button' ], [], {
            type: 'button',
            name: 'connect',
            id: 'ssh-login',
            title: 'Add SSH Session',
            value: 'Add Session'
        } )
    );
}
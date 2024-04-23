/**
 *
 */


import { showContent } from "../window-content-manager";
import {
    appendTo,
    attachFutureListener,
    CONTAINER_LEFT_RIGHT,
    CONTAINER_TOP_BOTTOM,
    createElement
} from "../../util/element-assembler";
import { RemoteSession } from "../../sessions/RemoteSession";
import { IFrameState } from "../../util/IFrameState";

/**
 * Function to assemble the add session menu.
 * This function will be called when the user clicks the add session button.
 */
export function assembleAddSessionMenu(frameContext: IFrameState) {
    /** Event listener for when the user clicks the cancel button. */
    attachFutureListener('action-cancel-session', 'click', _ =>
        showContent('sessions-list', { container: frameContext.container }));

    attachFutureListener('session-show-password', 'click', event => {
        let passwordInput = document.getElementById('session-password');
        if ( passwordInput.getAttribute('type') === 'password' )
            passwordInput.setAttribute('type', 'text');
        else
            passwordInput.setAttribute('type', 'password');
    });
    attachFutureListener('ssh-add-session', 'click', _ => {
        let keysOrdered: string[] = [ 'host', 'port', 'username', 'password', 'privateKey', 'passphrase' ];
        let elements: HTMLInputElement[] = [ 'session-host', 'session-port', 'session-username', 'session-password', 'ssh-private-key', 'ssh-passphrase' ]
            .map(id => (document.getElementById(id) as HTMLInputElement));

        let faulty = false;
        for ( let element of elements ) {
            if ( element.hasAttribute('required') && !element.value ) {
                element.setAttribute('input-error', '');
                faulty = true;
            }
            else if ( element.hasAttribute('input-error') )
                element.removeAttribute('input-error');
        }

        // If any of the elements are faulty, return
        if ( faulty )
            return;

        let values: string[] = elements.map(element => element.value);
        let sessionPreObj = {};
        elements.forEach((_, index) => sessionPreObj[ keysOrdered[ index ] ] = values[ index ]);
        let sessionObj: RemoteSession = sessionPreObj as RemoteSession;

        window[ 'app' ][ 'sessions' ].add(sessionObj)
            .then(() => showContent('sessions-list', { container: frameContext.container }));

    });

    appendTo(frameContext.container,
        /* Action container */
        createElement('div', [ ...CONTAINER_LEFT_RIGHT, 'nowrap', 'grow-1', 'sidebar-action-container', 'fit-v-content' ], [
            /* Cancel add session */
            createElement('div', [ 'action', 'action-cancel' ], [], {
                id: 'action-cancel-session',
                title: 'Go back to sessions page'
            })
        ]),
        /* Container with border */
        createElement('div', [ ...CONTAINER_TOP_BOTTOM, 'holding-container', 'cross-center' ], [
            /* Title */
            createElement('h3', [], [], { textContent: 'Add Session' }),
            createElement('div', [ 'add-session-input-container', 'container', 'align-horizontal', 'main-start', 'cross-start', 'grow-1' ], [
                createElement('input', [ 'input-box', 'grow-1', 'round-left-5' ], [], {
                    type: 'text',
                    name: 'host',
                    id: 'session-host',
                    title: 'The host address of the session',
                    placeholder: 'Host address'
                }, { 'required': '', tabindex: '1' }),
                createElement('input', [ 'input-box', 'ssh-port', 'input-small-rect', 'round-right-5' ], [], {
                    type: 'number',
                    name: 'port',
                    id: 'session-port',
                    title: 'The port of the session',
                    placeholder: 'Port'
                }, { tabindex: '-1' })
            ]),
            /* Username */
            createElement('input', [ 'add-session-input-container', 'input-box', 'round-5' ], [], {
                type: 'text',
                name: 'username',
                id: 'session-username',
                title: 'The username for the session',
                placeholder: 'Username'
            }, { 'required': '', tabindex: '2' }),
            /* Password */
            createElement('div', [ 'add-session-input-container', 'container', 'align-horizontal', 'main-start', 'cross-start', 'grow-1' ], [
                createElement('input', [ 'input-box', 'grow-1', 'round-left-5' ], [], {
                    type: 'password',
                    name: 'password',
                    id: 'session-password',
                    title: 'The password for the session',
                    placeholder: 'Password'
                }, { tabindex: '3' }),
                createElement('input', [ 'show-password', 'input-small-rect', 'round-right-5' ], [], {
                    type: 'button',
                    name: 'show-password',
                    id: 'session-show-password',
                    title: 'Show or hide password visibility'
                })
            ]),
            /* Private key and select private key from local storage  */
            createElement('div', [ 'add-session-input-container', 'input-button-container' ], [
                createElement('input', [ 'input-box', 'grow-1', 'round-left-5' ], [], {
                    type: 'text',
                    name: 'private-key',
                    id: 'ssh-private-key',
                    title: 'The private key for the server',
                    placeholder: 'Private Key'
                }, { tabindex: '4' }),
                createElement('input', [ 'select-private-key', 'input-small-rect', 'round-right-5' ], [], {
                    title: 'Select a private key file',
                    type: 'button',
                    id: 'ssh-select-private-key'
                }, { tabindex: '-1' })
            ]),
            /* Passphrase */
            createElement('input', [ 'add-session-input-container', 'input-box', 'round-5' ], [], {
                type: 'text',
                name: 'passphrase',
                id: 'ssh-passphrase',
                title: 'The passphrase for the private key',
                placeholder: 'Passphrase'
            }, { tabindex: '5' }),
            /* Connect button */
            createElement('input', [ 'add-session-input-container', 'container', 'align-horizontal', 'main-center', 'cross-center', 'add-session-button', 'round-5' ], [], {
                type: 'button',
                name: 'connect',
                id: 'ssh-add-session',
                title: 'Add SSH Session',
                value: 'Add Session'
            }, { tabindex: '6' })
        ])
    );
}
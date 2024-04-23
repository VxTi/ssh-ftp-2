/**
 * @module SessionElement
 * @description Custom element for managing the session data.
 */

export class SessionElement extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <span>${this.getAttribute('username' || 'user')}</span>
            <span>${this.getAttribute('host') || 'host'}</span>
            <span>${this.getAttribute('port') || '22'}</span>
            <circular-loader class="connection-status"></circular-loader>
            <span class="session-connect-arrow icon"></span>
        `
        this.addEventListener('dblclick', _ => {
            if ( !this.hasAttribute('sessionUid') ||
                this.hasAttribute('inactive') ||
                this.hasAttribute('connected') )
                return;
            document.querySelectorAll('session-element[connected]')
                .forEach(element => element.removeAttribute('connected'));
            this.setAttribute('connecting', '');
            console.log("Connecting to session: ", this.getAttribute('sessionUid'));
            window[ 'app' ][ 'sessions' ].connect(this.getAttribute('sessionUid'))
                .catch((_: Error) => {
                    this.setAttribute('connect-failed', '');
                    this.removeAttribute('connecting');
                    console.error("Failed to connect to session; timed out ?", _)
                });

        });
        this.addEventListener('click', _ =>
            this.setAttribute('selected', ''));
    }
}

customElements.define('session-element', SessionElement);
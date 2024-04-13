/**
 * @module SessionElement
 * @description Custom element for managing the session data.
 */

export class SessionElement extends HTMLElement
{

    private selected: boolean = false;

    constructor()
    {
        super();
    }

    connectedCallback()
    {
        this.innerHTML = `
            <span>${this.getAttribute('username' || 'user')}</span>
            <span>${this.getAttribute('host') || 'host'}</span>
            <span>${this.getAttribute('port') || '22'}</span>
            <circular-loader class="connection-status"></circular-loader>
            <span class="session-connect-arrow icon"></span>
        `
        this.addEventListener( 'dblclick', _ =>
        {
            if ( !this.hasAttribute( 'sessionUid' ) || this.hasAttribute('inactive'))
                return;

            this.setAttribute( 'connecting', '' );

            window.dispatchEvent( new CustomEvent( 'session:request-connect', {
                detail: {
                    sessionUid: this.getAttribute( 'sessionUid' )
                }
            } )
            );
        } );
        this.addEventListener( 'click', _ =>
        {
            this.setAttribute('selected', '');
            window.dispatchEvent( new CustomEvent( 'session:selected', {
                detail: {
                    sessionUid: this.getAttribute( 'sessionUid' )
                }
            } ) )
        });
    }
}

customElements.define( 'session-element', SessionElement );
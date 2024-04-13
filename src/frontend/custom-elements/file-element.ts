/**
 * Implementation of the file-element custom element.
 */

export class FileElement extends HTMLElement {

    constructor()
    {
        super();
    }

    connectedCallback()
    {
        let shadow = this.attachShadow({mode: 'open'});

    }

}

customElements.define('file-element', FileElement);
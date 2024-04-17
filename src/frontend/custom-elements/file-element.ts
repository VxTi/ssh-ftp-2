/**
 * Implementation of the file-element custom element.
 */

export class FileElement extends HTMLElement
{

    constructor()
    {
        super();
    }

    connectedCallback()
    {
        this.draggable = true;
        this.innerHTML = `
            <span class="icon file-thumbnail"></span>
            <span class="file-name">${this.getAttribute('name')}</span>
        `
    }

}

customElements.define('file-element', FileElement);
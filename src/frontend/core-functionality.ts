/**
 * This file is used to define the core functionality of the application.
 */

import { showContent, registerMainFrames } from "./window-content/window-content-manager";
import { LocalFileSystem } from "./util/file-management/local-file-system";
import { RemoteFileSystem } from "./util/file-management/remote-file-system";
import { AbstractFileSystem } from "./util/file-management/abstract-file-system";
import { appendTo, createElement } from "./util/element-assembler";
import { applyTheme, loadThemes } from "./util/theme-manager";
import { AbstractFile } from "./util/file-management/abstract-file";

document.addEventListener('DOMContentLoaded', _ =>
{

    // Create navigator if the user is on a Mac
    if ( window[ 'app' ][ 'os' ].isMac )
    {
        let navigator = document.createElement('div');
        navigator.id = 'navigator';
        navigator.classList.add('navigator', 'border-bottom');
        document.body.prepend(navigator);
    }

    loadThemes()
        .then((themes) =>
        {
            if ( themes.length > 0 )
                applyTheme(themes[ 0 ]);
        })

    registerMainFrames();
    showContent('startup-content', { container: document.getElementById('inner-content') })
    showContent('sessions-list', { container: document.getElementById('side-container') });
});

/**
 * Event listener for when a user clicks outside a selected element.
 * This will remove the selected attribute from all elements.
 */
window.addEventListener('click', event =>
{
    if ( event.target instanceof HTMLElement && event.target.closest(':is([selected], .action)') === null )
        document.querySelectorAll('[selected]').forEach((element: HTMLElement) =>
            element.removeAttribute('selected'));
})
/**
 * This file is used to define the core functionality of the application.
 */

import { registerMainFrames, showContent } from "./window-content/window-content-manager";
import { applyTheme, loadThemes } from "./util/theme-manager";

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

    document.getElementById('sidebar-visibility-toggle')
        .addEventListener('click', _ => {
            let sidebar = document.getElementById('sidebar-container');
            if ( sidebar.hasAttribute('expanded'))
                sidebar.removeAttribute('expanded');
            else
                sidebar.setAttribute('expanded', '');
        })
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
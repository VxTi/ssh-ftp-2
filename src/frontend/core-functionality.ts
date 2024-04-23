/**
 * This file is used to define the core functionality of the application.
 */

import { registerMainFrames, showContent } from "./window-content/window-content-manager";
import { applyTheme, getThemes, loadThemes } from "./util/theme-manager";
import { registerSetting } from "./settings/Settings";

// The target element which is currently being resized.
let resizeTarget: HTMLElement = null;

document.addEventListener('DOMContentLoaded', async _ => {

    // Create navigator if the user is on a Mac
    if ( window[ 'app' ][ 'os' ].isMac ) {
        let navigator = document.createElement('div');
        navigator.id = 'navigator';
        navigator.classList.add('navigator', 'border-bottom');
        document.body.prepend(navigator);
    }

    await loadThemes();

    registerSetting({
        title: 'Appearance',
        identifier: 'appearance',
        expandable: true,
        content: [
            {
                title: 'Themes',
                identifier: 'appearance.themes',
                expandable: false,
                content: [
                    {
                        title: 'Theme',
                        settingType: 'select',
                        inputType: 'single',
                        initialValue: 'default',
                        data: [ 'Default', ...getThemes() ],
                        onInteract: (value: string) => applyTheme(value)
                    }
                ]
            }
        ]
    })

    registerMainFrames();
    showContent('startup-content', { container: document.getElementById('inner-content') })
    showContent('sessions-list', { container: document.getElementById('side-container') });

    /** Whenever the mouse is down and the target element has a resizable class, add the 'active' attribute **/
    document.addEventListener('mousedown', (event: MouseEvent) => {
        if ( event.target instanceof HTMLElement && event.target.closest('.resize-horizontal, .resize-vertical') ) {
            event.target.setAttribute('active', '');
            resizeTarget = event.target as HTMLElement;
        }
    });

    /** Remove all 'active' attributes from the resizing elements once the mouse is released.**/
    document.addEventListener('mouseup', (event: MouseEvent) => {
        if ( resizeTarget != null ) {
            resizeTarget.removeAttribute('active');
            resizeTarget = null;
        }
    });
    /** Whenever the mouse moves,  */
    document.addEventListener('mousemove', (event: MouseEvent) => {
        if ( resizeTarget === null )
            return;
        if ( resizeTarget.classList.contains('resize-horizontal') )
            resizeTarget.style.setProperty('--horizontal', event.clientX.toString());
        else resizeTarget.style.setProperty('--vertical', event.clientY.toString());
    });

    document.getElementById('sidebar-visibility-toggle')
        .addEventListener('click', _ => {
            let sidebar = document.getElementById('sidebar-container');
            if ( sidebar.hasAttribute('expanded') )
                sidebar.removeAttribute('expanded');
            else
                sidebar.setAttribute('expanded', '');
        })
});

/**
 * Event listener for when a user clicks outside a selected element.
 * This will remove the selected attribute from all elements.
 */
window.addEventListener('click', event => {
    if ( event.target instanceof HTMLElement && event.target.closest(':is([selected], .action)') === null )
        document.querySelectorAll('[selected]').forEach((element: HTMLElement) =>
            element.removeAttribute('selected'));
})
/**
 * This file is responsible for managing the window state.
 * The main functionality is updating the content of the window.
 */

import { createElement } from "../util/element-assembler";
import { assembleFileEditor } from "./main-file-editor";
import { assembleFileViewer } from "./main-session-file-viewer";
import { assembleSessionList } from "./sidebar-view-sessions";
import { assembleAddSessionMenu } from "./sidebar-new-session";
import { FrameState } from "../util/frame-state";

/**
 * A map containing all the generator functions for all the registered windows.
 */
const registeredContentMap: Map<string, Function> = new Map();

/**
 * Function for setting the content of the window to the default content.
 */
function assembleDefaultContent(frameContext: FrameState)
{
    // The element to clear
    let container = document.getElementById('inner-content');

    container.appendChild(
        createElement('div', [ 'container', 'align-horizontal', 'main-center', 'cross-center', 'grow-1' ], [
            createElement('span', [ 'icon', 'icon-logo' ], [], {
                style: {
                    backgroundImage: `url(./assets/icons/${window[ 'app' ].icon})`
                }
            }),
            createElement('div', [ 'container', 'align-vertical', 'main-center', 'cross-center' ], [
                createElement('h1', [ 'text-color-secondary' ], [], { textContent: `Welcome to ${window[ 'app' ].name}.` }),
                createElement('span', [ 'text-color-secondary' ], [], { innerHTML: 'To get started, add a session on the left, and join<br>it by double-clicking it.' })
            ])
        ], { id: 'default-content' })
    );
}

/**
 * Function for clearing the content of the window.
 * @param containerId The ID of the container element to clear
 */
export function clearWindowContent(containerId: string)
{
    let container = document.getElementById(containerId);
    if ( !container )
    {
        console.error('Error whilst attempting to clear container:');
        console.error(`Container with ID ${containerId} not found.`);
        return;
    }
    container.innerHTML = '';
}

/**
 * Function for generating a content frame into the content map.
 * This can then be called with the `loadContent` function.
 * @param contentFrameId - The unique identifier of the frame to register
 * @param generatorFunction - The  function used to generate the content.
 */
export function registerContentFrame(contentFrameId: string, generatorFunction: Function)
{
    if ( registeredContentMap.has(contentFrameId) )
    {
        console.log(`Content frame with ID '${contentFrameId}' has already been registered.`);
        return
    }

    registeredContentMap.set(contentFrameId, generatorFunction);
}

/**
 * Function for loading a registered frame onto the provided destination frame.
 * @param frameId - The unique ID of the frame that had previously been registered
 * @param initParameters - The parameters that are provided in the generator function.
 */
export function showContent(frameId: string, initParameters: FrameState)
{
    console.log('`showContent` called with frame ID:', frameId, 'and parameters:', initParameters);
    window['contentHistory'] = window['contentHistory'] || {};
    let targetId = initParameters.container.id || 'default';
    window['contentHistory'][targetId] = window['contentHistory'][targetId] || [];
    window['contentHistory'][targetId].push({ frameId: frameId, parameters: initParameters });

    if ( !registeredContentMap.has(frameId) )
        throw new Error(`Content frame with ID '${frameId}' does not exist.`)

    if ( !initParameters.container )
    {
        console.error('Failed to locate target frame element in function \'loadContent\':');
        console.error('Provided element for parameter \'dstFrame\' does not exist.');
        return
    }

    // Clear the previous content and then call the generator function.
    initParameters.container.innerHTML = '';
    registeredContentMap.get(frameId)(initParameters);

}

/**
 * Function for registering all main frame generators
 */
export function registerMainFrames()
{
    registerContentFrame('file-editor', assembleFileEditor);
    registerContentFrame('file-viewer', assembleFileViewer);
    registerContentFrame('sessions-list', assembleSessionList);
    registerContentFrame('create-session', assembleAddSessionMenu);
    registerContentFrame('startup-content', assembleDefaultContent);
}
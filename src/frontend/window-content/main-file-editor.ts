/**
 * @fileoverview
 * This file exports a function that builds the components for
 * viewing and editing a file in the main element of the application.
 */


import { showContent } from "./window-content-manager";
import {
    appendTo,
    attachFutureListener,
    CONTAINER_LEFT_RIGHT,
    CONTAINER_SPREAD_AROUND,
    CONTAINER_TOP_BOTTOM,
    createElement
} from "../util/element-assembler";
import { FrameState } from "../util/frame-state";

/**
 * Function that builds the file editor
 */
export function assembleFileEditor(frameContext: FrameState)
{
    // Generate the previous window.
    attachFutureListener('action-back', 'click', (event: MouseEvent) =>
    {
        showContent( frameContext.previousWindowId, {
            container: frameContext.container,
            parameters: frameContext.previousWindowParameters,
            previousWindowId: 'file-editor'
        });
    })

    appendTo(frameContext.container,
        /** Container for all content */
        createElement('div', [...CONTAINER_TOP_BOTTOM, 'scroll'], [

            /* Action container */
            createElement('div', [ ...CONTAINER_SPREAD_AROUND, 'border-bottom', 'fit-v-content', 'max-width' ], [
                /** Go back action */
                createElement('div', [ 'action', 'action-back' ], [], { id: 'action-back' }),

                /* Container for actions on the right */
                createElement('div', CONTAINER_LEFT_RIGHT, [
                    createElement('div', ['action', 'action-save-file'], [], {
                        innerText: 'Save File',
                        id: 'action-save-file'
                    })
                ])
            ]),
            createElement('div', [ ...CONTAINER_TOP_BOTTOM, 'max-height', 'm-height-100', 'm-width-100', 'scroll' ], [
                createElement('div', [ ...CONTAINER_LEFT_RIGHT, 'file-pre-container' ], [
                    /* Line number container */
                    createElement('div', [ ...CONTAINER_TOP_BOTTOM, 'border-right' ], [], {
                        id: 'line-number-container'
                    }),
                    /* Line content container */
                    createElement('div', CONTAINER_TOP_BOTTOM, [], {
                        id: 'file-editor-container'
                    })
                ], [], { id: 'file-editor' })
            ])
        ])
    )

    let lineContainer = document.getElementById('line-number-container');
    let contentContainer = document.getElementById('file-editor-container');

    // Check if the provided init arguments have the `content` property
    if ( frameContext.parameters.hasOwnProperty('content'))
    {

        let lines: string[] = frameContext.parameters[ 'content' ].split('\n');

        lines.forEach(line =>
        {
            appendTo(lineContainer, createElement('div', [ 'line-number' ]));
            appendTo(contentContainer, createElement('span', [ 'line-content' ], [], {
                innerHTML: __formatHtml(line)
            }))
        })
    }
}

/**
 * Function for removing characters from the provided line if they are not allowed.
 * @param line - The line to remove characters from.
 */
function __formatHtml(line: string)
{
    return line
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
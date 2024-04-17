/**
 * @fileoverview
 * This file exports a function that builds the components for
 * viewing and editing a file in the main element of the application.
 */


import { clearWindowContent } from "./window-content-manager";
import { appendTo, CONTAINER_LEFT_RIGHT, CONTAINER_TOP_BOTTOM, createElement } from "../util/element-assembler";

/**
 * Function that builds the file editor
 */
export function assembleFileEditor()
{
    clearWindowContent('inner-content'); // Clear previous content

    appendTo(document.getElementById('inner-content'),
        createElement( 'div', CONTAINER_LEFT_RIGHT, [
        createElement('div', [...CONTAINER_TOP_BOTTOM, 'border-right'], [], {
            id: 'line-number-container'
        }),
        createElement('div', ['container', 'align-vertical', 'main-start', 'cross-start'], [], {
            id: 'file-editor-container'
        })
    ], [], {
        id: 'file-editor'
    }))
}

/**
 * Function for loading file content into the file editor.
 * If the file editor hasn't been assembled,
 * @param content - The content to load onto the file editor.
 * @param fileExtension - The extension of the file. This is an optional parameter. If left empty,
 * no highlighting will be applied. Only highlights the content if there exists a highlighter.
 */
export function loadFileInEditor(content: string, fileExtension?: string)
{
    // Ensure the file editor exists
    if ( !document.getElementById('file-editor'))
        assembleFileEditor();

    let lineContainer = document.getElementById('line-number-container');
    let contentContainer = document.getElementById('file-editor-container');

    let lines = content.split('\n');

    lines.forEach((line, index) => {
        appendTo(lineContainer, createElement( 'div', ['line-number']));
        appendTo(contentContainer, createElement( 'span', ['line-content'], [], {
            innerHTML: __formatHtml(line)
        }))
    })
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
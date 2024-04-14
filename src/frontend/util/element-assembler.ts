/**
 * @fileoverview Contains functions for creating and manipulating HTMLElements.
 */

let __queuedEventListeners: Map<string, Map<string, EventListener[]>> = new Map();

export const CONTAINER_TOP_BOTTOM = [ 'container', 'align-vertical', 'main-start', 'cross-center' ];
export const CONTAINER_LEFT_RIGHT = [ 'container', 'align-horizontal', 'main-start', 'cross-start' ];
export const CONTAINER_RIGHT_LEFT = [ 'container', 'align-horizontal', 'main-end', 'cross-start' ];
export const CONTAINER_HORIZONTAL_CENTER = [ 'container', 'align-horizontal', 'main-center', 'cross-center' ];
export const CONTAINER_SPREAD_AROUND = [ 'container', 'align-horizontal', 'main-space-between', 'cross-start' ];

/**
 * Creates an HTMLElement with the specified type, properties, attributes, and children.
 * @param type The type of the element to create.
 * @param classes The classes to add to the element.
 * @param properties The properties to set on the element.
 * @param attributes The attributes to set on the element.
 * @param children The children to append to the element.
 * @returns The created HTMLElement.
 */
export function createElement(type: string, classes: string[], children: HTMLElement[] = [], properties: {
    [ key: string ]: any
} = {}, attributes: {
    [ key: string ]: string
} = {}): HTMLElement
{
    let element = document.createElement( type );
    if ( classes.length > 0 )
        element.classList.add( ...classes );

    Object.keys( attributes )
        .forEach( key => element.setAttribute( key, attributes[ key ] ) );

    Object.keys( properties )
        .forEach( key => element[ key ] = properties[ key ] );

    children.forEach( child => element.appendChild( child ) );

    return element;
}

/**
 * Attaches an event listener to the specified element.
 * If the element doesn't exist, the event listener will be queued and attached when the element is created
 * with the `appendTo` function.
 * @param elementId The ID of the element to attach the event listener to.
 * @param eventType The type of event to listen for.
 * @param listener The event listener to attach.
 */
export function attachFutureListener(elementId: string, eventType: string, listener: EventListener)
{
    // If the element already exists, attach the event listener
    let reference = document.getElementById( elementId );
    if ( reference )
    {
        reference.addEventListener( eventType, listener );
        return;
    }
    // If the element doesn't have any event listeners queued, create a new map
    if ( !__queuedEventListeners.has( elementId ) )
        __queuedEventListeners.set( elementId, new Map() );

    // If the element doesn't have any listeners for the specified event type, create a new array
    let eventListeners = __queuedEventListeners.get( elementId );
    if ( !eventListeners.has( eventType ) )
        eventListeners.set( eventType, [] );

    eventListeners.get( eventType ).push( listener );
}

/**
 * Appends the specified elements to the target element.
 * Also attaches any event listeners that were queued for the target element.
 * @param targetElement The element to append the elements to.
 * @param elements The elements to append to the target element.
 */
export function appendTo(targetElement: HTMLElement, ...elements: HTMLElement[])
{
    elements.forEach( element => targetElement.appendChild( element ) );

    __queuedEventListeners.forEach( (eventListeners, elementId) =>
    {
        let targetElement = document.getElementById( elementId );
        if ( !targetElement )
            return;
        // Attach the event listeners to the target element
        eventListeners.forEach( (listeners, eventType) =>
        {
            listeners.forEach( listener => targetElement.addEventListener( eventType, listener ) )
            __queuedEventListeners.delete( elementId ); // Remove the event listeners from the queue
        } )
    } )
}

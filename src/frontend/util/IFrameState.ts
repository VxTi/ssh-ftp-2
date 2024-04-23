/**
 * @author Luca Warmenhoven
 * @date Thu 18th of April 2024
 */

/**
 * Interface defining an abstract frame state.
 * This object contains all information about with what parameters the current
 * window should be initialized with, what the previous window was, and what
 * it was initialized with.
 */
export interface IFrameState {

    /**
     * The element that hosts the frame.
     */
    readonly container: HTMLElement;

    /**
     * The unique ID of the previous window. This must be registered in the content map
     * in the `window-content-manager.ts` file.
     */
    readonly previousWindowId?: string;

    /**
     * The properties the previous window was initialized with.
     * This can be used to re-generate the window with the same state as before.
     */
    readonly previousWindowParameters?: Object;

    /**
     * The initialization properties of the current window.
     * This can be used in the generator function for this window.
     */
    readonly parameters?: Object;

}
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
export interface FrameState {

    /**
     * The generator function used to create the previous window.
     * This function can be called when in another window to go back
     * to the previous one, provided the `previousWindowInitArgs`.
     */
    readonly previousWindowGenerator?: Function;

    /**
     * The properties the previous window was initialized with.
     * This can be used to re-generate the window with the same state as before.
     */
    readonly previousWindowParameters?: Object;

    /**
     * The initialization properties of the current window.
     * This can be used in the generator function for this window.
     */
    readonly parameters: Object;

}
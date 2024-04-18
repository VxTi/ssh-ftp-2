/**
 * @fileoverview abstract-process.ts @ ssh-ftp-remake
 * @author Luca Warmenhoven
 * @date Created on Thursday, April 18, 2024 - 19:19
 */

export interface AbstractProcess
{
    /**
     * The ID of the process.
     */
    id: string;

    /**
     * The name of the process.
     */
    name: string;

    /**
     * The description of the process.
     */
    description?: string;

    /**
     * The function that will be executed when the process is started.
     */
    executeFn: Function;

    /**
     * The function that will be executed when the process is stopped.
     */
    stopFn: Function;

    /**
     * The function that will be executed when the process is paused.
     */
    pauseFn: Function;

    /**
     * The function that will be executed when the process is resumed.
     */
    resumeFn: Function;
}
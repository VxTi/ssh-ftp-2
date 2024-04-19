/**
 * @fileoverview IRemoteSessionProperties.ts @ ssh-ftp-remake
 * @author Luca Warmenhoven
 * @date Created on Friday, April 19, 2024 - 18:02
 */

/**
 * Interface for managing remote session data.
 */
export interface IRemoteSessionProperties
{
    sessionUid: number; // The unique identifier for the session.
    host: string;
    port?: number;
    username: string;
    password?: string;
    passphrase?: string;
    privateKey?: string;
}
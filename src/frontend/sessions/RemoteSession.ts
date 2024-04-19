/**
 * @file RemoteSession.ts
 * @description Class for managing remote session data.
 * @author Luca Warmenhoven
 * @date Created on Monday, April 15, 2024 - 17:38
 */

import { IRemoteSessionProperties } from "./IRemoteSessionProperties";

/**
 * @class RemoteSession
 * @description Class for managing remote session data.
 */
export class RemoteSession implements IRemoteSessionProperties
{
    sessionUid: number;
    host: string;
    port?: number;
    username: string;
    password?: string;
    privateKey?: string;
    passphrase?: string;

    /**
     * Constructor for the RemoteSession class.
     * @param properties
     */
    constructor(properties: IRemoteSessionProperties)
    {
        this.sessionUid = properties.sessionUid;
        this.host = properties.host;
        this.port = properties.port || 22;
        this.username = properties.username;
        this.password = properties.password || '';
        this.passphrase = properties.passphrase || '';
        this.privateKey = properties.privateKey || '';
    }
}
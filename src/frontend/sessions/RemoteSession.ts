/**
 * @description Interface for managing remote session data.
 */
export interface RemoteSessionProperties
{
    sessionUid: number;
    host: string;
    port?: number;
    username: string;
    password?: string;
    passphrase?: string;
    privateKey?: string;
}

/**
 * @class RemoteSession
 * @description Class for managing remote session data.
 */
export class RemoteSession
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
    constructor(properties: RemoteSessionProperties)
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
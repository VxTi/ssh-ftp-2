/**
 * @fileoverview This file contains the SSHConnection class which is used to create an
 * SSH connection to a remote server.
 */

const { Client } = require('ssh2');

/**
 * Class representing an SSH connection to a remote server.
 */
class SSHConnection
{

    /** @type {Client} */
    #client;

    /** @type {RemoteSessionProperties} */
    #sessionProperties;

    /** @type {boolean} */
    #connected = false;

    /**
     * Constructor for creating a SSHConnection
     * @param {RemoteSessionProperties} properties - Connection properties for the SSH connection.
     */
    constructor(properties)
    {
        this.#client = new Client();
        this.#sessionProperties = properties;

        // Connect to the remote server when the client is ready.
        this.#client
            .on('ready', _ =>
            {
                this.#connected = true;

            })
            .on('error', err =>
            {
                console.error('SSH Error', err);
                this.#connected = false;
            })
            .on('close', _ =>
            {
                this.#connected = false;
            })
            .shell((err, stream) =>
            {
                if ( err )
                    throw err;

                stream
                    .on('data', data =>
                    {
                        console.log(data.toString());
                    })
                    .on('close', _ =>
                    {
                        this.#client.end();
                        this.#connected = false;
                    });

            })
    }

    /**
     * Get the connection status.
     * @returns {boolean} - True if the connection is active, false otherwise.
     */
    get connected()
    {
        return this.#connected;
    }

    /**
     * Connect to the remote server.
     */
    connect()
    {
        this.#client.connect({
            host: this.#sessionProperties.host,
            port: this.#sessionProperties.port,
            username: this.#sessionProperties.username,
            password: this.#sessionProperties.password,
            privateKey: this.#sessionProperties.privateKey,
            passphrase: this.#sessionProperties.passphrase
        })
    }

}

module.exports = SSHConnection;
import { AbstractFileSystem } from "./abstract-file-system";
import { IFileInfo } from "./file-info";
import { LocalFileSystem } from "./local-file-system";
import * as path from "node:path";

export class RemoteFileSystem implements AbstractFileSystem
{
    readonly sessionUid: string;

    constructor(sessionUid: string)
    {
        this.sessionUid = sessionUid;
        console.log("Created file system: ", sessionUid)
    }

    /**
     * Delete files from the remote file system.
     * @param paths
     */
    deleteFiles(paths: string[]): Promise<void>
    {
        return window[ 'app' ][ 'sessions' ][ 'fs' ].delete( this.sessionUid, paths );
    }

    /**
     * Get the file information for the given path.
     * @param path
     */
    fileInfo(path: string): Promise<IFileInfo>
    {
        return window[ 'app' ][ 'sessions' ][ 'fs' ].info( this.sessionUid, path );
    }

    /**
     * Get the home directory of the remote file system.
     */
    homeDirectory(): Promise<string>
    {
        return window[ 'app' ][ 'sessions' ][ 'fs' ].homeDir( this.sessionUid );
    }

    listFiles(path: string): Promise<string[]>
    {
        return window[ 'app' ][ 'sessions' ][ 'fs' ].list( this.sessionUid, path );
    }

    moveFile(oldPath: string, newPath: string, dstFs: AbstractFileSystem): Promise<void>
    {
        if ( dstFs instanceof RemoteFileSystem )
            return window[ 'app' ][ 'sessions' ][ 'fs' ].move( this.sessionUid, oldPath, newPath );

        if ( dstFs instanceof LocalFileSystem )
            return window[ 'app' ][ 'localFs' ].upload( this.sessionUid, oldPath, newPath );

        throw new Error( "Unable to move file: unsupported file system." );
    }

    readFile(path: string): Promise<string>
    {
        throw new Error( "Method 'readFile' in RemoteFileSystem not yet implemented." );
    }

    putFiles(files: { path: string, content: string }[]): Promise<void>
    {
        throw new Error( "Method 'putFiles' in RemoteFileSystem not yet implemented." );
    }

}
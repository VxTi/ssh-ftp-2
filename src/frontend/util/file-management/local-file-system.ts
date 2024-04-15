import { AbstractFileSystem } from "./abstract-file-system";
import { IFileInfo } from "./file-info";
import { RemoteFileSystem } from "./remote-file-system";

export class LocalFileSystem implements AbstractFileSystem
{
    /**
     * Delete a file from the local file system.
     * @param paths - The path to the file to delete.
     */
    deleteFiles(paths: string[]): Promise<void>
    {
        return Promise.all(paths.map( path => window[ 'app' ][ 'localFs'].delete( path ) ) );
    }

    /**
     * List files in the given path.
     * @param path - The path to list files from.
     */
    listFiles(path: string): Promise<string[]>
    {
        return window[ 'app' ][ 'localFs' ].list( path );
    }

    /**
     * Move a file from the old path to the new path.
     * @param oldPath - The old path of the file.
     * @param newPath - The new path of the file.
     * @param dstFs - The destination file system.
     */
    moveFile(oldPath: string, newPath: string, dstFs: AbstractFileSystem): Promise<void>
    {
        if ( dstFs instanceof LocalFileSystem )
            return window[ 'app' ][ 'localFs' ].move( oldPath, newPath );

        if ( dstFs instanceof RemoteFileSystem )
            return window[ 'app' ][ 'sessions' ][ 'fs' ].upload( (dstFs as RemoteFileSystem).sessionUid, oldPath, newPath );

        throw new Error( "Unable to move file: unsupported file system." );
    }

    /**
     * Write files to the local file system.
     * @param files - The files to write.
     */
    putFiles(files: { path: string, content: string }[]): Promise<void>
    {
        return Promise.all(files.map( ({ path, content })  => window[ 'app' ][ 'localFs' ].write( path, content ) ) );
    }

    readFile(path: string): Promise<string>
    {
        return window[ 'app' ][ 'localFs' ].read( path );
    }

    fileInfo(path: string): Promise<IFileInfo>
    {
        return Promise.resolve(window[ 'app' ][ 'localFs' ].info( path ));
    }

    homeDirectory(): Promise<string>
    {
        return window[ 'app' ][ 'localFs' ].homeDir
    }

}
import { AbstractFileSystem } from "./abstract-file-system";
import { IFileInfo } from "./file-info";

export class LocalFileSystem implements AbstractFileSystem
{
    deleteFile(path: string): Promise<void>
    {
        return window[ 'app' ][ 'localFs' ].delete( path );
    }

    deleteFiles(paths: string[]): Promise<void>
    {
        return Promise.all(paths.map( path => window[ 'app' ][ 'localFs'].delete( path ) ) );
    }

    listFiles(path: string): Promise<string[]>
    {
        return window[ 'app' ][ 'localFs' ].list( path );
    }

    moveFile(oldPath: string, newPath: string): Promise<void>
    {
        return window[ 'app' ][ 'localFs' ].move( oldPath, newPath );
    }

    putFile(path: string, content: string): Promise<void>
    {
        return window[ 'app' ][ 'localFs' ].write( path, content );
    }

    putFiles(files: { [ p: string ]: string }): Promise<void>
    {
        return Promise.all(Object.keys( files ).map( path => window[ 'app' ][ 'localFs' ].write( path, files[ path ] ) ) );
    }

    readFile(path: string): Promise<string>
    {
        return window[ 'app' ][ 'localFs' ].read( path );
    }

    getFileInfo(path: string): Promise<IFileInfo>
    {
        return window[ 'app' ][ 'localFs' ].info( path );
    }

}
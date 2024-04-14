import { AbstractFileSystem } from "./abstract-file-system";

export class RemoteFileSystem implements AbstractFileSystem
{
    deleteFile(path: string): Promise<void>
    {
        return Promise.resolve( undefined );
    }

    deleteFiles(paths: string[]): Promise<void>
    {
        return Promise.resolve( undefined );
    }

    listFiles(path: string): Promise<string[]>
    {
        return Promise.resolve( [] );
    }

    moveFile(oldPath: string, newPath: string): Promise<void>
    {
        return Promise.resolve( undefined );
    }

    putFile(path: string, content: string): Promise<void>
    {
        return Promise.resolve( undefined );
    }

    putFiles(files: { [ p: string ]: string }): Promise<void>
    {
        return Promise.resolve( undefined );
    }

    readFile(path: string): Promise<string>
    {
        return Promise.resolve( "" );
    }

}
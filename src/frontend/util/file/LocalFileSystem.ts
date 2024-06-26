import { IAbstractFileSystem } from "./IAbstractFileSystem";
import { IFileInfo } from "./IFileInfo";
import { RemoteFileSystem } from "./RemoteFileSystem";
import { AbstractFile } from "./AbstractFile";

export class LocalFileSystem implements IAbstractFileSystem {

    // The current working directory of the file system.
    cwd: string;

    constructor(cwd?: string) {
        this.cwd = cwd || this.homeDirectory() as string;
    }

    /**
     * Delete a file from the local file system.
     * @param paths - The path to the file to delete.
     */
    deleteFiles(paths: string[]): Promise<void> {
        return Promise.all(paths.map(path => window[ 'app' ][ 'localFs' ].delete(path)));
    }

    /**
     * List files in the given path.
     * @param path - The path to list files from.
     */
    async listFiles(path: string): Promise<AbstractFile[]> {
        return await window[ 'app' ][ 'localFs' ].list(path)
            .then((files: string[]) => files.filter(file => file !== '..' && file !== '.'))
            .then((files: string[]) => Promise.all(
                files.map(async (file: string) =>
                    window[ 'app' ][ 'localFs' ].info(
                        window[ 'app' ][ 'path' ].join(path, file)
                    ).then((fileInfo: IFileInfo) => new AbstractFile(
                        fileInfo.name,
                        fileInfo.path,
                        fileInfo.type,
                        fileInfo)))
            ));
    }

    /**
     * Move a file from the old path to the new path.
     * @param oldPath - The old path of the file.
     * @param newPath - The new path of the file.
     * @param dstFs - The destination file system.
     */
    moveFile(oldPath: string, newPath: string, dstFs: IAbstractFileSystem): Promise<void> {
        if ( dstFs instanceof LocalFileSystem )
            return window[ 'app' ][ 'localFs' ].move(oldPath, newPath);

        if ( dstFs instanceof RemoteFileSystem )
            return window[ 'app' ][ 'sessions' ][ 'fs' ].upload((dstFs as RemoteFileSystem).sessionUid, oldPath, newPath);

        throw new Error("Unable to move file: unsupported file system.");
    }

    /**
     * Write files to the local file system.
     * @param files - The files to write.
     */
    putFiles(files: { path: string, content: string }[]): Promise<void> {
        return Promise.all(files.map(({ path, content }) => window[ 'app' ][ 'localFs' ].write(path, content)));
    }

    readFile(path: string): Promise<string> {
        return window[ 'app' ][ 'localFs' ].read(path);
    }

    fileInfo(path: string): Promise<IFileInfo> {
        return Promise.resolve(window[ 'app' ][ 'localFs' ].info(path));
    }

    homeDirectory(): Promise<string> | string {
        return window[ 'app' ][ 'localFs' ].homeDir
    }
}
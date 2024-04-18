import { AbstractFileSystem } from "./abstract-file-system";
import { IFileInfo } from "./file-info";
import { LocalFileSystem } from "./local-file-system";
import { AbstractFile } from "./abstract-file";

export class RemoteFileSystem implements AbstractFileSystem
{

    readonly sessionUid: string;

    cwd: string;

    private static readonly fileListExpr: RegExp = /([-drwx+@]+)\s+(\d+)\s+([a-zA-Z0-9._-]+)\s+([a-zA-Z0-9._-]+)\s+(\d+)\s+(\w{3})\s+(\d{1,2})\s+(\d{1,2}:\d{1,2}|\d{4})\s+(.+)/

    constructor(sessionUid: string, cwd?: string)
    {
        this.sessionUid = sessionUid;
        if ( cwd )
            this.cwd = cwd;
        else this.homeDirectory()
            .then(dir => this.cwd = dir);
    }

    /**
     * Delete files from the remote file system.
     * @param paths
     */
    deleteFiles(paths: string[]): Promise<void>
    {
        return window[ 'app' ][ 'sessions' ][ 'fs' ].delete(this.sessionUid, paths);
    }

    /**
     * Get the file information for the given path.
     * @param path
     */
    fileInfo(path: string): Promise<IFileInfo>
    {
        return window[ 'app' ][ 'sessions' ][ 'fs' ].info(this.sessionUid, path);
    }

    /**
     * Get the home directory of the remote file system.
     */
    homeDirectory(): Promise<string>
    {
        return window[ 'app' ][ 'sessions' ][ 'fs' ].homeDir(this.sessionUid);
    }

    /**
     * Lists the file in the remote file system, without providing the file info.
     * This can be retrieved afterward.
     * @param path
     */
    listFiles(path: string): Promise<AbstractFile[]>
    {
        return Promise.resolve(window[ 'app' ][ 'sessions' ]
            .exec(this.sessionUid, `ls -a -l ${path}`)
            .then((result: string) =>
            {
                return result.split('\n')
                    .filter(file => file !== '..' && file !== '.')
                    .slice(1)
                    .map(data =>
                    {
                        let parameters = data.match(RemoteFileSystem.fileListExpr);
                        if ( !parameters )
                            throw new Error("Unable to parse file data: \n" + data);

                        const [, permissions, fileCount, owner, group, size, month, date, yearOrTime, filename] = parameters;

                        let fileType = permissions.charAt(0) === 'd' ? 'directory' :
                            filename.indexOf('.') !== -1 ? filename.split('.').pop() : 'file';
                        return new AbstractFile(
                            filename,
                            path,
                            fileType,
                            {
                                hidden: filename.charAt(0) === '.',
                                size: parseInt(size),
                                dateModified: Date.parse(`${month} ${date} ${yearOrTime}`),
                                permissions: permissions,
                                name: filename,
                                path: path,
                                isFile: fileType !== 'directory',
                                isDirectory: fileType === 'directory',
                                type: fileType
                            } as IFileInfo
                        )
                    })
            }))
    }

    /**
     *  Moves a file from one path to another.
     *  Works with both local and remote file systems.
     * @param oldPath
     * @param newPath
     * @param dstFs
     */
    moveFile(oldPath: string, newPath: string, dstFs: AbstractFileSystem): Promise<void>
    {
        if ( dstFs instanceof RemoteFileSystem )
            return window[ 'app' ][ 'sessions' ][ 'fs' ].move(this.sessionUid, oldPath, newPath);

        if ( dstFs instanceof LocalFileSystem )
            return window[ 'app' ][ 'localFs' ].upload(this.sessionUid, oldPath, newPath);

        throw new Error("Unable to move file: Unsupported file system.");
    }

    readFile(path: string): Promise<string>
    {
        return window[ 'app' ][ 'sessions' ].exec(this.sessionUid, `cat ${path}`)
    }

    putFiles(files: { path: string, content: string }[]): Promise<void>
    {
        throw new Error("Method 'putFiles' in RemoteFileSystem not yet implemented.");
    }

}
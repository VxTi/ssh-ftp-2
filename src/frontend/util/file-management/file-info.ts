/**
 * File Info Interface
 * Contains information about a file
 */
export interface IFileInfo {
    readonly name: string;
    readonly path: string;
    readonly isFile: boolean;
    readonly isDir: boolean;
    readonly isSymLink: boolean;
    readonly type: string;
    readonly size: number;
    readonly dateCreated: Date;
    readonly dateModified: Date;
    readonly permissions: number;
}
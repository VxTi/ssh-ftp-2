/**
 * File Info Interface
 * Contains information about a file
 */
export interface IFileInfo {
    readonly name: string;
    readonly path: string;
    readonly isFile: boolean;
    readonly isDirectory: boolean;
    readonly isSymLink: boolean;
    readonly type: string;
    readonly size?: number;
    readonly hidden?: boolean;
    readonly dateCreated?: number;
    readonly dateModified?: number;
    readonly permissions: string;
}
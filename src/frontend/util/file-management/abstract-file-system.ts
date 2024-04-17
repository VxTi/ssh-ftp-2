/**
 * Abstract file system interface.
 * This interface is used to define the methods that
 * are required for an abstract file system.
 */
import { IFileInfo } from "./file-info";
import { AbstractFile } from "./abstract-file";

export interface AbstractFileSystem
{
    /**
     * Method to get the file list.
     * @param path The path to get the file list from.
     */
    listFiles(path: string): Promise<AbstractFile[]>;

    /**
     * Method to get the file content.
     * @param path The path to get the file content from.
     */
    readFile(path: string): Promise<string>;


    /**
     * Method to write multiple files.
     * @param files The files to write.
     */
    putFiles(files: { path: string, content: string }[]): Promise<void>;

    /**
     * Method to move a file.
     * @param oldPath The old path of the file.
     * @param newPath The new path of the file.
     * @param dstFs The destination file system.
     */
    moveFile(oldPath: string, newPath: string, dstFs: AbstractFileSystem): Promise<void>;

    /**
     * Method to delete multiple files.
     * @param paths The paths to delete.
     */
    deleteFiles(paths: string[]): Promise<void>;

    /**
     * Method to get the file type.
     * @param path The path to get the file type from.
     * @returns The file type.
     */
    fileInfo(path: string): Promise<IFileInfo>;

    /**
     * Method for retrieving the home directory
     * of the file system.
     * @returns The home directory.
     */
    homeDirectory(): Promise<string>;
}
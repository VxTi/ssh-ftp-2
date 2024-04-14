/**
 * Abstract file system interface.
 * This interface is used to define the methods that
 * are required for an abstract file system.
 */

export interface AbstractFileSystem
{
    /**
     * Method to get the file list.
     * @param path The path to get the file list from.
     */
    listFiles(path: string): Promise<string[]>;

    /**
     * Method to get the file content.
     * @param path The path to get the file content from.
     */
    readFile(path: string): Promise<string>;

    /**
     * Method to write to a file.
     * @param path The path to write to.
     * @param content The content to write to the file.
     */
    putFile(path: string, content: string): Promise<void>;

    /**
     * Method to write multiple files.
     * @param files The files to write.
     */
    putFiles(files: { [key: string]: string }): Promise<void>;

    /**
     * Method to move a file.
     * @param oldPath The old path of the file.
     * @param newPath The new path of the file.
     */
    moveFile(oldPath: string, newPath: string): Promise<void>;

    /**
     * Method to delete a file.
     * @param path The path to delete.
     */
    deleteFile(path: string): Promise<void>;

    /**
     * Method to delete multiple files.
     * @param paths The paths to delete.
     */
    deleteFiles(paths: string[]): Promise<void>;
}
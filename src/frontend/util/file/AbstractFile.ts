/**
 * Abstract file class.
 * @author Luca Warmenhoven
 * @date Tuesday 16th of April 2024.
 */

import { IFileInfo } from "./IFileInfo";

/**
 * Abstract file class.
 * This class is used to define the properties of a file.
 */
export class AbstractFile
{

    public info: IFileInfo;
    public name: string;
    public path: string;
    public type: string;

    /**
     * Constructor for the abstract file class.
     * @param name - The name of the file.
     * @param path - The path of the file.
     * @param fileType - The type of the file / file extension.
     * @param fileInfo - The file information. Can be left out if not available.
     */
    constructor(name: string, path: string, fileType: string, fileInfo?: IFileInfo)
    {
        this.info = fileInfo;
        this.name = name;
        this.path = path;
        this.type = fileType;
        if ( !fileInfo )
        {
            this.info = {
                name: name,
                path: path,
                isFile: fileType !== 'directory',
                isDirectory: fileType === 'directory',
                isSymLink: false,
                type: fileType,
            } as IFileInfo;
        }
    }
}
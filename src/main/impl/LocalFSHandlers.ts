/**
 * @fileoverview LocalFSHandlers.ts
 * @author Luca Warmenhoven
 * @date Created on Wednesday, November 13 - 11:14
 */

import { ipcMain }    from "electron";
import fs             from 'fs'
import path           from "node:path";
import { IFileEntry } from "@/common/file-information";
import EVENTS         from '@/common/ipc-events.json';

ipcMain.handle(EVENTS.LOCAL_FS.LIST_FILES, async (_, targetPath: string) => {
    const dirEntries = await fs.promises.readdir(targetPath, { withFileTypes: true });

    return await Promise.all(dirEntries.map(async (dirEntry) => {
        const stats = await fs.promises.lstat(path.join(targetPath, dirEntry.name));
        return {
            name: dirEntry.name,
            path: dirEntry.parentPath,
            type: stats.isSymbolicLink() ? 'symlink' :
                  stats.isDirectory() ? 'directory' :
                  stats.isBlockDevice() ? 'block-device' :
                  stats.isCharacterDevice() ? 'character-device' :
                  'file',
            size: stats.size,
            mode: stats.mode,
            lastAccessTimeMs: stats.atimeMs,
            lastModifiedTimeMs: stats.mtimeMs,
            creationTimeMs: stats.birthtimeMs,
            uid: stats.uid,
            gid: stats.gid,
            rdev: stats.rdev,
            dev: stats.dev,
            ino: stats.ino,
            nlink: stats.nlink,
            blksize: stats.blksize,
            blocks: stats.blocks
        } as IFileEntry
    }));
});

ipcMain.on(EVENTS.LOCAL_FS.HOME_DIRECTORY, (event) => {
    event.returnValue = process.env.HOME || path.sep;
});
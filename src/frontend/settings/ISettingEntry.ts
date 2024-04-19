/**
 * @fileoverview ISetting.ts @ ssh-ftp-remake
 * @author Luca Warmenhoven
 * @date Created on Friday, April 19, 2024 - 18:07
 */

import { ISettingDefinition } from "./ISettingDefinition";

/**
 * Interface for settings entries.
 * This interface d
 */
export interface ISettingEntry
{
    title: string;
    identifier: string;
    expandable?: boolean;
    content?: ISettingDefinition[] | ISettingEntry[];
}
/**
 * @fileoverview Settings.ts @ ssh-ftp-remake
 * @author Luca Warmenhoven
 * @date Created on Friday, April 19, 2024 - 18:29
 */

import { ISettingEntry } from "./ISettingEntry";
import { ISettingDefinition } from "./ISettingDefinition";

/**
 * Function for registering a setting in the `localStorage` object.
 * @param setting - The setting entry to register.
 */
export function registerSetting(setting: ISettingEntry) {
    let settings = getSettings();

    let existent = settings.find(s => s.identifier === setting.identifier);

    // Check if the setting is already registered.
    if ( existent ) {
        console.warn(`Setting '${setting.title}' already registered; overwriting.`)
        existent.content = setting.content;
    }
    else {
        settings.push(setting);
    }
    window[ 'settings' ] = settings;
}

/**
 * Function for retrieving a setting based on its identifier.
 * The setting must be registered in the `settings` property in the `localStorage` object.
 * @param identifier - The identifier of the setting to retrieve.
 * @returns The setting entry or definition.
 */
export function getSetting(identifier: string): ISettingEntry[] | ISettingDefinition[] | undefined {
    return getSettings()
        .find(setting => setting.identifier === identifier)?.content;
}

/**
 * Function for retrieving all registered settings from the `localStorage` object.
 */
export function getSettings(): ISettingEntry[] {
    return window[ 'settings' ] as ISettingEntry[];
}

(() => {
    // Load the settings from the settings file
    // and append them to the settings object.
    window[ 'settings' ] = [];
    window[ 'app' ][ 'localFs' ].read(
        window[ 'app' ][ 'path' ].join(
            window[ 'app' ][ 'localFs' ].resourcesDirectory,
            'settings.json'
        )
    )
        .then((content: string) => JSON.parse(content))
        .then((settings: ISettingEntry[]) => window[ 'settings' ].push(settings))
        .then(() => console.log(window[ 'settings' ].length + ' settings loaded.'))
})();
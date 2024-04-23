/**
 * @fileoverview settings-handling.ts @ ssh-ftp-remake
 * @author Luca Warmenhoven
 * @date Created on Friday, April 19, 2024 - 17:38
 */
import { ISettingEntry } from "./ISettingEntry";
import { appendTo, attachFutureListener, createElement } from "../util/element-assembler";
import { getSettings } from "./Settings";
import { ISettingDefinition } from "./ISettingDefinition";

let settingsList: HTMLElement = null;
let settingContent: HTMLElement = null;
let sessionData: ISettingEntry[] = [];
let currentlyVisibleSettingId: string = null;

document.addEventListener('DOMContentLoaded', () => {

    // Create navigator if the user is on a Mac
    if ( window[ 'app' ][ 'os' ].isMac ) {
        let navigator = document.createElement('div');
        navigator.id = 'navigator';
        navigator.classList.add('navigator', 'border-bottom');
        document.body.prepend(navigator);
    }

    settingsList = document.getElementById('settings-list');
    settingContent = document.getElementById('settings-content');

    // If for some reason the settings are not present in the local storage,
    // create an empty array and return.

    getSettings().forEach(setting => createSettingsItem(setting));
});

/**
 * Create a new settings item.
 * @param entry - The entry to create a settings item for.
 * @param indentation - The indentation of the settings item.
 * @param appendAfter - The element to append the settings item after.
 */
function createSettingsItem(entry: ISettingEntry, indentation: number = 0, appendAfter?: HTMLElement) {
    let element = createElement('div', [ 'session-item' ], [], {
        id: entry.identifier,
        innerText: entry.title,
    }, {
        expandable: entry.expandable.toString()
    });

    element.style.paddingLeft = `${indentation * 20}px`;

    if ( appendAfter )
        appendAfter.after(element);
    else
        settingsList.appendChild(element);

    element.addEventListener('click', () => {
        // Check if the setting entry can expand and has content
        if ( entry.expandable && entry.content.length > 0 ) {
            let previous = element;
            (entry.content as ISettingEntry[]).forEach(entry => {
                previous = createSettingsItem(entry, indentation + 1, previous);
            });
        }
        else viewSetting(entry)
    });
    return element;
}

/**
 * Show the settings of a specific identifier.
 * @param setting - The setting to show.
 */
function viewSetting(setting: ISettingEntry) {
    // If the setting is not found, or the setting is already visible, return.
    if ( !setting )
        return;

    settingContent.innerHTML = '';

    appendTo(settingContent,
        createElement('h2', [], [], {
            innerText: setting.title
        })
    );

    (setting.content as ISettingDefinition[]).forEach(setting => {
        console.log(setting);

        switch ( setting.settingType ) {
            case 'input':

                break;
            case 'select':
                attachFutureListener(setting.title, 'change', (event: Event) =>
                    setting.onInteract((event.target as HTMLSelectElement).value));
                appendTo(settingContent,
                    createElement('select', [],
                        (setting.data as string[]).map(selectOption =>
                            createElement('option', [], [], {
                                value: selectOption,
                                innerText: selectOption
                            }))
                        , {
                            id: setting.title,
                            value: setting.initialValue,
                            multiple: setting.inputType === 'multiple',
                            onchange: (event) => setting?.onInteract((event.target as HTMLSelectElement).value)
                        })
                );
                break;
            case 'checkbox':

                break;
            case 'radio':

                break;
            case 'description':

                break;
        }
    });
}

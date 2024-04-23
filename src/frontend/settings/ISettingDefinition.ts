/**
 * @fileoverview ISettingDefinition.ts @ ssh-ftp-remake
 * @author Luca Warmenhoven
 * @date Created on Friday, April 19, 2024 - 18:09
 */

type SettingType = 'input' | 'select' | 'checkbox' | 'radio' | 'description';
type InputType = 'text' | 'number' | 'password' | 'email' | 'tel' | 'url';
type SelectType = 'single' | 'multiple';
type CheckboxType = 'single' | 'multiple';

/**
 * Interface for the content of a setting.
 */
export interface ISettingDefinition {
    title: string;
    description?: string;
    settingType: SettingType;
    inputType?: InputType | SelectType | CheckboxType | 'radio';
    initialValue: any;
    data?: any[];
    onInteract?: (value: any) => void;
}
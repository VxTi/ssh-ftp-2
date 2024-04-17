/**
 * Theme Manager
 * This module is responsible for loading and applying themes to the application.
 * Themes are stored in the `themes` folder and are loaded from the `themes.json` file.
 */

/**
 * The structure of a theme.
 */
export interface Theme
{
    primaryColor: string;
    secondaryColor: string;
    inputColor: string;
    inputHoverColor: string;
    inputInactiveColor: string;
    inputActiveColor: string;
    inputBorderColor: string;
    inputBorderHoverColor: string;
    borderPrimaryColor: string;
    borderSecondaryColor: string;
    textPrimaryColor: string;
    textSecondaryColor: string;
}

let themes: Map<string, Theme> = new Map<string, Theme>();

const __themeConversionMap = {
    'primaryColor': 'primary-color',
    'secondaryColor': 'secondary-color',
    'inputColor': 'input-color',
    'inputHoverColor': 'input-hover-color',
    'inputInactiveColor': 'input-inactive-color',
    'inputActiveColor': 'input-active-color',
    'inputBorderColor': 'input-border-color',
    'inputBorderHoverColor': 'input-border-hover-color',
    'borderPrimaryColor': 'border-primary-color',
    'borderSecondaryColor': 'border-secondary-color',
    'textPrimaryColor': 'text-primary-color',
    'textSecondaryColor': 'text-secondary-color'
}

/**
 * Load themes from the `themes.json` file.
 */
export function loadThemes(): Promise<string[]>
{
    return new Promise((resolve, reject) =>
    {
        /**
         * Ensure the themes folder exists
         */
        let themesDir = window[ 'app' ][ 'path' ].join(window[ 'app' ][ 'localFs' ].appDirectory, 'themes');
        if ( !window[ 'app' ][ 'localFs' ].exists(themesDir) )
        {
            window[ 'app' ][ 'localFs' ].mkdir(themesDir);
            console.log("Creating themes directory at path", themesDir);
            return resolve([]);
        }

        /**
         * Load all themes from the themes directory
         */
        window[ 'app' ][ 'localFs' ].list(themesDir)
            .then((files: string[]) =>
            {
                Promise.all(files.map(themeFile =>
                {
                    return window [ 'app' ][ 'localFs' ].read(window[ 'app' ][ 'path' ].join(themesDir, themeFile))
                        .then(JSON.parse)
                        .then((theme: Theme) =>
                        {
                            if ( !theme.hasOwnProperty('themeName') )
                            {
                                console.warn(`Theme ${themeFile} does not have a name property`);
                                themes.set(themeFile, theme);
                            }
                            else
                                themes.set(theme[ 'themeName' ], theme);
                        })
                }))
                    .catch(reject)
                    .then(() => resolve(Array.from(themes.keys())));
            });
    });
}

/**
 * Get the names of all loaded themes.
 * @returns The names of all loaded themes.
 */
export function getThemes()
{
    return Array.from(themes.keys());
}

/**
 * Apply a theme to the application.
 * All themes must be present in the 'themes' folder, and loaded
 * with `loadThemes` before they can be applied.
 * @param themeName - The name of the theme to apply.
 */
export function applyTheme(themeName: string)
{
    let theme = themes.get(themeName);
    if ( !theme )
    {
        console.warn(`Unable to load theme '${themeName}': Theme not found.`);
        return;
    }

    console.log(`Applying theme '${themeName}'`);

    let styleElement = document.getElementById('theme-styles');

    // Make sure the style element exists
    if ( styleElement )
        styleElement.remove();
    else
    {
        styleElement = document.createElement('style');
        styleElement.id = 'theme-styles';
    }

    // Apply the theme to the style element
    let tags = Object.keys(__themeConversionMap)
        .filter(tag => theme.hasOwnProperty(tag))
        .map(tag => `--${__themeConversionMap[tag]}: ${theme[tag]};`);
    styleElement.innerText = `* { ${tags.join('')} }`;
    document.head.appendChild(styleElement);
}
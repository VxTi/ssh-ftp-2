const path = require('path');

module.exports = {
    entry: {
        "app": [
            './src/frontend/core-functionality',
            './src/frontend/custom-elements/file-element',
            './src/frontend/custom-elements/session-element',
            './src/frontend/custom-elements/circular-loading-element',
            './src/frontend/sessions/RemoteSession',
        ],
        "settings": [
            './src/frontend/util/theme-manager',
            './src/frontend/settings/settings-handling'
        ]
    },
    output: {
        filename: '[name]-bundle.js',
        path: path.resolve(__dirname, 'src', 'bundle'),
    },
    target: 'web',
    node: {
        __dirname: false,
        __filename: false
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    optimization: {
        minimize: true,
        mergeDuplicateChunks: true,
    },
    mode: 'production'
}
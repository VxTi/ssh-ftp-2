const path = require('path');

module.exports = {
    entry: {
        "app": [
            './src/frontend/core-functionality.ts',
            './src/frontend/custom-elements/file-element.ts',
            './src/frontend/custom-elements/session-element.ts',
            './src/frontend/custom-elements/circular-loading-element.ts',
            './src/frontend/sessions/remote-session',
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
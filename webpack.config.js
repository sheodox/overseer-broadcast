const path = require('path');

module.exports = {
    watch: process.argv.includes('development'),
    entry: './static/src/ui.js',
    output: {
        path: path.resolve(__dirname, 'static/dist'),
        filename: 'ui.js'
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    },
};

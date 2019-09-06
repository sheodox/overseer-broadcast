const path = require('path');

module.exports = {
    watch: process.argv.includes('development'),
    entry: './static/src/ui.js',
    output: {
        path: path.resolve(__dirname, 'static/dist'),
        filename: 'ui.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            }
        ]
    },
};

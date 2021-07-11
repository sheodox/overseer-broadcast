const path = require('path'),
    CopyPlugin = require('copy-webpack-plugin'),
    {WebpackManifestPlugin} = require('webpack-manifest-plugin');

module.exports = {
    watch: process.argv.includes('development'),
    entry: {
        main: './src/static/main.js',
        landing: './src/static/landing.js',
        admin: './src/static/admin.js'
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: '[name].[contenthash].js',
        publicPath: ""
    },
    resolve: {
        alias: {
            svelte: path.resolve('node_modules', 'svelte')
        },
        extensions: ['.mjs', '.js', '.svelte'],
        mainFields: ['svelte', 'browser', 'module', 'main'],
    },
    module: {
        rules: [
            {
                test: /\.(html|svelte)$/,
                use: 'svelte-loader'
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            }
        ]
    },
    plugins: [
        new WebpackManifestPlugin(),
        new CopyPlugin({
            patterns:[
                {from: 'logo.png', context: './src/static'},
                {from: 'logo.svg', context: './src/static'},
                //move fontawesome assets to where they can be served
                {from: 'fontawesome-free/**/*.{woff,ttf,css,txt,woff2}', context: './node_modules/@fortawesome/'}
            ]})
    ]
};

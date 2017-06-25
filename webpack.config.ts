const path = require("path");

import {Configuration} from "./src/configuration";

module.exports = {
    entry: [
        `webpack-dev-server/client?http://${Configuration.host}:${Configuration.port}/`,
        "./src/index"
    ],
    devServer: {
        proxy: {
            "/graphql": {
                target: `http://${Configuration.graphQLHostname}:${Configuration.graphQLPort}`
            }
        },
        disableHostCheck: true
    },
    output: {
        filename: 'bundle.js',
        path: '/',
        publicPath: '/static/'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {test: /\.css$/, use: 'style-loader'},
            {test: /\.css$/, use: 'css-loader'},
            {test: /\.(graphql|gql)$/, exclude: /node_modules/, loader: 'graphql-tag/loader'}
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    devtool: 'inline-source-map',
};

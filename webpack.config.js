"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const configuration_1 = require("./src/configuration");
module.exports = {
    entry: [
        `webpack-dev-server/client?http://${configuration_1.Configuration.host}:${configuration_1.Configuration.port}/`,
        "./src/index"
    ],
    devServer: {
        proxy: {
            "/graphql": {
                target: `http://${configuration_1.Configuration.graphQLHostname}:${configuration_1.Configuration.graphQLPort}`
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
            { test: /\.css$/, use: 'style-loader' },
            { test: /\.css$/, use: 'css-loader' },
            { test: /\.(graphql|gql)$/, exclude: /node_modules/, loader: 'graphql-tag/loader' }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    devtool: 'inline-source-map',
};
//# sourceMappingURL=webpack.config.js.map
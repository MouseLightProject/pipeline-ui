const path = require("path");

import {Configuration} from "./server/configuration";

module.exports = {
    entry: [
        `webpack-dev-server/client?http://${Configuration.host}:${Configuration.port}/`,
        "./client/index"
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
        filename: "bundle.js",
        path: "/",
        publicPath: "/static/"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
            {test: /\.css$/, use: "style-loader"},
            {test: /\.css$/, use: "css-loader"},
            {test: /\.(graphql|gql)$/, exclude: /node_modules/, loader: "graphql-tag/loader"},
            {
                test: /\.jpe?g$|\.gif$|\.png$|\.ttf$|\.eot$|\.svg$/,
                use: "file-loader?name=[name].[ext]?[hash]",
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader?limit=10000&mimetype=application/fontwoff"
            },
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    devtool: "inline-source-map",
};

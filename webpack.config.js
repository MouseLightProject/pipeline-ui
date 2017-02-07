const path = require("path");
const webpack = require("webpack");

const config = require("./system.config").default();

module.exports = {
    devtool: "sourcemap",
    entry: [
        "babel-polyfill",
        `webpack-dev-server/client?http://localhost:${config.port}/`,
        "./src/index"
    ],
    devServer: {
        proxy: {
            "/graphql": {
                target: `http://localhost:${config.apiPort}`
            }
        }
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: "/static/"
    },
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ["babel"],
                include: path.join(__dirname, "src")
            }, {
                test: /\.tsx?$/, loader: "babel-loader?presets[]=es2015!ts-loader"
            }
        ],
        noParse: [
            /plotly\.js/
        ]
    }
};

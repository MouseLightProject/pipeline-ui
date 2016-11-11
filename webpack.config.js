var path = require("path");
var webpack = require("webpack");

module.exports = {
    devtool: "sourcemap",
    entry: [
        "react-hot-loader/patch",
        "webpack-dev-server/client?http://localhost:4000",
        "webpack/hot/only-dev-server",
        "./src/index"
    ],
    devServer: {
        proxy: {
            "/graphql": {
                target: 'http://localhost:3000'
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
                test: /\.tsx?$/, loader: "ts-loader"
            }
        ]
    }
};

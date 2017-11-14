import * as path from "path";
import * as proxy from "express-http-proxy";

const express = require("express");

let webpackConfig = null;
let Webpack = null;
let webpackDevServer = null;
let compiler = null;

if (process.env.NODE_ENV !== "production") {
    webpackConfig = require("../webpack.dev.config.js");
    Webpack = require("webpack");
    webpackDevServer = require("webpack-dev-server");
    compiler = Webpack(webpackConfig);
}

import {Configuration} from "./configuration";

console.log(`Preparing http://${Configuration.host}:${Configuration.port}/`);

const rootPath = path.resolve(path.join(__dirname, "..", "public"));

const apiUri = `http://${Configuration.graphQLHostname}:${Configuration.graphQLPort}`;

console.log(`Proxy graphql to ${apiUri}`);
/*
const config = require("../webpack.config");

new WebpackDevServer(webpack(config), {
    stats: {
        colors: true
    },
    proxy: {
        "/graphql": {
            target: `http://${Configuration.graphQLHostname}:${Configuration.graphQLPort}`
        }
    },
    disableHostCheck: true,
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true,
    noInfo: false, quiet: false

}).listen(Configuration.port, "0.0.0.0", (err) => {
    if (err) {
        return console.log(err);
    }

    console.log(`Listening at http://${Configuration.host}:${Configuration.port}/`);
});
*/
let app = null;

if (process.env.NODE_ENV !== "production") {
    app = devServer();
} else {
    app = express();

    app.use(express.static(rootPath));

    app.post("/graphql", proxy(apiUri + "/graphql"));

    app.use("/", (req, res) => {
        res.sendFile(path.join(rootPath, "index.html"));
    });
}

app.listen(Configuration.port, "0.0.0.0", () => {
    if (process.env.NODE_ENV !== "production") {
        console.log(`Listening at http://localhost:${Configuration.port}/`);
    }
});

function devServer() {
    return new webpackDevServer(compiler, {
        stats: {
            colors: true
        },
        proxy: {
            "/graphql": {
                target: apiUri
            }
        },
        contentBase: path.resolve(path.join(__dirname, "..", "public")),
        disableHostCheck: true,
        publicPath: webpackConfig.output.publicPath,
        // hot: true,
        historyApiFallback: true,
        noInfo: false,
        quiet: false
    });
}


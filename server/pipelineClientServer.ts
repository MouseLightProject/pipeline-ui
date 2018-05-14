import * as path from "path";
import * as proxy from "express-http-proxy";

const express = require("express");

const debug = require("debug")("pipeline-api:server");

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
import * as http from "http";

const apiUri = `http://${Configuration.graphQLHostname}:${Configuration.graphQLPort}`;

startExpressServer();

startSocketIOServer();

function startExpressServer() {

    debug(`Preparing http://${Configuration.host}:${Configuration.port}/`);

    const rootPath = path.resolve(path.join(__dirname, "..", "public"));

    let app = null;

    if (process.env.NODE_ENV !== "production") {
        app = devServer();
    } else {
        app = express();

        app.use(express.static(rootPath));

        app.post("/graphql", proxy(apiUri + "/graphql"));

        app.use("/thumbnail", proxy(apiUri + "/thumbnail"));

        app.use("/thumbnailData", proxy(apiUri + "/thumbnailData"));

        app.use(`${Configuration.internalApiBase}serverConfiguration`, serverConfiguration);

        app.use("/", (req, res) => {
            res.sendFile(path.join(rootPath, "index.html"));
        });
    }

    app.listen(Configuration.port, "0.0.0.0", () => {
        if (process.env.NODE_ENV !== "production") {
            debug(`Listening at http://${Configuration.host}:${Configuration.port}/`);
        }
    });
}

function startSocketIOServer() {
    const ipPort = Configuration.port + 1;

    debug(`preparing socketio at http://localhost:${ipPort}/`);

    const server = http.createServer(() => {
    });
    const io = require("socket.io")(server);

    io.on("connection", (socket) => {
        socket.on("stopMicroscopeAcquisition", (location: string) => {
        });
        socket.on("restartHubProxy", () => {
        });
    });

    server.listen(ipPort, () => {
        debug(`socketio listening at http://localhost:${ipPort}/`);
    });
}

function serverConfiguration(req, resp) {
    resp.json({
        buildVersion: Configuration.buildVersion,
        processId: process.pid
    });
}

function devServer() {
    return new webpackDevServer(compiler, {
        stats: {
            colors: true
        },
        before: (app) => {
            app.use(`${Configuration.internalApiBase}serverConfiguration`, serverConfiguration);
        },
        proxy: {
            "/graphql": {
                target: apiUri
            },
            "/thumbnail": {
                target: apiUri
            },
            "/thumbnailData": {
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


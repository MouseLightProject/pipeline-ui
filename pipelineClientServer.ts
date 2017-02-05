import * as webpack from "webpack";
import * as WebpackDevServer from "webpack-dev-server";

const config = require("./webpack.config.js");

import systemConfig from "./system.config";

const systemConfiguration = systemConfig();

const PORT = process.env.API_CLIENT_PORT || systemConfiguration.port;

let proxy = {};

proxy[`${systemConfiguration.graphQlEndpoint}`] = `http://localhost:${systemConfiguration.apiPort}`;

new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    proxy: proxy,
    historyApiFallback: true,
    noInfo: false,
    quiet: false
}).listen(PORT, "0.0.0.0", (err) => {
    if (err) {
        return console.log(err);
    }

    console.log(`Listening at http://localhost:${PORT}/`);
});

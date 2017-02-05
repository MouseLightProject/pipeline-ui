"use strict";
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const config = require("./webpack.config.js");
const system_config_1 = require("./system.config");
const systemConfiguration = system_config_1.default();
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
//# sourceMappingURL=pipelineClientServer.js.map
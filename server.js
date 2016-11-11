"use strict";
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const config = require("./webpack.config");
new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    proxy: { "/graphql": `http://localhost:3000` },
    historyApiFallback: true,
    noInfo: false,
    quiet: false
}).listen(4000, "localhost", function (err, result) {
    if (err) {
        return console.log(err);
    }
    console.log("Listening at http://localhost:4000/");
});
//# sourceMappingURL=server.js.map
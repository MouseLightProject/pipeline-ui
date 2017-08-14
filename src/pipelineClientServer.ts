import * as webpack from "webpack";
import * as WebpackDevServer from "webpack-dev-server";

const config = require("./../webpack.config");

import {Configuration} from "./configuration";

console.log(`Preparing http://${Configuration.host}:${Configuration.port}/`);

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

import * as webpack from "webpack";
import * as WebpackDevServer from "webpack-dev-server";

const config = require("./../webpack.config.js");

import {Configuration} from "./configuration";

const PORT = process.env.API_CLIENT_PORT || Configuration.port;

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

}).listen(PORT, "0.0.0.0", (err) => {
    if (err) {
        return console.log(err);
    }

    console.log(`Listening at http://${Configuration.host}:${PORT}/`);
});

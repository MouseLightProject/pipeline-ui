const configurations = {
    production: {
        host: "pipeline-client",
        port: 6101,
        internalApiBase: "/api/v1/internal/",
        graphQLHostname: "pipeline-api",
        graphQLPort: 6001,
        graphQlEndpoint: "/graphql",
        thumbsHostname:  "pipeline-api",
        thumbsPort:  6001,
        thumbsPath:  "/thumbnail",
        buildVersion: 3
    }
};

function loadServerOptions() {
    const options = configurations.production;

    options.host = process.env.PIPELINE_API_CLIENT_HOST || options.host;
    options.port = parseInt(process.env.PIPELINE_API_CLIENT_PORT) || options.port;
    options.graphQLHostname = process.env.PIPELINE_API_HOST || options.graphQLHostname;
    options.graphQLPort = parseInt(process.env.PIPELINE_API_PORT) || options.graphQLPort;
    options.thumbsHostname = process.env.PIPELINE_THUMBS_HOST || process.env.PIPELINE_API_HOST || options.thumbsHostname;
    options.thumbsPort = parseInt(process.env.PIPELINE_THUMBS_PORT) || parseInt(process.env.PIPELINE_API_PORT) || options.thumbsPort;
    options.thumbsPath = process.env.PIPELINE_THUMBS_PATH || options.thumbsPath;

    return options;
}

export const Configuration = loadServerOptions();

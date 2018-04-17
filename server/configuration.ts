const configurations = {
    production: {
        host: "pipeline-client",
        port: 3100,
        graphQLHostname: "pipeline-api",
        graphQLPort: 3000,
        graphQlEndpoint: "/graphql",
    }
};

function loadServerOptions() {
    const options = configurations.production;

    options.host = process.env.PIPELINE_API_CLIENT_HOST || options.host;
    options.port = parseInt(process.env.PIPELINE_API_CLIENT_PORT) || options.port;
    options.graphQLHostname = process.env.PIPELINE_API_HOST || options.graphQLHostname;
    options.graphQLPort = parseInt(process.env.PIPELINE_API_PORT) || options.graphQLPort;

    return options;
}

export const Configuration = loadServerOptions();

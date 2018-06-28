import {isNullOrUndefined} from "util";

const configurations = {
        host: "pipeline-client",
        port: 6101,
        internalApiBase: "/api/v1/internal/",
        graphQLHostname: "pipeline-api",
        graphQLPort: 6001,
        graphQlEndpoint: "/graphql",
        thumbsHostname:  "pipeline-api",
        thumbsPort:  6001,
        thumbsPath:  "/thumbnail",
        buildVersion: 4,
        isActivePipeline: true
};

function loadServerOptions() {
    const options = Object.assign({}, configurations);

    options.host = process.env.PIPELINE_API_CLIENT_HOST || options.host;
    options.port = parseInt(process.env.PIPELINE_API_CLIENT_PORT) || options.port;
    options.graphQLHostname = process.env.PIPELINE_API_HOST || options.graphQLHostname;
    options.graphQLPort = parseInt(process.env.PIPELINE_API_PORT) || options.graphQLPort;
    options.thumbsHostname = process.env.PIPELINE_THUMBS_HOST || process.env.PIPELINE_API_HOST || options.thumbsHostname;
    options.thumbsPort = parseInt(process.env.PIPELINE_THUMBS_PORT) || parseInt(process.env.PIPELINE_API_PORT) || options.thumbsPort;
    options.thumbsPath = process.env.PIPELINE_THUMBS_PATH || options.thumbsPath;

    if (!isNullOrUndefined(process.env.PIPELINE_IS_ACTIVE) && process.env.PIPELINE_IS_ACTIVE.length > 0) {
        options.isActivePipeline = parseInt(process.env.PIPELINE_IS_ACTIVE) > 0;
    }

    return options;
}

export const Configuration = loadServerOptions();

const configurations = {
    development: {
        host: "localhost",
        port: 4000,
        graphQLHostname: "localhost",
        graphQLPort: 3000,
        graphQlEndpoint: "/graphql",
    },
    test: {
        host: "localhost",
        port: 4000,
        graphQLHostname: "localhost",
        graphQLPort: 3000,
        graphQlEndpoint: "/graphql",
    },
    production: {
        host: "localhost",
        port: 4000,
        graphQLHostname: "localhost",
        graphQLPort: 3000,
        graphQlEndpoint: "/graphql",
    }
};

export const Configuration = LoadConfiguration();

function LoadConfiguration() {
    let env = process.env.NODE_ENV || "development";

    return configurations[env];
}

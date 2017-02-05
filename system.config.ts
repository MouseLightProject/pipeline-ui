const configurations = {
    development: {
        port: 4000,
        apiPort: 3000,
        graphQlEndpoint: "/graphql",
    },
    test: {
        port: 4000,
        apiPort: 3000,
        graphQlEndpoint: "/graphql",
    },
    staging: {
        port: 4050,
        apiPort: 3050,
        graphQlEndpoint: "/graphql",
    },
    production: {
        port: 4000,
        apiPort: 3000,
        graphQlEndpoint: "/graphql",
    }
};

export default function () {
    let env = process.env.NODE_ENV || "development";

    return configurations[env];
}

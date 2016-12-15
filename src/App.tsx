import * as React from "react";
import {ApolloProvider} from "react-apollo";
import ApolloClient from "apollo-client";
import {createNetworkInterface, addTypename} from "apollo-client";
// import {Client} from "subscriptions-transport-ws";

import {Layout} from "./Layout";

// If you use React Router, make this component render <Router> with your routes. Currently, only synchronous routes are
// hot reloaded, and you will see a warning from <Router> on every reload.  You can ignore this warning. For details,
// see: https://github.com/reactjs/react-router/issues/2182

declare var window: { __APOLLO_STATE__: any };

const networkInterface = createNetworkInterface({
    uri: "/graphql"
});

// const wsClient = new Client("ws://localhost:8080");

// const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
//    networkInterface,
//    wsClient,
// );

const client = new ApolloClient({
    networkInterface: networkInterface,
    queryTransformer: addTypename,
    dataIdFromObject: (result: any) => {
        if (result.id) {
            return result.id;
        }
        return null;
    },
    shouldBatch: true,
    initialState: window.__APOLLO_STATE__
});

export class App extends React.Component<any, any> {
    render() {
        return (
            <ApolloProvider client={client}>
                <Layout/>
            </ApolloProvider>
        );
    }
}

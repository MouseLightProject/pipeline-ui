import * as React from "react";
import {ApolloProvider} from "react-apollo";
import ApolloClient from "apollo-client";
import {createNetworkInterface, addTypename} from "apollo-client";
import {MainNav} from "./MainNav";
import {StyleRoot} from 'radium';
// import {Client} from "subscriptions-transport-ws";

// If you use React Router, make this component render <Router> with your routes. Currently, only synchronous routes are
// hot reloaded, and you will see a warning from <Router> on every reload.  You can ignore this warning. For details,
// see: https://github.com/reactjs/react-router/issues/2182

declare let window: {__APOLLO_STATE__: any};

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
            return result.__typename + result.id;
        }
        return null;
    },
    shouldBatch: false,
    initialState: window.__APOLLO_STATE__
});

export class App extends React.Component<any, any> {
    render() {
        return (
            <ApolloProvider client={client}>
                <StyleRoot>
                    <MainNav pages={this.props.children}/>
                </StyleRoot>
            </ApolloProvider>
        );
    }
}

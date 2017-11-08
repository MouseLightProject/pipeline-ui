import * as React from "react";
import {ApolloProvider} from "react-apollo";
import ApolloClient from "apollo-client";
import {createNetworkInterface} from "apollo-client";
import {MainNav} from "./MainNav";

declare let window: { __APOLLO_STATE__: any };

const networkInterface = createNetworkInterface({
    uri: "/graphql"
});

const client = new ApolloClient({
    networkInterface: networkInterface,
    addTypename: true,
    dataIdFromObject: (result: any) => {
        if (result.id) {
            return result.__typename + result.id;
        }
        return null;
    },
    initialState: window.__APOLLO_STATE__,
    connectToDevTools: false
});


export class App extends React.Component<any, any> {
    render() {
        return (
            <ApolloProvider client={client}>
                <MainNav pages={this.props.children}/>
            </ApolloProvider>
        );
    }
}

import * as React from "react";

import ApolloClient from "apollo-boost";
import {ApolloProvider} from "react-apollo";

import {PageLayout} from "./components/PageLayout";

const client = new ApolloClient({
    uri: "/graphql",
});

export class ApolloApp extends React.Component<any, any> {
    render() {
        return (
            <ApolloProvider client={client}>
                <PageLayout/>
            </ApolloProvider>
        );
    }
}

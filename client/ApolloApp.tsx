import * as React from "react";

import {ApolloProvider} from "react-apollo";
import ApolloClient from "apollo-client";
import {HttpLink} from "apollo-link-http";
import {InMemoryCache} from "apollo-cache-inmemory";

import {PageLayout} from "./components/PageLayout";

const client = new ApolloClient({
    link: new HttpLink({uri: "/graphql"}),
    cache: new InMemoryCache()
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

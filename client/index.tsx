import * as React from "react";
import * as ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";

import {ApolloApp} from "./ApolloApp";

require("file-loader?name=index.html!../index.html");

import "../semantic/dist/semantic.min.css"
import "react-table/react-table.css"

import "./util/theme.css";

const rootEl = document.getElementById("root");

const AppRoot = () => (
    <BrowserRouter>
        <ApolloApp/>
    </BrowserRouter>
);

ReactDOM.render(<AppRoot/>, rootEl);

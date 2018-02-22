import * as React from "react";

export const toastSuccess = (action: string) => {
    return (<div><h3>{`${action} successful`}</h3></div>);
};

export const toastError = (action: string, error: Error) => {
    return (<div><h3>{`${action} failed`}</h3>{error ? error.message : "(no additional details available)"}</div>);
};

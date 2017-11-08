import * as React from "react";
import {Modal, Button} from "react-bootstrap";
import {ITaskDefinition} from "../../../models/taskDefinition";
import {graphql} from "react-apollo";
import {ScriptContentsQuery} from "../../../graphql/taskDefinition";
import SyntaxHighlighter from "react-syntax-highlighter";

import { docco } from 'react-syntax-highlighter/dist/styles';

interface IViewScriptDialogProps {
    show: boolean;
    taskDefinition: ITaskDefinition;
    data?: any;

    onClose(): void;
}

interface IViewScriptDialogState {
}

@graphql(ScriptContentsQuery, {
    options: ({taskDefinition}) => ({
        variables: {
            task_definition_id: taskDefinition.id
        }
    })
})
export class ViewScriptDialog extends React.Component<IViewScriptDialogProps, IViewScriptDialogState> {
    public constructor(props: IViewScriptDialogProps) {
        super(props);
    }

    private renderContent() {
        const scriptContents = this.props.data && !this.props.data.loading ? this.props.data.scriptContents : null;
        if (scriptContents !== null) {
            return (
                <SyntaxHighlighter style={docco} language="Bash" showLineNumbers={true} customStyle={{fontSize: "12px"}}>
                    {scriptContents}
                </SyntaxHighlighter>
            );
        } else {
            return null;
        }
    }

    public render() {

        return (
            <Modal show={this.props.show} dialogClassName="view-code-modal" onHide={this.props.onClose} aria-labelledby="view-script-dialog">
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}} closeButton>
                    <Modal.Title id="view-script">Script</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.renderContent()}
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="success" onClick={() => this.props.onClose()}>OK</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

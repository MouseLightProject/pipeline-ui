import * as React from "react";
import {Modal, Button} from "semantic-ui-react";
import {ITaskDefinition} from "../../../models/taskDefinition";
import {graphql} from "react-apollo";
import {ScriptContentsQuery} from "../../../graphql/taskDefinition";
import SyntaxHighlighter from "react-syntax-highlighter";

import { docco } from 'react-syntax-highlighter/dist/styles';

interface IViewScriptDialogProps {
    element: any;
    show: boolean;
    taskDefinition: ITaskDefinition;
    data?: any;

    onClose(): void;
}

interface IViewScriptDialogState {
}

export class _ViewScriptDialog extends React.Component<IViewScriptDialogProps, IViewScriptDialogState> {
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
            <Modal trigger={this.props.element} open={this.props.show}>
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}}>
                    Script
                </Modal.Header>
                <Modal.Content>
                    {this.renderContent()}
                </Modal.Content>
                <Modal.Actions>
                    <Button bsStyle="success" onClick={() => this.props.onClose()}>OK</Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export const ViewScriptDialog = graphql<any, any>(ScriptContentsQuery, {
    options: ({taskDefinition}) => ({
        variables: {
            task_definition_id: taskDefinition.id
        }
    })
})(_ViewScriptDialog);

import {ApiQueue, ApiRequest} from "../apiQueue";

export interface IServerConfigurationMessage {
    buildVersion: number;
    processId: number;
}

export interface IInternalApiDelegate {
    onServerConfiguration?(message: IServerConfigurationMessage): void;
}

export class InternalApi extends ApiQueue {
    private readonly _delegate: IInternalApiDelegate = null;

    public constructor(delegate: IInternalApiDelegate) {
        super("/api/v1/internal");

        this._delegate = delegate;
    }

    public start(): boolean {
        if (super.start()) {
            this.requestServerConfiguration();

            return true;
        }

        return false;
    }

    public requestServerConfiguration(): boolean {
        return this.request(new ApiRequest({
            Path: "serverConfiguration", OnComplete: (data: IServerConfigurationMessage) => {
                if (this._delegate && this._delegate.onServerConfiguration) {
                    this._delegate.onServerConfiguration(data);
                }
            }
        }));
    }
}

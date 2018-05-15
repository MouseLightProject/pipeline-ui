import * as socketIOClient from "socket.io-client";

export interface IRealTimeApiDelegate {
    onServiceConnectionStateChanged?(isConnected: boolean): void;
}

export class RealTimeApi {
    private _socket: any = null;

    public constructor(delegate?: IRealTimeApiDelegate) {
        this.Delegate = delegate;
    }

    public Delegate: IRealTimeApiDelegate = null;

    public async connect() {
        try {
            const loc = window.location;
            const url = `${loc.protocol}//${loc.hostname}:${parseInt(loc.port) + 1}`;
            this._socket = socketIOClient(url);

            this._socket.on("connect", () => this.onServiceConnectionStateChanged(true));
            this._socket.on("disconnect", () => this.onServiceConnectionStateChanged(false));
        } catch (err) {
            console.log(err);
            console.log("could not establish socket-io connection; deferring socket-io connection");
            setTimeout(() => this.connect(), 15000);
            return;
        }
    }

    public close() {
        if (this._socket) {
            this._socket.close();
            this._socket = null;
        }
    }

    private onServiceConnectionStateChanged = (b: boolean) => {
        if (this.Delegate && this.Delegate.onServiceConnectionStateChanged) {
            this.Delegate.onServiceConnectionStateChanged(b);
        }
    };
}

import uuid = require("uuid");
import {AsyncQueue, queue} from "async";

export type RequestCompleteFunction = (data: any) => void;
export type RequestErrorFunction = (data: any) => boolean;

export enum ApiResponse {
    Never,
    OnSuccess,
    OnError,
    Always,
}

export class ApiRequest {
    Path: string;
    Method: string = "GET";
    Body: string = null;
    HasResponse: ApiResponse = ApiResponse.OnSuccess;
    OnComplete: RequestCompleteFunction = null;
    OnError: RequestErrorFunction = null;

    public constructor(init?: Partial<ApiRequest>) {
        Object.assign(this, init);
    }
}

/**
 * Provides a means to serialize calls to the REST endpoints and pause, resume, and retry requests in the queue if one
 * fails rather than each caller tracking connectivity.
 */
export class ApiQueue {
    private readonly _id: string;
    private readonly _basePath: string;
    private _queue: AsyncQueue<ApiRequest>;
    private _isKilled: boolean;

    public constructor(basePath: string) {
        this._id = uuid.v4();
        this._queue = null;
        this._isKilled = true;
        this._basePath = basePath || "";
    }

    public start(): boolean {
        if (this._isKilled) {
            this.createQueue();
            this._isKilled = false;
            console.log(`Started ${this._basePath} queue with id ${this._id}`);

            return true;
        }

        return false;
    }

    public kill() {
        if (!this._isKilled) {
            this._isKilled = true;

            if (this._queue) {
                this._queue.pause();
                this._queue.kill();
                this._queue = null;
            }
            console.log(`Killed queue with id ${this._id}`);
        }
    }

    public request(request: ApiRequest): boolean {
        if (this._queue) {
            this._queue.push(request);
            return true;
        }

        return false;
    }

    private async performRequest(request: ApiRequest, queueCompleteCallback: any) {
        if (this._isKilled) {
            return;
        }

        console.log(`performing ${request.Method} request '${request.Path}' on queue with id ${this._id}`);

        try {
            const response = await fetch(`${this._basePath}/${request.Path}`, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "content-type": "application/json"
                },
                method: request.Method,
                body: request.Body
            });

            if (response.ok && request.OnComplete) {
                let data = null;
                if (request.HasResponse === ApiResponse.Always || request.HasResponse === ApiResponse.OnSuccess) {
                    data = await response.json();
                }
                request.OnComplete(data);
            } else {
                let data = null;

                if (request.HasResponse === ApiResponse.Always || request.HasResponse === ApiResponse.OnError) {
                    data = await response.json();
                }

                if (request.OnError) {
                    request.OnError(data);
                } else {
                    console.log(`failed request ${request.Path}`);
                    console.log(response);
                }
            }
        } catch (err) {
            console.log(`pausing queue with id ${this._id} due to fetch error ${err}`);

            if (request.OnError) {
                const shouldPause = request.OnError(err);
                if (shouldPause) {
                    this._queue.pause();
                }
            } else {
                this._queue.pause();
                this._queue.unshift(request);
            }

            if (this._queue.paused) {
                setTimeout(() => this.resume(), 15000);
            }
        }

        // Must be called for next request to process.
        queueCompleteCallback();
    }

    private createQueue() {
        this._queue = queue<ApiRequest, any>((task, callback) => this.performRequest(task, callback), 1);
    }

    private resume() {
        if (!this._isKilled) {
            console.log(`resuming queue with id ${this._id}`);
            this._queue.resume();
        }
    }
}

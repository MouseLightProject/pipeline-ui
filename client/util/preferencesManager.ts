export interface INotificationListener {
    preferenceChanged(name: string, value: any);
}

const prefix = "mlpl:";

export class PreferencesManager {

    private static _instance = null;

    private _notificationListeners: INotificationListener[] = [];

    public static get Instance(): PreferencesManager {
        if (!this._instance) {
            this._instance = new PreferencesManager();
        }

        return this._instance;
    }

    public static get HavePreferences() {
        return typeof(Storage) !== undefined;
    }

    public constructor() {
        this.validateDefaultSettings();
    }

    public addListener(listener: INotificationListener) {
        if (this._notificationListeners.indexOf(listener) === -1) {
            this._notificationListeners.push(listener);
        }
    }

    public removeListener(listener: INotificationListener) {
        this._notificationListeners = this._notificationListeners.filter(n => n !== listener);
    }

    private notifyListeners(name: string, value: any) {
        this._notificationListeners.map(n => {
            n.preferenceChanged(name, value);
        })
    }

    public set IsProjecTableFiltered(b: boolean) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "isProjectTableFiltered", b ? "true" : "false");
        }
    }

    public get IsProjecTableFiltered() {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem(prefix + "isProjectTableFiltered") === "true";
        } else {
            return false;
        }
    }

    /*
    public get TracingSelectionHiddenOpacity() {
        if (typeof(Storage) !== undefined) {
            return parseFloat(localStorage.getItem(prefix + "tracingSelectionHiddenOpacity"));
        } else {
            return 0.0;
        }
    }

    public set TracingSelectionHiddenOpacity(n: number) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "tracingSelectionHiddenOpacity", n.toFixed(2));
        }
    }

    public get TracingFetchBatchSize() {
        if (typeof(Storage) !== undefined) {
            return parseInt(localStorage.getItem(prefix + "tracingFetchBatchSize"));
        } else {
            return 0.0;
        }
    }

    public set TracingFetchBatchSize(n: number) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "tracingFetchBatchSize", n.toFixed(0));
        }
    }
    */

    public set ProjectTableSort(obj: any) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "projectTableSort", JSON.stringify(obj));
        }
    }

    public get ProjectTableSort() {
        if (typeof(Storage) !== undefined) {
            const str = localStorage.getItem(prefix + "projectTableSort");

            if (str) {
                return JSON.parse(str);
            }
        }

        return null;
    }

    public set ProjectTableFilter(obj: any) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "projectTableFilter", JSON.stringify(obj));
        }
    }

    public get ProjectTableFilter() {
        if (typeof(Storage) !== undefined) {
            const str = localStorage.getItem(prefix + "projectTableFilter");

            if (str) {
                return JSON.parse(str);
            }
        }

        return null;
    }

    private validateDefaultSettings() {
        if (typeof(Storage) !== undefined) {
            if (!localStorage.getItem(prefix + "projectTableSort")) {
                localStorage.setItem(prefix + "projectTableSort", JSON.stringify([{
                    id: "created_at",
                    desc: true
                }]));
            }

            if (!localStorage.getItem(prefix + "projectTableFilter")) {
                localStorage.setItem(prefix + "projectTableFilter", JSON.stringify([]));
            }

            if (!localStorage.getItem(prefix + "isProjectTableFiltered")) {
                localStorage.setItem(prefix + "isProjectTableFiltered", "false");
            }
        }
    }
}

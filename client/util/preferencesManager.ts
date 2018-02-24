import {AllProjectsId} from "../components/helpers/ProjectMenu";
import {TilePipelineStatus} from "../models/tilePipelineStatus";

export const pollingIntervalSeconds = 10;

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

    public set IsSidebarCollapsed(b: boolean) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "isSidebarCollapsed", b ? "true" : "false");
        }
    }

    public get IsSidebarCollapsed(): boolean {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem(prefix + "isSidebarCollapsed") === "true";
        } else {
            return false;
        }
    }

    public set PreferredProjectId(id: string) {
        if (typeof(Storage) !== undefined) {
            sessionStorage.setItem(prefix + "preferredProjectId", id);
        }
    }

    public get PreferredProjectId(): string {
        if (typeof(Storage) !== undefined) {
            return sessionStorage.getItem(prefix + "preferredProjectId");
        } else {
            return AllProjectsId;
        }
    }

    public get TilePipelineStatus(): TilePipelineStatus {
        if (typeof(Storage) !== undefined) {
            return parseInt(localStorage.getItem(prefix + "tilePipelineStatus"));
        } else {
            return TilePipelineStatus.Failed;
        }
    }

    public set TilePipelineStatus(s: TilePipelineStatus) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "tilePipelineStatus", s.toFixed(0));
        }
    }

    public set IsProjectTableFiltered(b: boolean) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "isProjectTableFiltered", b ? "true" : "false");
        }
    }

    public get IsProjectTableFiltered(): boolean {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem(prefix + "isProjectTableFiltered") === "true";
        } else {
            return false;
        }
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

    public set ProjectTableSort(obj: any) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "projectTableSort", JSON.stringify(obj));
        }
    }

    public get ProjectTableSort(): any {
        if (typeof(Storage) !== undefined) {
            const str = localStorage.getItem(prefix + "projectTableSort");

            if (str) {
                return JSON.parse(str);
            }
        }

        return null;
    }

    public set PreferredStageId(id: string) {
        if (typeof(Storage) !== undefined) {
            sessionStorage.setItem(prefix + "preferredStageId", id);
        }
    }

    public get PreferredStageId(): string {
        if (typeof(Storage) !== undefined) {
            return sessionStorage.getItem(prefix + "preferredStageId");
        } else {
            return "";
        }
    }

    public set IsStageTableFiltered(b: boolean) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "isStageTableFiltered", b ? "true" : "false");
        }
    }

    public get IsStageTableFiltered(): boolean {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem(prefix + "isStageTableFiltered") === "true";
        } else {
            return false;
        }
    }

    public set StageTableFilter(obj: any) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "stageTableFilter", JSON.stringify(obj));
        }
    }

    public get StageTableFilter() {
        if (typeof(Storage) !== undefined) {
            const str = localStorage.getItem(prefix + "stageTableFilter");

            if (str) {
                return JSON.parse(str);
            }
        }

        return null;
    }

    public set StageTableSort(obj: any) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "stageTableSort", JSON.stringify(obj));
        }
    }

    public get StageTableSort(): any {
        if (typeof(Storage) !== undefined) {
            const str = localStorage.getItem(prefix + "stageTableSort");

            if (str) {
                return JSON.parse(str);
            }
        }

        return null;
    }

    public set StageDetailsPageSize(size: number) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem(prefix + "stageDetailsPageSize", size.toFixed(0));
        }
    }

    public get StageDetailsPageSize(): number {
        if (typeof(Storage) !== undefined) {
            return parseInt(localStorage.getItem(prefix + "stageDetailsPageSize"));
        } else {
            return 20;
        }
    }

    private validateDefaultSettings() {
        if (typeof(Storage) !== undefined) {
            if (!localStorage.getItem(prefix + "isSidebarCollapsed")) {
                localStorage.setItem(prefix + "isSidebarCollapsed", "false");
            }

            if (!localStorage.getItem(prefix + "projectTableSort")) {
                localStorage.setItem(prefix + "projectTableSort", JSON.stringify([{
                    id: "created_at",
                    desc: true
                }]));
            }

            if (!localStorage.getItem(prefix + "isProjectTableFiltered")) {
                localStorage.setItem(prefix + "isProjectTableFiltered", "false");
            }

            if (!localStorage.getItem(prefix + "projectTableFilter")) {
                localStorage.setItem(prefix + "projectTableFilter", JSON.stringify([]));
            }

            if (!localStorage.getItem(prefix + "stageTableSort")) {
                localStorage.setItem(prefix + "stageTableSort", JSON.stringify([{
                    id: "created_at",
                    desc: true
                }]));
            }

            if (!localStorage.getItem(prefix + "isStageTableFiltered")) {
                localStorage.setItem(prefix + "isStageTableFiltered", "false");
            }

            if (!localStorage.getItem(prefix + "stageTableFilter")) {
                localStorage.setItem(prefix + "stageTableFilter", JSON.stringify([]));
            }

            if (!sessionStorage.getItem(prefix + "preferredProjectId")) {
                sessionStorage.setItem(prefix + "preferredProjectId", AllProjectsId);
            }

            if (!localStorage.getItem(prefix + "tilePipelineStatus")) {
                localStorage.setItem(prefix + "tilePipelineStatus", TilePipelineStatus.Failed.toFixed(0));
            }
        }
    }
}

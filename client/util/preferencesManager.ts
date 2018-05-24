import {AllProjectsId} from "../components/helpers/ProjectMenu";
import {TilePipelineStatus} from "../models/tilePipelineStatus";

export interface INotificationListener {
    preferenceChanged(name: string, value: any);
}

export class PreferencesManager {
    private static _instance: PreferencesManager = null;

    public readonly HaveStorage: boolean;

    private _notificationListeners: INotificationListener[] = [];

    public static get Instance(): PreferencesManager {
        if (!this._instance) {
            this._instance = new PreferencesManager();
        }

        return this._instance;
    }

    public constructor() {
        this.HaveStorage = typeof(Storage) !== undefined;
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

    public get IsSidebarCollapsed(): boolean {
        return this.loadLocalValue(isSidebarCollapsed, "true") === true.toString();
    }

    public set IsSidebarCollapsed(b: boolean) {
        this.saveLocalValue(isSidebarCollapsed, b.toString());
    }

    public get PreferredProjectId(): string {
        return this.loadLocalValue(preferredProjectId, AllProjectsId);
    }

    public set PreferredProjectId(id: string) {
        this.saveLocalValue(preferredProjectId, id);
    }

    public get TilePipelineStatus(): TilePipelineStatus {
        return parseInt(this.loadLocalValue(tilePipelineStatus, TilePipelineStatus.Failed.toFixed(0)));
    }

    public set TilePipelineStatus(s: TilePipelineStatus) {
        this.saveLocalValue(tilePipelineStatus, s.toFixed(0));
    }

    public get IsProjectTableFiltered(): boolean {
        return this.loadLocalValue(isProjectTableFiltered, "true") === true.toString();
    }

    public set IsProjectTableFiltered(b: boolean) {
        this.saveLocalValue(isProjectTableFiltered, b.toString());
    }

    public get ProjectTableFilter() {
        return JSON.parse(this.loadLocalValue(projectTableFilter, emptyFilter));
    }

    public set ProjectTableFilter(obj: any) {
        this.saveLocalValue(projectTableFilter, JSON.stringify(obj));
    }

    public get ProjectTableSort(): any {
        return JSON.parse(this.loadLocalValue(projectTableSort, sortByCreatedAtDesc));
    }

    public set ProjectTableSort(obj: any) {
        this.saveLocalValue(projectTableSort, JSON.stringify(obj));
    }

    public get PreferredStageId(): string {
        return this.loadLocalValue(preferredStageId, "");
    }

    public set PreferredStageId(id: string) {
        this.saveLocalValue(preferredStageId, id);
    }

    public get IsStageTableFiltered(): boolean {
        return this.loadLocalValue(isStageTableFiltered, "true") === true.toString();
    }

    public set IsStageTableFiltered(b: boolean) {
        this.saveLocalValue(isStageTableFiltered, b.toString());
    }

    public get StageTableFilter() {
        return JSON.parse(this.loadLocalValue(stageTableFilter, emptyFilter));
    }

    public set StageTableFilter(obj: any) {
        this.saveLocalValue(stageTableFilter, JSON.stringify(obj));
    }

    public get StageTableSort(): any {
        return JSON.parse(this.loadLocalValue(stageTableSort, sortByCreatedAtDesc));
    }

    public set StageTableSort(obj: any) {
        this.saveLocalValue(stageTableSort, JSON.stringify(obj));
    }

    public get StageDetailsPageSize(): number {
        return parseInt(this.loadLocalValue(stageDetailsPageSize, `${20}`));
    }

    public set StageDetailsPageSize(size: number) {
        this.saveLocalValue(stageDetailsPageSize, size.toFixed(0));
    }

    public get WorkerTableSort(): any {
        return JSON.parse(this.loadLocalValue(workerTableSort, sortByNameAsc));
    }

    public set WorkerTableSort(obj: any) {
        this.saveLocalValue(workerTableSort, JSON.stringify(obj));
    }

    private notifyListeners(name: string, value: any) {
        this._notificationListeners.map(n => {
            n.preferenceChanged(name, value);
        });
    }

    private loadLocalValue(key: string, defaultValue: string) {
        if (this.HaveStorage) {
            return localStorage.getItem(prefix + key);
        } else {
            return defaultValue;
        }
    }

    private saveLocalValue(key: string, value: string) {
        if (this.HaveStorage) {
            localStorage.setItem(prefix + key, value);
            this.notifyListeners(key, value);
        }
    }

    private loadSessionValue(key: string, defaultValue: string) {
        if (this.HaveStorage) {
            return sessionStorage.getItem(prefix + key);
        } else {
            return defaultValue;
        }
    }

    private saveSessionValue(key: string, value: string) {
        if (this.HaveStorage) {
            sessionStorage.setItem(prefix + key, value);
            this.notifyListeners(key, value);
        }
    }

    private setDefaultLocalValue(key: string, value: string) {
        if (!localStorage.getItem(prefix + key)) {
            localStorage.setItem(prefix + key, value);
        }
    }

    private setDefaultSessionValue(key: string, value: string) {
        if (!sessionStorage.getItem(prefix + key)) {
            sessionStorage.setItem(prefix + key, value);
        }
    }

    private validateDefaultSettings() {
        if (typeof(Storage) !== undefined) {
            this.setDefaultLocalValue(isSidebarCollapsed, false.toString());

            this.setDefaultLocalValue(projectTableSort, sortByCreatedAtDesc);

            this.setDefaultLocalValue(isProjectTableFiltered, false.toString());

            this.setDefaultLocalValue(projectTableFilter, emptyFilter);

            this.setDefaultLocalValue(stageTableSort, sortByCreatedAtDesc);

            this.setDefaultLocalValue(preferredStageId, "");

            this.setDefaultLocalValue(stageDetailsPageSize, `${20}`);

            this.setDefaultLocalValue(isStageTableFiltered, false.toString());

            this.setDefaultLocalValue(stageTableFilter, emptyFilter);

            this.setDefaultLocalValue(workerTableSort, sortByNameAsc);

            this.setDefaultLocalValue(preferredProjectId, AllProjectsId);

            this.setDefaultLocalValue(tilePipelineStatus, TilePipelineStatus.Failed.toFixed(0));
        }
    }
}

const prefix = "mlpl:";

const isSidebarCollapsed = "isSidebarCollapsed";
const projectTableSort = "projectTableSort";
const isProjectTableFiltered = "isProjectTableFiltered";
const projectTableFilter = "projectTableFilter";
const stageTableSort = "stageTableSort";
const stageTableFilter = "stageTableFilter";
const preferredStageId = "preferredStageId";
const stageDetailsPageSize = "stageDetailsPageSize";
const isStageTableFiltered = "isStageTableFiltered";
const workerTableSort = "workerTableSort";
const preferredProjectId = "preferredProjectId";
const tilePipelineStatus = "tilePipelineStatus";

const sortByCreatedAtDesc = JSON.stringify([{
    id: "created_at",
    sort: "desc"
}]);

const sortByNameAsc = JSON.stringify([{
    id: "name",
    sort: "asc"
}]);

const emptyFilter = JSON.stringify([]);




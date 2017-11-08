import {ITaskDefinition} from "./taskDefinition";

export interface ITaskRepository {
    id: string;
    name?: string;
    description?: string;
    location?: string;
    task_definitions?: ITaskDefinition[];
    created_at?: Date;
    updated_at?: Date;
}

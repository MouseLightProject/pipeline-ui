import {ITaskDefinition} from "./QueryInterfaces";

export interface ITaskRepository {
    id: string;
    name?: string;
    description?: string;
    location?: string;
    taskDefinitions?: ITaskDefinition[];
    created_at?: Date;
    updated_at?: Date;
}

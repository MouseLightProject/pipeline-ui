import {IProject} from "./QueryInterfaces";

export function calculateProjectBreadth(project: IProject): number[] {
    return project.stages.reduce((breadths, stage) => {
        breadths[stage.depth] = breadths[stage.depth] ? (breadths[stage.depth] + 1) : 1;
        return breadths;
    }, [1]);
}

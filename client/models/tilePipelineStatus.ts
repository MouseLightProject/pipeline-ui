export enum TilePipelineStatus {
    DoesNotExist = 0,
    Incomplete = 1,
    Queued = 2,
    Processing = 3,
    Complete = 4,
    Failed = 5,
    Canceled = 6
}

export class TilePipelineStatusType {
    id: string;
    option: TilePipelineStatus;

    public constructor(id: string, option: TilePipelineStatus) {
        this.id = id;
        this.option = option;
    }

    public get canSubmit() {
        return this.option === TilePipelineStatus.Canceled || this.option === TilePipelineStatus.Failed;
    }
}

export let TILE_PIPELINE_STATUS_FAILED: TilePipelineStatusType = null;

export const TILE_PIPELINE_STATUS_TYPES: TilePipelineStatusType[] = makeTilePipelineStatusTypes();

function makeTilePipelineStatusTypes(): TilePipelineStatusType[] {

    const modes: TilePipelineStatusType[] = [];

    modes.push(new TilePipelineStatusType("Ready to Queue", TilePipelineStatus.Incomplete));

    TILE_PIPELINE_STATUS_FAILED = new TilePipelineStatusType("Failed", TilePipelineStatus.Failed);
    modes.push(TILE_PIPELINE_STATUS_FAILED);

    modes.push(new TilePipelineStatusType("Queued", TilePipelineStatus.Queued));
    modes.push(new TilePipelineStatusType("Processing", TilePipelineStatus.Processing));
    modes.push(new TilePipelineStatusType("Complete", TilePipelineStatus.Complete));
    modes.push(new TilePipelineStatusType("Canceled", TilePipelineStatus.Canceled));

    return modes;
}

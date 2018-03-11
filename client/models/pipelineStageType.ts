export enum PipelineStageMethod {
    DashboardProjectRefresh = 1,
    MapTile = 2,
    XAdjacentTileComparison = 3,
    YAdjacentTileComparison = 4,
    ZAdjacentTileComparison = 5
}


export class PipelineStageType {
    id: string;
    option: PipelineStageMethod;

    public constructor(id: string, option: PipelineStageMethod) {
        this.id = id;
        this.option = option;
    }

    public static fromMethodId(method: PipelineStageMethod):PipelineStageType  {
        switch (method) {
            case PipelineStageMethod.MapTile:
                return PIPELINE_STAGE_TYPE_MAP_TILE;
            case PipelineStageMethod.XAdjacentTileComparison:
                return PIPELINE_STAGE_TYPE_X_COMP;
            case PipelineStageMethod.YAdjacentTileComparison:
                return PIPELINE_STAGE_TYPE_Y_COMP;
            case PipelineStageMethod.ZAdjacentTileComparison:
                return PIPELINE_STAGE_TYPE_Z_COMP;
        }

        return PIPELINE_STAGE_TYPE_MAP_TILE;
    }
}

export let PIPELINE_STAGE_TYPE_MAP_TILE: PipelineStageType = null;
export let PIPELINE_STAGE_TYPE_X_COMP: PipelineStageType = null;
export let PIPELINE_STAGE_TYPE_Y_COMP: PipelineStageType = null;
export let PIPELINE_STAGE_TYPE_Z_COMP: PipelineStageType = null;

export const PIPELINE_STAGE_TYPES: PipelineStageType[] = makePipelineStageTypes();

function makePipelineStageTypes(): PipelineStageType[] {

    const modes: PipelineStageType[] = [];

    PIPELINE_STAGE_TYPE_MAP_TILE = new PipelineStageType("Map", PipelineStageMethod.MapTile);
    modes.push(PIPELINE_STAGE_TYPE_MAP_TILE);

    PIPELINE_STAGE_TYPE_X_COMP = new PipelineStageType("X Adjacent", PipelineStageMethod.XAdjacentTileComparison);
    modes.push(PIPELINE_STAGE_TYPE_X_COMP);

    PIPELINE_STAGE_TYPE_Y_COMP = new PipelineStageType("Y Adjacent", PipelineStageMethod.YAdjacentTileComparison);
    modes.push(PIPELINE_STAGE_TYPE_Y_COMP);

    PIPELINE_STAGE_TYPE_Z_COMP = new PipelineStageType("Z Adjacent", PipelineStageMethod.ZAdjacentTileComparison);
    modes.push(PIPELINE_STAGE_TYPE_Z_COMP);

    return modes;
}

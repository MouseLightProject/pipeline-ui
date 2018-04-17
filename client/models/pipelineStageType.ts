export enum PipelineStageMethods {
    DashboardProjectRefresh = 1,
    MapTile = 2,
    ZIndexTileComparison = 3
}

export class PipelineStageType {
    id: string;
    option: PipelineStageMethods;

    public constructor(id: string, option: PipelineStageMethods) {
        this.id = id;
        this.option = option;
    }

    public static fromMethodId(method: PipelineStageMethods):PipelineStageType  {
        switch (method) {
            case PipelineStageMethods.MapTile:
                return PIPELINE_STAGE_TYPE_MAP_TILE;
            case PipelineStageMethods.ZIndexTileComparison:
                return PIPELINE_STAGE_TYPE_Z_COMP;
        }

        return PIPELINE_STAGE_TYPE_MAP_TILE;
    }
}

export let PIPELINE_STAGE_TYPE_MAP_TILE: PipelineStageType = null;
export let PIPELINE_STAGE_TYPE_Z_COMP: PipelineStageType = null;

export const PIPELINE_STAGE_TYPES: PipelineStageType[] = makePipelineStageTypes();

function makePipelineStageTypes(): PipelineStageType[] {

    const modes: PipelineStageType[] = [];

    PIPELINE_STAGE_TYPE_MAP_TILE = new PipelineStageType("Map", PipelineStageMethods.MapTile);
    modes.push(PIPELINE_STAGE_TYPE_MAP_TILE);

    PIPELINE_STAGE_TYPE_Z_COMP = new PipelineStageType("Z Comparison", PipelineStageMethods.ZIndexTileComparison);
    modes.push(PIPELINE_STAGE_TYPE_Z_COMP);

    return modes;
}

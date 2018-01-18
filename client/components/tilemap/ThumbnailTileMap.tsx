import * as React from "react";
import {Container} from "semantic-ui-react";
import * as PIXI from "pixi.js";
import {IProject} from "../../models/project";

import {Configuration} from "../../../server/configuration";

interface IThumbnailTileProps {
    project: IProject;
    stageId: string;
    plane: number;
    projectPlaneTileStatus: any;
}

interface IThumbnailTileState {
}

const tileWidth = 89;
const tileHeight = 105;
const tileRatio = tileWidth / tileHeight;

export class ThumbnailTileMap extends React.Component<IThumbnailTileProps, IThumbnailTileState> {
    private _app: PIXI.Application;
    private _frameGraphics: PIXI.Graphics;
    private _container: PIXI.Container;

    private _xMin: number;
    private _yMin: number;
    private _xMax: number;
    private _yMax: number;
    private _xCount: number;
    private _yCount: number;
    private _xOffset: number;
    private _yOffset: number;
    private _xDelta: number;
    private _yDelta: number;

    public componentDidMount() {
        this._app = new PIXI.Application(800, 600);

        (this.refs.thumbnailCanvas as any).appendChild(this._app.view);

        this._frameGraphics = new PIXI.Graphics();

        this._app.stage.addChild(this._frameGraphics);

        this._container = new PIXI.Container();

        this._app.stage.addChild(this._container);

        window.addEventListener("resize", () => this.renderContent(this.props));

        this.renderContent(this.props);
    }

    public componentWillUnmount() {
        window.removeEventListener("resize", () => this.renderContent(this.props));
    }

    public componentWillReceiveProps(props: IThumbnailTileProps) {
        console.log("componentWillReceiveProps");
        this.renderContent(props);
    }

    public render() {
        console.log("render");
        return (
            <Container style={{width: "100%", height: "100%", padding: "0 5px 5px 5px"}}>
                <div className="thumbnail-canvas-container" ref="thumbnailCanvas"
                     style={{width: "100%", height: "800px"}}>
                </div>
            </Container>
        )
    }

    private renderContent(props: IThumbnailTileProps) {
        console.log("renderContent");
        this.updateDimensions();

        this.calculateDrawParameters(props);
        this.renderTileFrames(props);
    }

    private calculateDimensions() {
        const container = (this.refs.thumbnailCanvas as any);

        if (!container) {
            return {width: 0, height: 0};
        }

        return {width: container.clientWidth, height: container.clientHeight};
    }

    private updateDimensions() {
        const {width, height} = this.calculateDimensions();

        this._app.renderer.resize(width, height);
    }

    private calculateDrawParameters(props: IThumbnailTileProps) {
        const data = props.projectPlaneTileStatus || {};

        this._xMin = this.props.project.sample_x_min || data.x_min || 0;
        this._xMax = this.props.project.sample_x_max || data.x_max || 0;
        this._yMin = this.props.project.sample_y_min || data.y_min || 0;
        this._yMax = this.props.project.sample_y_max || data.y_max || 0;

        this._xCount = this._xMax - this._xMin + 1;
        this._yCount = this._yMax - this._yMin + 1;

        const viewRatio = this._app.renderer.width / this._app.renderer.height;

        if (viewRatio < tileRatio) {
            this._xDelta = Math.min(Math.floor(this._app.renderer.width / this._xCount), tileWidth);
            this._yDelta = this._xDelta / tileRatio;
        } else {
            this._yDelta = Math.min(Math.floor(this._app.renderer.height / this._yCount), tileHeight);
            this._xDelta = this._yDelta * tileRatio;
        }

        this._xOffset = (this._app.renderer.width - this._xDelta * this._xCount) / 2;
        this._yOffset = (this._app.renderer.height - this._yDelta * this._yCount) / 2;
    }

    private renderTileFrames(props: IThumbnailTileProps) {
        const tileMap: any = {};

        if (props.projectPlaneTileStatus && props.projectPlaneTileStatus.tiles) {
            props.projectPlaneTileStatus.tiles.map(t => {
                tileMap[t.x_index + "_" + t.y_index] = true;
            });
        }

        this._frameGraphics.clear();
        this._container.removeChildren();

        this._frameGraphics.beginFill(0x000000, 0);
        this._frameGraphics.lineStyle(2, 0xFFFFFF, 1);

        const yDiff = this._app.renderer.height - this._yOffset

        for (let idx = 0; idx < this._xCount; idx++) {
            for (let jdx = 0; jdx < this._yCount; jdx++) {
                if (tileMap[(idx + this._xMin) + "_" + (jdx + this._yMin)]) {
                    const x = this._xOffset + idx * this._xDelta;
                    const y = yDiff - (jdx + 1) * this._yDelta;

                    this._frameGraphics.drawRect(x, y, this._xDelta, this._yDelta);

                    const texture = PIXI.Texture.fromImage(`http://10.40.4.97:7000/thumbnail/${props.stageId}/${idx + this._xMin}/${jdx + this._yMin}/${props.plane}/Thumbs.png`, true);
                    //texture.update();
                    // const img = new Image();
                    // img.crossOrigin = "";
                    // img.src = `http://localhost:3000/thumbnail/${props.stageId}/${idx + this._xMin}/${jdx + this._yMin}/${props.plane}/Thumbs.png`;
                    // const base = new PIXI.BaseTexture(img);
                    // const texture = new PIXI.Texture(base);// return you the texture

                    const thumb = new PIXI.Sprite(texture);
                    thumb.anchor.set(0.0);
                    thumb.x = x;
                    thumb.y = y;
                    thumb.width = this._xDelta;
                    thumb.height = this._yDelta;

                    this._container.addChild(thumb);
                }
            }
        }

        this._frameGraphics.endFill();
    }
}

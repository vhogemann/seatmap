/// <reference path="./seatmap.ts" />

namespace SeatMap{
    export namespace View {
        
        export interface ISeatViewConfig{
            interactive : boolean;
        }
        
        export abstract class ASeatView {
            /** internal state of the view */
            seat : Model.Seat;
            config : ISeatViewConfig;
            container : PIXI.Container;
            
            private _sprite_size: number;
            private _base: PIXI.Sprite;
            private _label: PIXI.Sprite;
            private _icon: PIXI.Sprite;
            
            private _listeners: ISeatListener<ASeatView>[];
            public addListener(listener:ISeatListener<ASeatView>){
                if(this._listeners == null ){
                    this._listeners = [];
                }
                
                this._listeners.push(listener);
            }
            
            constructor(seat:Model.Seat, sprite_size:number, config: ISeatViewConfig){
                this.seat = seat;
                this._sprite_size = sprite_size;
                this.config = config;
                this.container = new PIXI.Container();
                
                this._base = this.createBase();
                this.container.addChild(this._base);
                
                this._icon = this.createIcon();
                this.container.addChild(this._icon);
                
                this._label = this.createIcon();
                this.container.addChild(this._label);
                
                if(config.interactive){
                    this.container.interactive = true;
                    this.container
                        .on("tap",ev => {if(!!this._listeners) this._listeners.forEach(l => l.onClick( this ))})
                        .on("click",ev => {if(!!this._listeners) this._listeners.forEach(l => l.onClick( this ))})
                        .on("mouseover",ev => {if(!!this._listeners) this._listeners.forEach(l => l.onMouseOver( this ))})
                        .on("mouseout",ev => {if(!!this._listeners) this._listeners.forEach(l => l.onMouseOut( this ))});
                }
            }
            
            abstract createBase() : PIXI.Sprite;
            abstract createLabel() : PIXI.Sprite;
            abstract createIcon() : PIXI.Sprite;

        }
        
        export interface ISeatListener<T extends ASeatView>  {
            onMouseOver(view:T);
            onMouseOut(view:T);
            onClick(view:T);
        }
        
        export interface IMapView {
            getBackground() : PIXI.Sprite;
        }
        
        export class DefaultSeatView extends ASeatView{
            
            createBase() : PIXI.Sprite {
                return null;    
            }
            
            createLabel() : PIXI.Sprite{
                return null;
            }
            
            createIcon() : PIXI.Sprite {
                return null;
            }
        }
        
    }
}
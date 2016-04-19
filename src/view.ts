/// <reference path="../typings/main.d.ts" />
/// <reference path="./seatmap.ts" />
namespace SeatMap{
    export namespace View {
        
        export interface ISeatViewConfig{
            interactive : boolean;
            icons : {[key:string]:PIXI.Texture}
        }
        
        /** available icons on the default texture */
        export type IconName = 
            "Obese"|"Companion"|"SuperD"|"Disability"|"MotionSimulator"
            |"ReducedMobility"|"Couple"|"SuperSeat"|"Circle"|"Square"
            |"Losangle"|"CoupleLeft"|"CoupleRight";
        
        /** base SeatView implementation, boilerplate goes here */
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
            
            /** returns the bottom layer of the seat */
            public abstract createBase() : PIXI.Sprite;
            
            /** returns the rendered label text */
            public abstract createLabel() : PIXI.Sprite;
            
            /** icon indicating that this is an special seat */
            public abstract createIcon() : PIXI.Sprite;
        }
        
        export interface ISeatListener<T extends ASeatView>  {
            onMouseOver(view:T);
            onMouseOut(view:T);
            onClick(view:T);
        }
        
        /** renders the seatmap background and receives zoom and pan events */
        export class MapView {
            
            container:PIXI.Container;
            
            constructor(seats:View.ASeatView[]){
                this.container = new PIXI.Container();
                seats.forEach( s => this.container.addChild(s.container));
            }
            
            /** sets the map scale, and centers aroud the point given by x and y */
            public setScale( scale:number, x: number, y:number ){
                this.container.scale = new PIXI.Point(scale,scale);
            }
            
            /** positions the map relative to its origin */
            public moveTo(x: number, y: number){
                this.container.position = new PIXI.Point(x,y);
            }
            
        }
        
        /** Default SeatView implementation */
        export class DefaultSeatView extends ASeatView implements ISeatListener<DefaultSeatView>{
            constructor(seat:Model.Seat, sprite_size:number, config: ISeatViewConfig){
                super(seat,sprite_size,config);
                /* 
                 Now this instance is listening to its container mouse events,
                 and can change it's own appareance based on them.
                 */
                this.addListener(this);
            }
            
            public createBase() : PIXI.Sprite {
                switch(this.seat.seatType){
                    case "Obese" :
                    case "Companion" :
                    case "ReducedMobility" :
                        return new PIXI.Sprite(this.config.icons["Square"]);
                    case "SuperD" :
                    case "SuperSeat" :
                    case "MotionSimulator" :
                        return new PIXI.Sprite(this.config.icons["Losangle"]);
                    case "CoupleLeft" :
                        return new PIXI.Sprite(this.config.icons["CoupleLeft"]);
                    case "CoupleRight" :
                        return new PIXI.Sprite(this.config.icons["CoupleRight"]);
                    default :
                        return new PIXI.Sprite(this.config.icons["Circle"]);
                }
            }
            
            public createLabel() : PIXI.Sprite{
                return null;
            }
            
            public createIcon() : PIXI.Sprite {
                return null;
            }
            
            public onMouseOver(view:DefaultSeatView){
                
            }
            
            public onMouseOut(view:DefaultSeatView){
                
            }
            
            public onClick(view:DefaultSeatView){
                
            }
        }
        
    }
}
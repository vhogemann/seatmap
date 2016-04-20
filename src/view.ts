/// <reference path="../typings/main.d.ts" />
/// <reference path="./seatmap.ts" />
namespace SeatMap{
    export namespace View {
        
        /** SeatView configuration options */
        export interface ISeatViewConfig{
            interactive : boolean;
            icons : {[key:string]:PIXI.Texture},
            palette: {[key:string]:number},
            label_style : PIXI.TextStyle
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
            
            protected sprite_size: number;
            protected base: PIXI.Sprite;
            protected label: PIXI.Sprite;
            protected icon: PIXI.Sprite;
            
            private _listeners: ISeatListener<ASeatView>[];
            public addListener(listener:ISeatListener<ASeatView>){
                if(this._listeners == null ){
                    this._listeners = [];
                }
                
                this._listeners.push(listener);
            }
            
            constructor(seat:Model.Seat, sprite_size:number, config: ISeatViewConfig){
                this.seat = seat;
                this.sprite_size = sprite_size;
                this.config = config;
                this.container = new PIXI.Container();
                
                this.container.position = new PIXI.Point(
                    seat.column * sprite_size,
                    seat.line * sprite_size
                );
                
                this.base = this.createBase();
                if(!!this.base) this.container.addChild(this.base);
                
                this.icon = this.createIcon();
                if(!!this.icon) this.container.addChild(this.icon);
                
                this.label = this.createIcon();
                if(!!this.label) this.container.addChild(this.label);
                
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
        
        /** SeatView event listener */
        export interface ISeatListener<T extends ASeatView>  {
            onMouseOver(view:T);
            onMouseOut(view:T);
            onClick(view:T);
        }
        
        /** renders the seatmap background and receives zoom and pan events */
        export class MapView {
            container:PIXI.Container;
            
            constructor(seats:View.ASeatView[], width:number, height: number){
                this.container = new PIXI.Container();
                this.container.width = width;
                this.container.height = height;
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
            
            /** returns the colour of the base according to the seat status */
            public baseTint() : number {
                return this.config.palette[this.seat.status];
            }
            
            public createBase() : PIXI.Sprite {
                let base:PIXI.Sprite = null;
                switch(this.seat.seatType){
                    case "Obese" :
                    case "Companion" :
                    case "ReducedMobility" :
                        base = new PIXI.Sprite(this.config.icons["Square"]);
                        break;
                    case "SuperD" :
                    case "SuperSeat" :
                    case "MotionSimulator" :
                        base = new PIXI.Sprite(this.config.icons["Losangle"]);
                        break;
                    case "CoupleLeft" :
                        base = new PIXI.Sprite(this.config.icons["CoupleLeft"]);
                        break;
                    case "CoupleRight" :
                        base = new PIXI.Sprite(this.config.icons["CoupleRight"]);
                        break;
                    default :
                        base = new PIXI.Sprite(this.config.icons["Circle"]);
                }
                
                //Define anchor and center the sprite
                base.width = this.sprite_size;
                base.height = this.sprite_size;
                base.anchor = new PIXI.Point( 0.5, 0.5 );
                base.position = new PIXI.Point( this.sprite_size/2, this.sprite_size/2 );
                
                //Colour of the sprite
                base.tint = this.baseTint();
                
                return base;
            }
            
            public showLabel() : boolean {
                switch (this.seat.seatType) {
                    case "Occupied":
                    case "Available":
                        return false ;
                    case "Selected":
                    default:
                        return true;
                }
            }
            
            public showIcon() : boolean { return !this.showLabel(); }
            
            public createLabel() : PIXI.Sprite{
                let label = new PIXI.Text(this.seat.label,this.config.label_style);
                //centers the text on both axis
                label.position = new PIXI.Point(
                    ( this.sprite_size - label.width ) / 2,
                    ( this.sprite_size - label.height ) / 2
                );
                
                label.alpha = this.showLabel() ? 1 : 0;
                
                return label;
            }
            
            public createIcon() : PIXI.Sprite {
                let texture = this.config.icons[this.seat.seatType];
                if(!!texture){
                    let icon = new PIXI.Sprite(texture);
                    icon.alpha = this.showLabel() ? 1 : 0;
                    icon.width = this.sprite_size;
                    icon.height = this.sprite_size;
                    return icon;
                }
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
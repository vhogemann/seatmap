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
        
        /** Stage configuration options */
        export interface IStageConfig{
            labelName: string,
            labelStyle: any,
            color: number
        }
        
        /** available icons on the default texture */
        export type IconName = 
            "Obese"|"Companion"|"SuperD"|"Disability"|"MotionSimulator"
            |"ReducedMobility"|"Couple"|"SuperSeat"|"Circle"|"Square"
            |"Losangle"|"CoupleLeft"|"CoupleRight";
        
        
        
        /** base SeatView implementation, boilerplate goes here */
        export abstract class ASeatView implements ISeatListener<DefaultSeatView> {
            /** internal state of the view */
            seat : Model.Seat;
            config : ISeatViewConfig;
            container : PIXI.Container;
            
            public sprite_size: number;
            public base: PIXI.Sprite;
            public label: PIXI.Sprite;
            public icon: PIXI.Sprite;
            
            public base_scale:number;
            
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
                if(!!this.base) { 
                    this.container.addChild(this.base);
                    this.base_scale = this.base.scale.x;
                }
                
                this.icon = this.createIcon();
                if(!!this.icon) this.container.addChild(this.icon);
                
                this.label = this.createLabel();
                if(!!this.label) this.container.addChild(this.label);
                
                if(config.interactive){
                    this.container.interactive = true;
                    this.container
                        .on("tap",ev => {if(!!this._listeners) this._listeners.forEach(l => l.onClick( this ))})
                        .on("click",ev => {if(!!this._listeners) this._listeners.forEach(l => l.onClick( this ))})
                        .on("mouseover",ev => {if(!!this._listeners) this._listeners.forEach(l => l.onMouseOver( this ))})
                        .on("mouseout",ev => {if(!!this._listeners) this._listeners.forEach(l => l.onMouseOut( this ))});
                }
                
                this.addListener(this);
            }
            
            /** returns the bottom layer of the seat */
            public abstract createBase() : PIXI.Sprite;
            
            /** returns the rendered label text */
            public abstract createLabel() : PIXI.Sprite;
            
            /** icon indicating that this is an special seat */
            public abstract createIcon() : PIXI.Sprite;
            
            public onMouseOver(view:DefaultSeatView){
                //nothing to do
            }
            
            public onMouseOut(view:DefaultSeatView){
                //nothing to do
            }
            
            public onClick(view:DefaultSeatView){
                switch (view.seat.status) {
                    case "Selected":
                        view.seat.status = "Available";
                        break;
                    case "Available":
                        view.seat.status = "Selected";
                        break;
                }
            }
            
        }
        
        /** SeatView event listener */
        export interface ISeatListener<T extends ASeatView>  {
            onMouseOver(view:T);
            onMouseOut(view:T);
            onClick(view:T);
        }
        
        export class DefaultSeatListener implements ISeatListener<DefaultSeatView>
        {
            public onMouseOver(view:DefaultSeatView){
                switch(view.seat.status){
                    case "Occupied" : break;
                    case "Available" :
                        if(!!view.icon)
                            view.icon.alpha = 0;
                        view.label.alpha = 1;
                    default :
                      let scale = view.base_scale * 1.2;
                      view.base.scale = new PIXI.Point(scale, scale);
                 }
            }
            
            public onMouseOut(view:DefaultSeatView){
                view.base.scale = new PIXI.Point(view.base_scale, view.base_scale);
                if(view.seat.status == "Available"){
                    if(!!view.icon)
                        view.icon.alpha = 1;
                    view.label.alpha = 0;
                }
            }
            
            public onClick(view:DefaultSeatView){
                 switch (view.seat.status) {
                     case "Selected":
                         view.base.tint = view.config.palette["Selected"];
                         if(!!view.icon)
                            view.icon.alpha = 0;
                         view.label.alpha = 1;
                         break;
                    case "Available":
                        view.base.tint = view.config.palette["Available"];
                        if(!!view.icon)
                            view.icon.alpha = 1;
                        view.label.alpha = 0;
                        break;
                 }
            }
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
        export class DefaultSeatView extends ASeatView {
            
            constructor(seat:Model.Seat, sprite_size:number, config: ISeatViewConfig){
                super(seat,sprite_size,config);
                this.addListener(new DefaultSeatListener());
            }
            
            /** returns the colour of the base according to Bthe seat status */
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
                switch (this.seat.status) {
                    case "Occupied":
                    case "Available":
                        return false ;
                    case "Selected":
                    default:
                        return true;
                }
            }
            
            public createLabel() : PIXI.Sprite{
                let text = this.seat.label.replace(/\s/g, "");
                let label = new PIXI.Text(text, this.config.label_style);
                //centers the text on both axis
                label.position = new PIXI.Point(
                    ( this.sprite_size - label.width ) / 2,
                    ( this.sprite_size - label.height ) / 2
                );
                
                label.alpha = this.showLabel() ? 1 : 0;
                
                return label;
            }
            
            public showIcon() : boolean { 
                return this.seat.status == "Available" || this.seat.status == "Occupied"; 
            }
            public createIcon() : PIXI.Sprite {
                let texture = this.config.icons[this.seat.seatType];
                if(!!texture){
                    let icon = new PIXI.Sprite(texture);
                    icon.alpha = this.showIcon() ? 1 : 0;
                    let icon_size = this.sprite_size * 0.6;
                    icon.width = icon_size;
                    icon.height = icon_size;
                    icon.anchor = new PIXI.Point(0.5,0.5);
                    icon.position = new PIXI.Point(
                        this.sprite_size / 2,
                        this.sprite_size / 2
                    );
                    return icon;
                }
                return null;
            }
        }
        
        /** Default stage view implementation*/
        export class DefaultStageView{
            container: PIXI.Graphics;
            
            constructor(stage: any, spriteSize: number, options: IStageConfig){
                
                let stageHeight: number = (Math.abs(stage.lowerRight.line - stage.upperLeft.line) + 1) * spriteSize;
                let stageWidth: number = ((stage.lowerRight.column - stage.upperLeft.column) + 1) * spriteSize;  
                let stageY: number = stage.upperLeft.line * spriteSize;
                let stageX: number = stage.upperLeft.column * spriteSize;
                
                this.container = new PIXI.Graphics();
                
                this.container.beginFill(options.color, 1);
                
                
                
                this.container.drawRect(stageX, stageY, stageWidth, stageHeight);
                                                               
                this.container.endFill();
                
                let label = new PIXI.Text(options.labelName, options.labelStyle);
                label.position = new PIXI.Point(
                    (stageWidth  / 2) - (label.width / 2),
                    stageY + ((spriteSize - label.height )/2)
                );
                
                this.container.addChild(label);
            }
        } 
        
    }
}
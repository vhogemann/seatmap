/// <reference path="../typings/main.d.ts" />

namespace SeatMap {
    
    export interface IMapOptions {
        /** base element size for the sprites, in pixels */
        sprite_size : number;
        /** texture map file */
        texture_map : string;
        /** should we try to enable WebGL, if available */
        enable_web_gl : boolean;
        /** view implementation for drawing seats */
        seat_view_class : View.ASeatView;
        /** view implementation for drawing the map */
        map_view_class : View.IMapView;
    }
    
    export class Map {
        
        private seats_map : {[key:string]:Model.Seat};
        
        constructor( el: HTMLElement, data: any, options:IMapOptions ){
            
        }
    }
    
    export namespace Model{
        
        /** valid seat states */
        export type State = "Available" | "Selected" | "Occupied";
        
        /** available seat types */
        export type Type = "Regular" | "CoupleRight" | "CoupleLeft";
        
        export class Seat{
            id: string;
            state: State;
            seatType: Type;
            label: string;
            column: number;
            line: number;
        }        
    }
    
    export namespace View {
        interface View {
            container: PIXI.Container;
        }
        
        export interface IViewConfig{
            
        }
        
        export abstract class ASeatView implements View {
            /** internal state of the view */
            seat : Model.Seat;
            config : IViewConfig;
            container : PIXI.Container;
            
            constructor(seat:Model.Seat, config: IViewConfig){
                this.seat = seat;
                this.config = config;
            }
            
            abstract getBase() : PIXI.Sprite;
            abstract getText() : PIXI.Sprite;
            abstract getIcon() : PIXI.Sprite;
            abstract addEventListener(listener:IEventListener<ASeatView>);
        }
        
        export interface IEventListener<T extends View>  {
            onMouseOver(view:T);
            onMouseOut(view:T);
            onClick(view:T);
        }
        
        export interface IMapView extends View {
            getBackground() : PIXI.Sprite;
        }
    }
    
}
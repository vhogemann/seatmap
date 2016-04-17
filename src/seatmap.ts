/// <reference path="../typings/main.d.ts" />
/// <reference path="./view.ts" />

namespace SeatMap {
    /** configuration options */
    export interface IMapOptions {
        /** base element size for the sprites, in pixels */
        sprite_size : number;
        /** texture map file */
        texture_map : string;
        /** should we try to enable WebGL, if available */
        disable_web_gl : boolean;
        /** view implementation for drawing seats */
        seat_view_class : View.ASeatView;
        /** view implementation for drawing the map */
        map_view_class : View.IMapView;
        /** configuration for the seat view */
        seat_config: View.ISeatViewConfig;
    }
    
    /** This class initializes and renders the SeatMap */
    export class Map {
        
        /** hashmap to hold the seats */
        private _seats_map : {[key:string]:Model.Seat} = {};
        
        private _renderer : PIXI.CanvasRenderer | PIXI.WebGLRenderer;
        
        private _container : PIXI.Container;
        
        constructor( el: HTMLElement, data: any, options:IMapOptions ){
            
            let columns : number = data.bounds.columns;
            let rows : number = data.bounds.rows;
            
            let width = columns * options.sprite_size;
            let height = columns * options.sprite_size;
            
            this._renderer = PIXI.autoDetectRenderer(width, height, { backgroundColor : 0xFFF }, options.disable_web_gl);
            
            el.appendChild(this._renderer.view); 
        }

        /** main animation loop */
        animate(){
            requestAnimationFrame(this.animate);
            this._renderer.render(this._container);
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
    
}
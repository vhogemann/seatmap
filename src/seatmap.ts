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
        /** configuration for the seat view */
        seat_config: View.ISeatViewConfig;
    }
    
    /** This class initializes and renders the SeatMap */
    export class Map {
        
        private _seats_map : {[key:string]:Model.Seat} = {};
        private _seats_arr : Model.Seat[];
        private _renderer : PIXI.CanvasRenderer | PIXI.WebGLRenderer;
        private _container : PIXI.Container;
        
        constructor( el: HTMLElement, data: any, options:IMapOptions ){
            
            let columns : number = data.bounds.columns;
            let rows : number = data.bounds.rows;
            
            let width = columns * options.sprite_size;
            let height = columns * options.sprite_size;
            
            data.seatmap.lines.forEach( l => {
               l.seats.forEach( s => {
                   var seat = new Model.Seat( s );
                   this._seats_map[seat.id] = seat;
                   this._seats_arr.push(seat);
               });
            });
            
            
            
            this._renderer = PIXI.autoDetectRenderer(width, height, { backgroundColor : 0xFFF }, options.disable_web_gl);
            el.appendChild(this._renderer.view); 
        }
        
        /** updates the state of a given seat */
        public setSeatState(seatId:string,state:Model.State){
            this._seats_map[seatId].state = state;
        }
        
        /** returns the seat with the given Id */
        public getSeat(seatId:string){
            return this._seats_map[seatId];
        }
        
        /** returns every seat with the given state */
        public getByState(state:Model.State):Model.Seat[]{
            var result = this._seats_arr.filter( s => s.state === state );
            return result;
        }

        /** main animation loop */
        public animate(){
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
            constructor( seat: any){
                
            }
        }        
    }
    
}
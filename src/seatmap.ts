/// <reference path="../typings/main.d.ts" />
/// <reference path="./view.ts" />

namespace SeatMap {
    /** configuration options */
    export interface IMapOptions {
        /** base element size for the sprites, in pixels */
        sprite_size: number;
        /** texture map file */
        texture_map: string;
        /** if we should try to enable WebGL, if available */
        disable_web_gl: boolean;
        /** configuration for the seat view */
        seat_config: View.ISeatViewConfig;
    }

    /** This class initializes and renders the SeatMap */
    export class Map {

        private _seats_map: { [key: string]: Model.Seat } = {};
        private _seats_arr: Model.Seat[] = new Array<Model.Seat>();
        private _renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer;
        private _container: PIXI.Container;

        constructor(el: HTMLElement, data: any, options: IMapOptions) {
            /*
             Canvas dimensions are calculated from the map columns and rows
             and the maximum sprite size/resolution;
             */
            let columns: number = data.bounds.columns;
            let rows: number = data.bounds.rows;

            let width = columns * options.sprite_size;
            let height = columns * options.sprite_size;

            let seat_views = new Array<View.ASeatView>();

            let loader = PIXI.loader.add(["assets/texture.json"]);

            loader.load(() => {
                
                let SEAT_CONFIG : View.ISeatViewConfig = {
                    interactive : false,
                    icons : {
                        "Obese": PIXI.Texture.fromFrame("Obese.png"),
                        "Companion": PIXI.Texture.fromFrame("Companion.png"),
                        "SuperD": PIXI.Texture.fromFrame("SuperD.png"),
                        "Disability": PIXI.Texture.fromFrame("Disability.png"),
                        "MotionSimulator": PIXI.Texture.fromFrame("MotionSimulator.png"),
                        "ReducedMobility": PIXI.Texture.fromFrame("ReducedMobility.png"),
                        "Couple": PIXI.Texture.fromFrame("Couple.png"),
                        //"SuperSeat": PIXI.Texture.fromFrame("SuperSeat.png"),
                        "Circle": PIXI.Texture.fromFrame("Circle.png"),
                        "Square": PIXI.Texture.fromFrame("Square.png"),
                        "Losangle": PIXI.Texture.fromFrame("Losangle.png"),
                        "CoupleLeft": PIXI.Texture.fromFrame("CoupleLeft.png"),
                        "CoupleRight": PIXI.Texture.fromFrame("CoupleRight.png")
                    },
                    palette : {
                        "Available" : 0x0cb0b1,
                        "Occupied" : 0xdbdbdb,
                        "Selected" : 0xd3793d
                    },
                    label_style: {
                        font : 'bold 50px "Trebuchet MS", Helvetica, sans-serif', fill: "white"
                    }
                }
                
                //TODO: See if the seat from JSON can be directly mapped as a Model.Seat
                data.lines.forEach(l => {
                    l.seats.forEach(s => {
                        var seat = new Model.Seat(s);
                        this._seats_map[seat.id] = seat;
                        this._seats_arr.push(seat);
                        seat_views.push(new View.DefaultSeatView(seat, options.sprite_size, SEAT_CONFIG));
                    });
                });
                let map = new View.MapView(seat_views);
                this._container = map.container;
                this._renderer = PIXI.autoDetectRenderer(width, height, { backgroundColor: 0xFFF }, options.disable_web_gl);
                el.appendChild(this._renderer.view);
                this.animate();
            });

        }

        /** updates the state of a given seat */
        public setSeatState(seatId: string, state: Model.Status) {
            this._seats_map[seatId].status = state;
        }

        /** returns the seat with the given Id */
        public getSeat(seatId: string) {
            return this._seats_map[seatId];
        }

        /** returns every seat with the given state */
        public getByState(state: Model.Status): Model.Seat[] {
            var result = this._seats_arr.filter(s => s.status === state);
            return result;
        }

        /** main animation loop */
        public animate() {
            let animate = this.animate;
            requestAnimationFrame(animate);
            this._renderer.render(this._container);
        }
    }

    export namespace Model {

        /** valid seat states */
        export type Status = "Available" | "Selected" | "Occupied";

        /** available seat types */
        export type Type = "Disability" | "ReducedMobility" | "Obese" | "Companion"
            | "CoupleLeft" | "CoupleRight" | "MotionSimulator" | "SuperD" | "SuperSeat";

        /** Seat */
        export class Seat {
            id: string;
            status: Status;
            seatType: Type;
            label: string;
            column: number;
            line: number;
            constructor(seat: any) {
                this.id = seat.id;
                this.status = seat.state;
                this.label = seat.label;
                this.line = seat.row;
                this.seatType = seat.type;
            }
        }
    }

}
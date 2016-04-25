/// <reference path="../typings/main.d.ts" />
declare namespace SeatMap {
    namespace View {
        /** SeatView configuration options */
        interface ISeatViewConfig {
            interactive: boolean;
            icons: {
                [key: string]: PIXI.Texture;
            };
            palette: {
                [key: string]: number;
            };
            label_style: PIXI.TextStyle;
        }
        /** Stage configuration options */
        interface IStageConfig {
            labelName: string;
            labelStyle: any;
            color: number;
        }
        /** available icons on the default texture */
        type IconName = "Obese" | "Companion" | "SuperD" | "Disability" | "MotionSimulator" | "ReducedMobility" | "Couple" | "SuperSeat" | "Circle" | "Square" | "Losangle" | "CoupleLeft" | "CoupleRight";
        /** base SeatView implementation, boilerplate goes here */
        abstract class ASeatView implements ISeatListener<DefaultSeatView> {
            /** internal state of the view */
            seat: Model.Seat;
            config: ISeatViewConfig;
            container: PIXI.Container;
            sprite_size: number;
            base: PIXI.Sprite;
            label: PIXI.Sprite;
            icon: PIXI.Sprite;
            base_scale: number;
            private _listeners;
            addListener(listener: ISeatListener<ASeatView>): void;
            constructor(seat: Model.Seat, sprite_size: number, config: ISeatViewConfig);
            /** returns the bottom layer of the seat */
            abstract createBase(): PIXI.Sprite;
            /** returns the rendered label text */
            abstract createLabel(): PIXI.Sprite;
            /** icon indicating that this is an special seat */
            abstract createIcon(): PIXI.Sprite;
            onMouseOver(view: DefaultSeatView): void;
            onMouseOut(view: DefaultSeatView): void;
            onClick(view: DefaultSeatView): void;
        }
        /** SeatView event listener */
        interface ISeatListener<T extends ASeatView> {
            onMouseOver(view: T): any;
            onMouseOut(view: T): any;
            onClick(view: T): any;
        }
        class DefaultSeatListener implements ISeatListener<DefaultSeatView> {
            onMouseOver(view: DefaultSeatView): void;
            onMouseOut(view: DefaultSeatView): void;
            onClick(view: DefaultSeatView): void;
        }
        /** renders the seatmap background and receives zoom and pan events */
        class MapView {
            container: PIXI.Container;
            constructor(seats: View.ASeatView[], width: number, height: number);
            /** sets the map scale, and centers aroud the point given by x and y */
            setScale(scale: number, x: number, y: number): void;
            /** positions the map relative to its origin */
            moveTo(x: number, y: number): void;
        }
        /** Default SeatView implementation */
        class DefaultSeatView extends ASeatView {
            constructor(seat: Model.Seat, sprite_size: number, config: ISeatViewConfig);
            /** returns the colour of the base according to Bthe seat status */
            baseTint(): number;
            createBase(): PIXI.Sprite;
            showLabel(): boolean;
            createLabel(): PIXI.Sprite;
            showIcon(): boolean;
            createIcon(): PIXI.Sprite;
        }
        class DefaultStageView {
            container: PIXI.Graphics;
            constructor(stage: any, spriteSize: number, options: IStageConfig);
        }
    }
}
declare namespace SeatMap {
    /** configuration options */
    interface IMapOptions {
        /** base element size for the sprites, in pixels */
        sprite_size: number;
        /** texture map file */
        texture_map: string;
        /** if we should try to enable WebGL, if available */
        disable_web_gl: boolean;
        /** configuration for the seat view */
        seat_config: View.ISeatViewConfig;
    }
    interface ReadyCallback {
        (map: Map): void;
    }
    /** This class initializes and renders the SeatMap */
    class Map {
        private _seats_map;
        private _seats_arr;
        private _renderer;
        private _container;
        constructor(el: HTMLElement, data: any, options: IMapOptions, onReady: ReadyCallback);
        /** updates the state of a given seat */
        setSeatState(seatId: string, state: Model.Status): void;
        /** returns the seat with the given Id */
        getSeat(seatId: string): Model.Seat;
        /** returns every seat with the given state */
        getByState(state: Model.Status): Model.Seat[];
        /** main animation loop */
        animate(): void;
    }
    namespace Model {
        /** valid seat states */
        type Status = "Available" | "Selected" | "Occupied";
        /** available seat types */
        type Type = "Disability" | "ReducedMobility" | "Obese" | "Companion" | "CoupleLeft" | "CoupleRight" | "MotionSimulator" | "SuperD" | "SuperSeat";
        /** Seat */
        class Seat {
            id: string;
            status: Status;
            seatType: Type;
            label: string;
            column: number;
            line: number;
            constructor(seat: any);
        }
    }
}

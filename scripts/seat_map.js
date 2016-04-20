var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../typings/main.d.ts" />
/// <reference path="./seatmap.ts" />
var SeatMap;
(function (SeatMap) {
    var View;
    (function (View) {
        /** base SeatView implementation, boilerplate goes here */
        var ASeatView = (function () {
            function ASeatView(seat, sprite_size, config) {
                var _this = this;
                this.seat = seat;
                this.sprite_size = sprite_size;
                this.config = config;
                this.container = new PIXI.Container();
                this.container.position = new PIXI.Point(seat.column * sprite_size, seat.line * sprite_size);
                this.base = this.createBase();
                if (!!this.base)
                    this.container.addChild(this.base);
                this.icon = this.createIcon();
                if (!!this.icon)
                    this.container.addChild(this.icon);
                this.label = this.createIcon();
                if (!!this.label)
                    this.container.addChild(this.label);
                if (config.interactive) {
                    this.container.interactive = true;
                    this.container
                        .on("tap", function (ev) { if (!!_this._listeners)
                        _this._listeners.forEach(function (l) { return l.onClick(_this); }); })
                        .on("click", function (ev) { if (!!_this._listeners)
                        _this._listeners.forEach(function (l) { return l.onClick(_this); }); })
                        .on("mouseover", function (ev) { if (!!_this._listeners)
                        _this._listeners.forEach(function (l) { return l.onMouseOver(_this); }); })
                        .on("mouseout", function (ev) { if (!!_this._listeners)
                        _this._listeners.forEach(function (l) { return l.onMouseOut(_this); }); });
                }
            }
            ASeatView.prototype.addListener = function (listener) {
                if (this._listeners == null) {
                    this._listeners = [];
                }
                this._listeners.push(listener);
            };
            return ASeatView;
        }());
        View.ASeatView = ASeatView;
        /** renders the seatmap background and receives zoom and pan events */
        var MapView = (function () {
            function MapView(seats) {
                var _this = this;
                this.container = new PIXI.Container();
                seats.forEach(function (s) { return _this.container.addChild(s.container); });
            }
            /** sets the map scale, and centers aroud the point given by x and y */
            MapView.prototype.setScale = function (scale, x, y) {
                this.container.scale = new PIXI.Point(scale, scale);
            };
            /** positions the map relative to its origin */
            MapView.prototype.moveTo = function (x, y) {
                this.container.position = new PIXI.Point(x, y);
            };
            return MapView;
        }());
        View.MapView = MapView;
        /** Default SeatView implementation */
        var DefaultSeatView = (function (_super) {
            __extends(DefaultSeatView, _super);
            function DefaultSeatView(seat, sprite_size, config) {
                _super.call(this, seat, sprite_size, config);
                /*
                 Now this instance is listening to its container mouse events,
                 and can change it's own appareance based on them.
                 */
                this.addListener(this);
            }
            /** returns the colour of the base according to the seat status */
            DefaultSeatView.prototype.baseTint = function () {
                return this.config.palette[this.seat.status];
            };
            DefaultSeatView.prototype.createBase = function () {
                var base = null;
                switch (this.seat.seatType) {
                    case "Obese":
                    case "Companion":
                    case "ReducedMobility":
                        base = new PIXI.Sprite(this.config.icons["Square"]);
                        break;
                    case "SuperD":
                    case "SuperSeat":
                    case "MotionSimulator":
                        base = new PIXI.Sprite(this.config.icons["Losangle"]);
                        break;
                    case "CoupleLeft":
                        base = new PIXI.Sprite(this.config.icons["CoupleLeft"]);
                        break;
                    case "CoupleRight":
                        base = new PIXI.Sprite(this.config.icons["CoupleRight"]);
                        break;
                    default:
                        base = new PIXI.Sprite(this.config.icons["Circle"]);
                }
                //Define anchor and center the sprite
                base.width = this.sprite_size;
                base.height = this.sprite_size;
                base.anchor = new PIXI.Point(0.5, 0.5);
                base.position = new PIXI.Point(this.sprite_size / 2, this.sprite_size / 2);
                //Colour of the sprite
                base.tint = this.baseTint();
                return base;
            };
            DefaultSeatView.prototype.showLabel = function () {
                switch (this.seat.seatType) {
                    case "Occupied":
                    case "Available":
                        return false;
                    case "Selected":
                    default:
                        return true;
                }
            };
            DefaultSeatView.prototype.showIcon = function () { return !this.showLabel(); };
            DefaultSeatView.prototype.createLabel = function () {
                var label = new PIXI.Text(this.seat.label, this.config.label_style);
                //centers the text on both axis
                label.position = new PIXI.Point((50 - label.width) / 2, (50 - label.height) / 2);
                label.alpha = this.showLabel() ? 1 : 0;
                return label;
            };
            DefaultSeatView.prototype.createIcon = function () {
                var texture = this.config.icons[this.seat.seatType];
                if (!!texture) {
                    var icon = new PIXI.Sprite(texture);
                    icon.alpha = this.showLabel() ? 1 : 0;
                    return icon;
                }
                return null;
            };
            DefaultSeatView.prototype.onMouseOver = function (view) {
            };
            DefaultSeatView.prototype.onMouseOut = function (view) {
            };
            DefaultSeatView.prototype.onClick = function (view) {
            };
            return DefaultSeatView;
        }(ASeatView));
        View.DefaultSeatView = DefaultSeatView;
    })(View = SeatMap.View || (SeatMap.View = {}));
})(SeatMap || (SeatMap = {}));
/// <reference path="../typings/main.d.ts" />
/// <reference path="./view.ts" />
var SeatMap;
(function (SeatMap) {
    /** This class initializes and renders the SeatMap */
    var Map = (function () {
        function Map(el, data, options) {
            var _this = this;
            this._seats_map = {};
            this._seats_arr = new Array();
            /*
             Canvas dimensions are calculated from the map columns and rows
             and the maximum sprite size/resolution;
             */
            var columns = data.bounds.columns;
            var rows = data.bounds.rows;
            var width = columns * options.sprite_size;
            var height = columns * options.sprite_size;
            var seat_views = new Array();
            var loader = PIXI.loader.add(["assets/texture.json"]);
            loader.load(function () {
                var SEAT_CONFIG = {
                    interactive: false,
                    icons: {
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
                    palette: {
                        "Available": 0x0cb0b1,
                        "Occupied": 0xdbdbdb,
                        "Selected": 0xd3793d
                    },
                    label_style: {
                        font: 'bold 50px "Trebuchet MS", Helvetica, sans-serif', fill: "white"
                    }
                };
                //TODO: See if the seat from JSON can be directly mapped as a Model.Seat
                data.lines.forEach(function (l) {
                    l.seats.forEach(function (s) {
                        var seat = new Model.Seat(s);
                        _this._seats_map[seat.id] = seat;
                        _this._seats_arr.push(seat);
                        seat_views.push(new SeatMap.View.DefaultSeatView(seat, options.sprite_size, SEAT_CONFIG));
                    });
                });
                var map = new SeatMap.View.MapView(seat_views);
                _this._container = map.container;
                _this._renderer = PIXI.autoDetectRenderer(width, height, { backgroundColor: 0xFFF }, options.disable_web_gl);
                el.appendChild(_this._renderer.view);
                _this.animate();
            });
        }
        /** updates the state of a given seat */
        Map.prototype.setSeatState = function (seatId, state) {
            this._seats_map[seatId].status = state;
        };
        /** returns the seat with the given Id */
        Map.prototype.getSeat = function (seatId) {
            return this._seats_map[seatId];
        };
        /** returns every seat with the given state */
        Map.prototype.getByState = function (state) {
            var result = this._seats_arr.filter(function (s) { return s.status === state; });
            return result;
        };
        /** main animation loop */
        Map.prototype.animate = function () {
            var animate = this.animate;
            requestAnimationFrame(animate);
            this._renderer.render(this._container);
        };
        return Map;
    }());
    SeatMap.Map = Map;
    var Model;
    (function (Model) {
        /** Seat */
        var Seat = (function () {
            function Seat(seat) {
                this.id = seat.id;
                this.status = seat.state;
                this.label = seat.label;
                this.line = seat.row;
                this.seatType = seat.type;
            }
            return Seat;
        }());
        Model.Seat = Seat;
    })(Model = SeatMap.Model || (SeatMap.Model = {}));
})(SeatMap || (SeatMap = {}));
//# sourceMappingURL=seat_map.js.map
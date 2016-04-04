"use strict";

angular.module('seatmap.model', [])
    .factory('SeatMap', function() {
        /** Wrapper Class para um assento */
        var Seat = function(seat, resources) {
            var _seat = this;

            var container = new PIXI.Container();
            _seat.container = container;
            container.interactive = true;

            this.label = seat.label.toUpperCase().replace(/(\s)/g, "");
            this.line = seat.line;
            this.column = seat.column;
            this.id = seat.id;
            this.status = seat.status;
            this.type = seat.type;

            var text = new PIXI.Text(this.label, resources.label.style);
            
            text.scale = { x: .4, y: .4 };
            text.position.x = (50 - text.width) / 2;
            text.position.y = (50 - text.height) / 2;
            text.alpha = 0;
            
            var icon = false;
            if( !!resources.icons[_seat.type] ){
                icon = new PIXI.Sprite(resources.icons[_seat.type]);
                icon.width = 25;
                icon.height = 25;
                icon.position = { 
                    x : (50 - icon.width) / 2,
                    y : (50 - icon.height) / 2 
                };
            }
            
            var base = new PIXI.Sprite(resources.icons.Circle);
            base.width = 50; base.height = 50;
            base.anchor = { x: 0.5, y: 0.5 };
            base.position = { x: 25, y: 25 };
            var bs = base.scale.x;
            
            switch(_seat.type) {
                case "Disability" :
                case "ReducedMobility" :
                case "Obese":
                case "Companion":
                    base.texture = resources.icons.Square;
                    break;
                case "MotionSimulator":
                case "SuperD":
                case "SuperSeat":
                    base.texture = resources.icons.Losangle;
                    break;
                case "CoupleLeft":
                    base.texture = resources.icons.CoupleLeft;
                    break;
                case "CoupleRight":
                    base.texture = resources.icons.CoupleRight;
                    break;
            }
            
            switch(_seat.status) {
                case "Available":
                    base.tint = 0x0cb0b1;
                    break;
                case "Occupied":
                    base.tint = 0xdbdbdb;
            }
            
            var click = function() {
                switch (_seat.status) {
                    case "Available":
                        base.tint = 0xd3793d;
                        if(icon) icon.alpha = 0;
                        base.scale = { x : bs * 1.2, y : bs * 1.2 };
                        text.alpha = 1;
                        _seat.status = "Selected";
                        break;
                    case "Selected":
                        base.tint = 0x0cb0b1;
                        if(icon) icon.alpha = 1;
                        base.scale = { x : bs, y : bs };
                        text.alpha = 0;
                        _seat.status = "Available";
                        break;
                    case "Occupied":
                        break;
                }
                if (!!resources.onClickSeat)
                    resources.onClickSeat(_seat);
            };
            
            var mouseOver = function() {
                if (_seat.status === "Available"){
//                        base.scale = { x : bs * 1.2, y : bs * 1.2 };
                    TweenLite.to(base.scale, 0.3, { x: bs * 1.3, y: bs * 1.3});
                    text.alpha = 1;
                    if(!!icon) icon.alpha = 0;
                }
                if (!!resources.onMouseOverSeat)
                  resources.onMouseOverSeat(_seat);
            };
            
            var mouseOut = function() {
                if (_seat.status != "Selected"){
//                        base.scale = { x : bs, y : bs };
                    TweenLite.to(base.scale, 0.3, { x: bs, y: bs });
                    text.alpha = 0;
                    if(!!icon) icon.alpha = 1;
                }
                if (!!resources.onMouseOutSeat)
                  resources.onMouseOutSeat(_seat);
            };

            container
                .on('click', click)
                .on('tap', click)
                .on('mouseover', mouseOver)
                .on('mouseout', mouseOut);

            container.position.x = seat.column * 50;
            container.position.y = seat.line * 50;

            container.addChild(base);
            container.addChild(text);
            if(!!icon)
                container.addChild(icon);

            resources.container.addChild(container);
        };

        /** Wrapper Class para uma linha */
        var Line = function(line, config) {
            this.seats = line.seats.map(function(seat) {
                var _seat = new Seat(seat, config);
            });
        };

        /** Wrapper Class para o mapa de assentos */
        var SeatMap = function(data, config) {

            var width = data.bounds.columns * 50;
            var height = data.bounds.lines * 50;

            var map = this;
            map.scale = 1;
            map.config = config;

            map.lines = data.lines.map(function(line) {
                return new Line(line, config);
            });

            map.setZoom = function(scale, translate) {
                var container = map.config.container;
                map.scale = scale;
                container.scale.x = scale;
                container.scale.y = scale;
                container.position.x = translate[0];
                container.position.y = translate[1];
            };
            
        };
        
        return {
            "new" : function( seat, config ){
                return new SeatMap(seat, config);
            }
        };

    });
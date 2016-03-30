"use strict";

angular.module('seatmap.model', [])
    .factory('SeatMap', function() {
        /** Wrapper Class para um assento */
        var Seat = function(seat, resources) {
            var _seat = this;

            var container = new PIXI.Container();
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
                    base.texture = resources.icons.Losangle;
                    break;
                case "Obese":
                    base.texture = resources.icons.Square;
                    break;
            }
            
            switch(_seat.status) {
                case "Available":
                    base.tint = 0x00aa00;
                    break;
                case "Occupied":
                    base.tint = 0xebebeb;
            }
            
            var click = function() {
                switch (_seat.status) {
                    case "Available":
                        base.tint = 0xff1100;
                        if(icon) icon.alpha = 0;
                        text.alpha = 1;
                        _seat.status = "Selected";
                        break;
                    case "Selected":
                        base.tint = 0x00aa00;
                        if(icon) icon.alpha = 1;
                        text.alpha = 0;
                        _seat.status = "Available";
                        break;
                    case "Occupied":
                        break;
                }
            };

            container
                .on('click', click)
                .on('tap', click)
                .on('mouseover', function() {
                    if (_seat.status === "Available"){
                        base.scale = { x : bs * 1.3, y : bs * 1.3 };
                        text.alpha = 1;
                        if(!!icon) icon.alpha = 0;
                    }
                })
                .on('mouseout', function() {
                    base.scale = { x : bs, y : bs };
                    if (_seat.status != "Selected"){
                        text.alpha = 0;
                        if(!!icon) icon.alpha = 1;
                    }
                });

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
            /** limita o movimento a area do mapa */
            map.checkBounds = function() {
                var container = map.config.container;

                var posX = container.position.x;
                var posY = container.position.y;

                var contW = width * map.scale;
                var contH = height * map.scale;

                if (posX > 0) posX = 0;
                if (posY > 0) posY = 0;

                if (contW + posX < width) posX = width - contW;
                if (contH + posY < height) posY = height - contH;

                container.position.x = posX;
                container.position.y = posY;
            };

            map.move = function(deltaX, deltaY) {
                var container = map.config.container;

                container.position.x += deltaX;
                container.position.y += deltaY;

                map.checkBounds();
            };

            map.setScale = function(s, c) {
                var container = map.config.container;
                
                var scale = map.scale;

                scale = scale * s;

                var pos = {
                    x : c.x - ( c.x * scale ),
                    y : c.y - ( c.y * scale )
                };

                if (scale > map.config.max_scale) {
                    scale = map.config.max_scale;
                    pos.x = container.position.x;
                    pos.y = container.position.y;
                }

                if (scale < 1) {
                    scale = 1;
                    pos.x = container.position.x;
                    pos.y = container.position.y;
                }
                
                map.scale = scale;
                
                container.position.x = pos.x;
                container.position.y = pos.y;

                container.scale.x = scale;
                container.scale.y = scale;
                
                map.checkBounds();
            };
        };
        
        return {
            "new" : function( seat, config ){
                return new SeatMap(seat, config);
            }
        };

    });
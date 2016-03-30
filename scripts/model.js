angular.module('seatmap.model', [])
    .factory('SeatMap', function() {
        /** Wrapper Class para um assento */
        var Seat = function(seat, config) {
            var _seat = this;

            var container = new PIXI.Container();
            container.interactive = true;

            this.label = seat.label.toUpperCase().replace(/(\s)/g, "");
            this.line = seat.line;
            this.column = seat.column;
            this.id = seat.id;
            this.status = seat.status;

            var text = new PIXI.Text(this.label, {
                font: 'bold 50px "Trebuchet MS", Helvetica, sans-serif',
                fill: 'white',
                stroke: 'black', strokeThickness: 2,
                dropShadow: true
            });
            text.scale = { x: 1 / 2, y: 1 / 2 };
            text.position.x = (50 - text.width) / 2;
            text.position.y = (50 - text.height) / 2;
            text.alpha = 0;

            var status = function() {
                switch (_seat.status) {
                    case "Available":
                        return new PIXI.Sprite(config.seat_available);
                    case "Selected":
                        return new PIXI.Sprite(config.seat_selected);
                    case "Occupied":
                        return new PIXI.Sprite(config.seat_occupied);
                }
            };

            var sprite = status();

            var click = function() {
                switch (_seat.status) {
                    case "Available":
                        sprite.texture = config.seat_selected;
                        text.alpha = 1;
                        _seat.status = "Selected";
                        break;
                    case "Selected":
                        sprite.texture = config.seat_available;
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
                    text.alpha = 1;
                    if (_seat.status === "Available")
                        sprite.texture = config.seat_highlight;
                })
                .on('mouseout', function() {
                    if (_seat.status != "Selected")
                        text.alpha = 0;

                    if (_seat.status === "Available")
                        sprite.texture = config.seat_available;
                });

            sprite.height = 50;
            sprite.width = 50;

            container.position.x = seat.column * 50;
            container.position.y = seat.line * 50;

            container.addChild(sprite);
            container.addChild(text);

            config.container.addChild(container);
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
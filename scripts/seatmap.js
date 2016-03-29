"use strict";

angular.module("seatmap", ["seatmap.gestures"])
    .directive("seatMap", function() {

        /** Wrapper Class para um assento */
        var Seat = function(seat, config) {
            var _seat = this;
            
            var container = new PIXI.Container();
            container.interactive = true;

            this.label = seat.label.toUpperCase().replace(/(\s)/g,"");
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
            text.scale = { x : 1/2, y : 1/2 };
            text.position.x = ( 50 - text.width  ) / 2;
            text.position.y = ( 50 - text.height ) / 2;
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
                        _seat.status = "Selected";
                        break;
                    case "Selected":
                        sprite.texture = config.seat_available;
                        text.alpha = 1;
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
                    if(_seat.status != "Selected")
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
            map.checkBounds = function(){
                var container = map.config.container;

                var posX = container.position.x;
                var posY = container.position.y;
                
                var contW = width * map.scale;
                var contH = height * map.scale;
                
                if( posX > 0 ) posX = 0;
                if(posY > 0 ) posY = 0;
               
                if( contW + posX < width ) posX = width - contW;
                if( contH + posY < height ) posY = height - contH;  
                
                console.log( {
                    w : contW,
                    h : contH
                });
                
                console.log( {
                    pw : width,
                    ph : height
                });
                
                console.log({ x: posX, y: posY });
                container.position.x = posX;
                container.position.y = posY;
                
            };

            map.move = function(deltaX, deltaY){
              var container = map.config.container;
              
              container.position.x += deltaX;
              container.position.y += deltaY;
              
              map.checkBounds();  
            };

            map.setScale = function(s, c) {
                var container = map.config.container;
                var scale = map.scale;
                var posX = container.position.x;
                var posY = container.position.y;

                posX -= (c.x/scale*s) - (c.x/scale);
                posY -= (c.y/scale*s) - (c.y/scale);

                scale = scale * s;
                
                if( scale > map.config.max_scale ) {
                    scale = map.config.max_scale;
                    posX = container.position.x;
                    posY = container.position.y;
                }

                if ( scale < 1 ) {
                    scale = 1;
                    posX = container.position.x;
                    posY = container.position.y;
                }
                map.scale = scale;

                container.scale.x = scale;
                container.scale.y = scale;
                
                container.position.x = posX;
                container.position.y = posY;
                
                map.checkBounds();
            };
        };

        var controller = function($element, seats, gestures) {
            var cntrl = this;

            seats.get(this.session, this.section).then(function(response) {
                var seatmap = new SeatMap(response.data,
                    { //FUTURE: Configuration object
                        max_scale : 3,
                        seat_available: PIXI.Texture.fromImage('assets/seat_available.png'),
                        seat_highlight: PIXI.Texture.fromImage('assets/seat_highlight.png'),
                        seat_selected: PIXI.Texture.fromImage('assets/seat.png'), //seat_selected.png
                        seat_occupied: PIXI.Texture.fromImage('assets/seat_occupied.png'),
                        container: new PIXI.Container()
                    });


                var width = response.data.bounds.columns * 50;
                var height = response.data.bounds.lines * 50;
                var renderer = PIXI.autoDetectRenderer(width, height, { backgroundColor: 0x1099bb });

                $element.append(renderer.view);

                $element.bind('wheel', function(e) {
                    var pos = { x : e.layerX, y: e.layerY };

                    e.preventDefault();
                    
                    if (e.deltaY / 120 < 0) {
                        seatmap.setScale( 1.1, pos );
                    }
                    else {
                        seatmap.setScale( 0.9, pos );
                    }
                });

                // create the root of the scene graph
                var stage = new PIXI.Container();
                stage.hitArea = new PIXI.Rectangle(0,0,width,height);
                stage.addChild(seatmap.config.container);
                
                gestures.pinchable(stage);
                gestures.panable(stage);
                
                stage
                    .on('pinchmove', function(e) {
                        seatmap.setScale(e.scale, e.center);
                    })
                    .on('panmove', function(e) {
                        seatmap.move(e.deltaX, e.deltaY);
                    });

                var scale = 1;

                // Main Loop
                var animate = function() {
                    requestAnimationFrame(animate);
                    renderer.render(stage);
                }
                animate();

            });
        };

        return {
            restrict: 'E',
            controller: controller,
            controllerAs: 'ctrl',
            template: '<div></div>',
            bindToController: {
                session: '=',
                section: '='
            }
        };
    })
    .service("seats", function($http) {
        return {
            get: function(session, sector) {
                return $http.get('https://api.ingresso.com/v1/sessions/' + session + '/sections/' + sector + '/seats');
            }
        }
    });
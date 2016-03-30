"use strict";

angular.module("seatmap", ["seatmap.model","seatmap.gestures"])
    .directive("seatMap", function() {


        var controller = function($element, seats, gestures, SeatMap) {
            var cntrl = this;

            seats.get(this.session, this.section).then(function(response) {
                var seatmap = SeatMap.new(response.data,
                    { //FUTURE: Configuration object
                        max_scale : 10,
                        seat_available: PIXI.Texture.fromImage('assets/seat_available.png'),
                        seat_highlight: PIXI.Texture.fromImage('assets/seat_highlight.png'),
                        seat_selected: PIXI.Texture.fromImage('assets/seat.png'), //seat_selected.png
                        seat_occupied: PIXI.Texture.fromImage('assets/seat_occupied.png'),
                        container: new PIXI.Container()
                    });


                var width = response.data.bounds.columns * 50;
                var height = response.data.bounds.lines * 50;
                var renderer = PIXI.autoDetectRenderer(width, height, { backgroundColor: 0xffffff }, true);

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
                
                var back_texture = PIXI.Texture.fromImage('assets/background.png');
                var background = new PIXI.TilingSprite(back_texture, width, height);
                stage.addChild(background);
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
            template: '',
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
"use strict";

angular.module("seatmap", ["seatmap.model", "seatmap.gestures"])
    .directive("seatMap", function() {

        var controller = function($element, seats, gestures, SeatMap) {
            var cntrl = this;

            var loader = PIXI.loader.add(["assets/texture.json"]);

            var render = function(response) {

                var seatmap = SeatMap.new(response.data,
                    { //FUTURE: Configuration object
                        max_scale: 10,
                        icons: {
                            "Obese": PIXI.Texture.fromFrame("Obese"),
                            "Companion": PIXI.Texture.fromFrame("Companion"),
                            "SuperD": PIXI.Texture.fromFrame("SuperD"),
                            "Disability": PIXI.Texture.fromFrame("Disability"),
                            "MotionSimulator": PIXI.Texture.fromFrame("MotionSimulator"),
                            "ReducedMobility": PIXI.Texture.fromFrame("ReducedMobility"),
                            "Couple": PIXI.Texture.fromFrame("Couple"),
                            "SuperSeat": PIXI.Texture.fromFrame("SuperSeat"),
                            "Circle": PIXI.Texture.fromFrame("Circle"),
                            "Square": PIXI.Texture.fromFrame("Square"),
                            "Losangle": PIXI.Texture.fromFrame("Losangle"),
                            "Round": PIXI.Texture.fromFrame("Round")
                        },
                        label: {
                            style: {
                                font: 'bold 50px "Trebuchet MS", Helvetica, sans-serif',
                                fill: 'white'
                            }
                        },
                        container: new PIXI.Container()
                    });


                var width = response.data.bounds.columns * 50;
                var height = response.data.bounds.lines * 50;
                var renderer = PIXI.autoDetectRenderer(width, height, { backgroundColor: 0xffffff }, true);

                $element.append(renderer.view);

                $element.bind('wheel', function(e) {
                    var pos = { x: e.layerX, y: e.layerY };

                    e.preventDefault();

                    if (e.deltaY / 120 < 0) {
                        seatmap.setScale(1.1, pos);
                    }
                    else {
                        seatmap.setScale(0.9, pos);
                    }
                });

                // create the root of the scene graph
                var stage = new PIXI.Container();
                stage.hitArea = new PIXI.Rectangle(0, 0, width, height);

                var back_texture = PIXI.Texture.fromImage('assets/background.png');
                var background = new PIXI.extras.TilingSprite(back_texture, width, height);
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

            };

            seats.get(this.session, this.section).then(function(response) {
                loader.load(function() { render(response); });
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
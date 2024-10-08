"use strict";

angular.module("seatmap", ["seatmap.model"])
    .directive("seatMap", function() {

        var controller = function($element, seats, SeatMap) {
            var cntrl = this;

            var loader = PIXI.loader.add(["assets/texture.json"]);

            var render = function(response) {

                var resetZoom = function() {
                    canvas.transition()
                        .duration(750)
                        .call(zoom.translate([0, 0]).scale(1).event);
                }
                
                var seatmap = SeatMap.new(response.data,
                    { //FUTURE: Configuration object
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
                console.log('width', [width, height]);
                var renderer = PIXI.autoDetectRenderer(width, height, { backgroundColor: 0xffffff }, true);

                $element.append(renderer.view);
                
                var zoomed = function() {
                    var e = d3.event;
                    var zoom = e.target;
                    seatmap.setZoom(e.scale, e.translate);
                };
                
                var bounds = function() {
                  var e = d3.event;
                  var zoom = e.target;
                  var translate = zoom.translate();
                  var scale = zoom.scale();
                  console.log('zoomend', scale, translate);
                  if (
                    (translate[0] < width - width * scale) || 
                    (translate[1] < height - height * scale) ||
                    (translate[0] > 0) ||
                    (translate[1] > 0)
                    ) {
                    var tx = Math.min(0, Math.max(translate[0], width - width * scale));
                    var ty = Math.min(0, Math.max(translate[1], height - height * scale));
                    canvas.transition()
                        .duration(250)
                        .call(zoom.translate([tx, ty]).event);
                  }
                }

                var zoom = d3.behavior.zoom()
                    .translate([0, 0])
                    .scale(1)
                    .size([width, height])
                    .scaleExtent([1, 8])
                    .on("zoom", zoomed)
                    .on("zoomend", bounds);
                    
                var canvas = d3.select(renderer.view).call(zoom).call(zoom.event);

                seatmap.config.onClickSeat = function(seat) {
                    //if (seat.status == "Selected") {
                        var x = seat.container.x + (50 / 2);
                        var y = seat.container.y + (50 / 2);
                        var scale = 4;
                        var translate = [width / 2 - scale * x, height / 2 - scale * y];
                        canvas.transition()
                            .duration(750)
                            .call(zoom.translate(translate).scale(scale).event);
                    //} else {
                        // resetZoom();
                    //}
                }
                
                // create the root of the scene graph
                var stage = new PIXI.Container();
                stage.hitArea = new PIXI.Rectangle(0, 0, width, height);

                var back_texture = PIXI.Texture.fromImage('assets/background.png');
                var background = new PIXI.extras.TilingSprite(back_texture, width, height);
                background.on('click', resetZoom);
                stage.addChild(background);
                stage.addChild(seatmap.config.container);

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
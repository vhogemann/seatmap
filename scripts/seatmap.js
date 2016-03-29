angular.module("seatmap", [])
    .directive('seatMap', function() {

        /** Wrapper Class para um assento */
        var Seat = function(seat, config) {
            var _seat = this;

            this.label = seat.label;
            this.line = seat.line;
            this.column = seat.column;
            this.id = seat.id;
            this.status = seat.status;


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
            sprite.interactive = true;

            var click = function() {
                switch (_seat.status) {
                    case "Available":
                        sprite.texture = config.seat_selected;
                        _seat.status = "Selected";
                        break;
                    case "Selected":
                        sprite.texture = config.seat_available;
                        _seat.status = "Available";
                        break;
                    case "Occupied":
                        break;
                }
            };

            sprite.on('click', click);
            sprite.on('tap', click);
            sprite.on('mouseover', function() {
                if (_seat.status === "Available")
                    sprite.texture = config.seat_highlight;
            });
            sprite.on('mouseout', function() {
                if (_seat.status === "Available")
                    sprite.texture = config.seat_available;
            });

            sprite.height = 50;
            sprite.width = 50;
            sprite.position.x = seat.column * 50;
            sprite.position.y = seat.line * 50;
            config.container.addChild(sprite);
        };

        /** Wrapper Class para uma linha */
        var Line = function(line, config) {
            this.seats = line.seats.map(function(seat) {
                var _seat = new Seat(seat, config);
            });
        };

        /** Wrapper Class para o mapa de assentos */
        var SeatMap = function(data, config) {

            var map = this;
            map.scale = 1;

            map.config = config;

            map.lines = data.lines.map(function(line) {
                var l = Line(line, config);
            });

            map.center = function(center, scale) {

            };

            map.setScale = function(s, c) {

                map.scale = s;

                if (map.scale < 1) map.scale = 1;
                if (map.scale > 2) map.scale = 2;

                //scale by .5 with anchor (a,b), then (x,y) will be sent to ((a+x)/2,((b+y)/2)
                var x = map.config.container.position.x;
                var y = map.config.container.position.y;

                /*
                x = (c.x + x) * scale;
                y = (c.y + y) * scale;
                
                map.config.container.position.x = x;
                map.config.container.position.y = y;
                */

                map.config.container.scale.x = s;
                map.config.container.scale.y = s;
            };
        };

        var controller = function($element, seats, TouchEvents) {
            var cntrl = this;

            seats.get(this.session, this.section).then(function(response) {
                var seatmap = new SeatMap(response.data,
                    { //FUTURE: Configuration object
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
                    e.preventDefault();
                    var scale = seatmap.scale;
                    if (e.deltaY / 120 < 0) {
                        seatmap.setScale( scale + 0.1, null );
                    }
                    else {
                        seatmap.setScale( scale - 0.1, null );
                    }
                });

                // create the root of the scene graph
                var stage = new PIXI.Container();
                stage.addChild(seatmap.config.container);

                TouchEvents.pinchable(stage);
                stage.on('pinchmove', function(e) {
                    var scale = seatmap.scale;
                    scale = scale * e.scale;
                    seatmap.setScale(scale, e.center);
                });


                var scale = 1;
                var direction = -0.01;

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
    })
    .service('TouchEvents', function() {
        var pinchable = function(sprite) {
            var start = function(e) {
                e.target.on('touchmove', move)
            }
            var move = function(e) {
                var t = e.data.originalEvent.targetTouches
                if (!t || t.length < 2) {
                    return
                }
                var dx = t[0].clientX - t[1].clientX
                var dy = t[0].clientY - t[1].clientY
                var distance = Math.sqrt(dx * dx + dy * dy)
                if (!e.target._pinch) {
                    e.target._pinch = {
                        p: { distance: distance, date: new Date() },
                        pp: {}
                    }
                    e.target.emit('pinchstart')
                    return
                }
                var center = {
                    x: (t[0].clientX + t[1].clientX) / 2,
                    y: (t[0].clientY + t[1].clientY) / 2
                }
                var now = new Date()
                var interval = now - e.target._pinch.p.date
                if (interval < 12) {
                    return
                }
                var event = {
                    scale: distance / e.target._pinch.p.distance,
                    velocity: distance / interval,
                    center: center,
                    data: e.data
                }
                e.target.emit('pinchmove', event)
                e.target._pinch.pp = {
                    distance: e.target._pinch.p.distance,
                    date: e.target._pinch.p.date
                }
                e.target._pinch.p = {
                    distance: distance,
                    date: now
                }
            }

            // TODO: Inertia Mode
            var end = function(e) {
                if (e.target._pinch) {
                    e.target.emit('pinchend')
                }
                e.target._pinch = null
                e.target.removeListener('touchmove', move)
            }

            sprite.interactive = true
            sprite
                .on('touchstart', start)
                .on('touchend', end)
                .on('touchendoutside', end)
        };

        return {
            pinchable: pinchable
        }
    });
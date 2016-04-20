/// <reference path="scripts/seat_map.d.ts" />
var ajax = new XMLHttpRequest();

ajax.onload = function () {
    var seats = JSON.parse(this.responseText);
    var el = document.getElementById('seatmap');
    var map = new SeatMap.Map(el, seats, {
        disable_web_gl : true,
        sprite_size : 64,
        texture_map : 'assets/texture.json'
    },
    function(m){
        var animate = function(){
            m.animate();
            requestAnimationFrame(animate);
        }
        animate();
    });
};

ajax.open('get','http://localhost:8080/seats.json',true);
ajax.send();
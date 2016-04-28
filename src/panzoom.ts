/// <reference path="../typings/main.d.ts" />
/// <reference path="./view.ts" />

namespace SeatMap{
    export namespace View {
        export class D3ZoomBehavior{
            public zoomable : IZoomable;
            constructor( el:HTMLElement, zoomable:IZoomable, width: number, height: number ){
                this.zoomable = zoomable;
                let zoom = d3.behavior.zoom()
                    .translate([0, 0])
                    .scale(1)
                    .size([width, height])
                    .scaleExtent([1, 8])
                    .on("zoom", ()=>{
                        let e : any = d3.event;
                        this.zoomable.scale( e.scale, e.translate[0], e.translate[1] )
                    });
                d3.select(el).call(zoom).call(zoom.event);
            }
            
        }
       
    }
}
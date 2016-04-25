/// <reference path="../typings/main.d.ts" />

namespace SeatMap{
    export namespace View {
        
        export interface IZoomable{
            width:number;
            height:number;
            scale( scale : number, x : number, y: number );    
            move( x: number, y: number);
        }
        
        export class D3ZoomBehavior{
            
            public zoomable : IZoomable;
            
            constructor( target:IZoomable ){
                this.zoomable = target;
                
                let zoom = d3.behavior.zoom()
                    .translate([0, 0])
                    .scale(1)
                    .size([this.zoomable.width, this.zoomable.height])
                    .scaleExtent([1, 8])
                    .on("zoom", ()=>{ })
                    .on("zoomend", ()=>{ });
            }
            
            
        }
       
    }
}
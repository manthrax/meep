function Terrain(){

    

    var noise = new SimplexNoise();
    
    var terrainPalette = ['Deep', 5, 'Shallow', 2, 'Beach', 1, 'Grass', 3, 'Rock', 1, 'Snow', 2];
    var colorPalette = {
        'Deep': 'DarkBlue',
        'Shallow': 'Teal',
        'Beach': 'Yellow',
        'Grass': 'Green',
        'Rock': 'DarkGrey',
        'Snow': 'White'
    };
    var tp = [];
    for (var i = 0; i < terrainPalette.length; i+=2) {
        var v = terrainPalette[i];
        var j = terrainPalette[i + 1];
        while (j--)
            tp.push(v);
    }
    terrainPalette = tp;

    var color2rgba={};
    function parseRGBA(rgbastr){
        var spstr = rgbastr.split(',');
        var out=[];
        for(var i=0;i<spstr.length;i++)
            out.push(spstr[i].replace(/\D/g,'')|0);
        if(out.length<4)out.push(255);
        return out;
    }

    this.buildColorLUT = function (){
        var d = document.createElement("div");
        document.body.appendChild(d)
        //Color in RGB 
        for(var i in colorPalette){
            var col = colorPalette[i];
            d.style.color = col;
            var rgba = window.getComputedStyle(d).color;
            color2rgba[col] = parseRGBA(rgba);
        }
        d.remove();
    }    

    var noiseScale = 0.03;

    this.generateMapTile = function (pdata,ox,oy,width,height){
        var oct1 = 1.0;
        var oct2 = 0.05;
        var osum = oct1+oct2;

        var f1 = 0.02;
        var f2 = 0.87;
        var terrains = new Array(width*height);

        for (var y = height; y > 0; ) { y--;
            for (var x = width; x > 0;) { x--;
                var px = (x+ox) * noiseScale;
                var py = (y+oy) * noiseScale;
                var nv = (noise.noise(px * f1, py * f1, 0)*oct1) + (noise.noise(px * f2, py * f2, 0) * oct2);
                var terrain = terrainPalette[((nv + osum) * terrainPalette.length * 0.49999 / osum) | 0];
                terrains[(y*width)+x]=terrain;
                var pi=((y*width)+x)*4;
                var crgba = color2rgba[colorPalette[terrain]];
                for(var i=0;i<4;i++)pdata[pi++]=crgba[i];
               // pdata[pi-1]=x;
               // pdata[pi-2]=y;
                //bgctx.fillStyle = colorPalette[terrain];
                //bgctx.fillRect(x, y, 1, 1);
                if(x==0||y==0)pdata[pi-2]=pdata[pi-3]=pdata[pi-4]=0;
            }
        }
        return terrains;
    }
}

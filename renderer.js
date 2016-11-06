function renderer(canv) {
    var noise = new SimplexNoise();
    var ctx = canv.getContext('2d');
    var bgcanv = document.createElement('canvas');
    var bgctx = bgcanv.getContext('2d');
    var celldim = 256;
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
    for (var i = 0; i < terrainPalette.length; i++) {
        var v = terrainPalette[i];
        var j = terrainPalette[i + 1];
        while (j--)
            tp.push(v);
    }
    terrainPalette = tp;
    var originX = 0;
    var originY = 0;
    var viewScale = 0.1;

    this.repaint = function(map) {
        var resize = false;
        if (canv.width != window.innerWidth) {
            canv.width = window.innerWidth;
            resize = true;
        }
        if (canv.height != window.innerHeight) {
            canv.height = window.innerHeight;
            resize = true;
        }
        if (resize) {
            bgcanv.width = canv.width;
            bgcanv.height = canv.height;
            bgctx.fillStyle = 'Teal';
            bgctx.fillRect(0, 0, canv.width, canv.height);
            for (var y = canv.height; y > 0; ) {
                y--;
                for (var x = canv.width; x > 0; ) {
                    x--;
                    var px = (originX + x) * viewScale;
                    var py = (originY + y) * viewScale;
                    var nv = noise.noise(px * 0.01, py * 0.01, 0) + (noise.noise(px * 0.07, py * 0.07, 0) * 0.2);
                    var terrain = terrainPalette[((nv + (1.2)) * terrainPalette.length * 0.49999) | 0];
                    bgctx.fillStyle = colorPalette[terrain];
                    bgctx.fillRect(x, y, 1, 1);
                }
            }
        }
        ctx.drawImage(bgcanv, 0, 0);
        ctx.fillStyle = 'Black';
        ctx.save();
        for (var items = map[0].items, len = items.length, i = 0; i < len; i++)
            items[i].draw(ctx);
    }
}

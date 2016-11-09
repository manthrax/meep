function World() {
    var celldim = 256;
    var originX = 64;
    var originY = 64;
    var map = this.map = {
        cells: {}
    }
    var terrain = new Terrain();
    terrain.buildColorLUT();
    this.add = function(obj) {
        var tile = this.pointToTile({
            x: obj.x | 0,
            y: obj.y | 0
        });
        this.getCell(tile.x, tile.y, function(cell) {
            obj.cell = cell;
            cell.items.push(obj);
        })
    }
    this.remove = function(obj) {
        obj.cell.items.splice(obj.cell.items.indexOf(obj), 1);
    }
    this.pointToTile = function(pt, tile) {
        tile = tile ? tile : {
            x: 0,
            y: 0
        };
        tile.x = (Math.floor(pt.x / celldim) | 0);
        tile.y = (Math.floor(pt.y / celldim) | 0);
        return tile;
    }
    var k1 = 10000;
    var k2 = k1 * 2;
    function tileKey(x, y) {
        return ((y + k1) * k2) + (x + k1);
    }
    var tcoord = {
        x: 0,
        y: 0
    };
    this.positionToCellKey = function(obj) {
        this.pointToTile(obj, tcoord);
        return tileKey(tcoord.x, tcoord.y);
    }
    this.moveObject = function(obj) {
        var key = this.positionToCellKey(obj);
        if (key != obj.cell.key) {
            this.remove(obj, obj.cell);
            this.add(obj);
        }
    }
    var bgctx;
    this.getCell = function(x, y, cbfn) {
        var key = tileKey(x, y);
        var cell = map.cells[key];
        if (!cell) {
            map.cells[key] = cell = {
                items: [],
                key: key,
                active: false
            };
            var mappixels = bgctx.createImageData(celldim, celldim);
            cell.terrain = terrain.generateMapTile(mappixels.data, x * celldim, y * celldim, celldim, celldim);
            //canv.width,canv.height);
            cell.pixels = mappixels;
            cell.active = true;
        }
        cbfn(cell);
        return cell;
    }
    this.getTerrainAtScreen = function(x, y, cbfn) {
        tcoord.x = x + originX;
        tcoord.y = y + originY;
        this.getTerrainAt(tcoord, cbfn);
    }
    this.getTerrainAt = function(obj, cbfn) {
        var ox = obj.x;
        var oy = obj.y;
        this.pointToTile(obj, tcoord);
        this.getCell(tcoord.x, tcoord.y, function(cell) {
            var fracX = (ox < 0 ? celldim + (ox % celldim) : ox % celldim) | 0;
            var fracY = (oy < 0 ? celldim + (oy % celldim) : oy % celldim) | 0;
            cbfn(cell.terrain[(fracY * celldim) + fracX]);
        });
    }
    this.moveOrigin = function(dx, dy) {
        this.setOrigin(originX + dx, originY + dy);
    }
    this.setOrigin = function(x, y) {
        if (x != originX || y != originY) {
            originX = x;
            originY = y;
            this.rebuildVisibleMap();
        }
    }
    this.rebuildVisibleMap = function(_bgctx) {
        bgctx = _bgctx ? _bgctx : bgctx;
        var topLeft = this.pointToTile({
            x: originX,
            y: originY
        });
        var bottomRight = this.pointToTile({
            x: originX + canv.width,
            y: originY + canv.height
        });
        var srx = -(originX % celldim);
        if (srx > 0)
            srx -= celldim;
        var sry = -(originY % celldim);
        if (sry > 0)
            sry -= celldim;
        for (var y = topLeft.y, ry = sry; y <= bottomRight.y; y++, ry += celldim)
            for (var x = topLeft.x, rx = srx; x <= bottomRight.x; x++, rx += celldim) {
                var cell = this.getCell(x, y, function(cell) {
                    if (!cell.bgImage) {
                        cell.bgImage = document.createElement('canvas');
                        cell.bgImage.width = cell.bgImage.height = celldim;
                        var ctx = cell.bgImage.getContext('2d');
                        ctx.putImageData(cell.pixels, 0, 0);
                    }
                    bgctx.drawImage(cell.bgImage, rx, ry);
                    //putImageData(cell.pixels,rx,ry);
                    bgctx.fillStyle = 'black';
                    bgctx.strokeStyle = 'white';
                    bgctx.strokeText('' + x + ',' + y, 10 + rx, 20 + ry);
                });
            }
    }
    this.drawItems = function(ctx) {
        ctx.save();
        ctx.translate(-originX, -originY);
        for (var ckey in map.cells)
            for (var items = map.cells[ckey].items, len = items.length, i = 0; i < len; i++)
                items[i].draw(ctx);
        ctx.restore();
    }


    var bots = [];
    var desiredPop = 1000;


    document.body.onpaste=function(evt){
        var pastedData = evt.clipboardData.getData('text/plain');
        var sprite = new Sprite(this);
        if(sprite.compile(pastedData)){
            var str = JSON.stringify(sprite.brain);
            for(var i=0;i<bots.length;i++){
                bots[i].brain=JSON.parse(str);
                bots[i].pc = 0;
            }
        }
    }
    
    this.start = function() {
        for (var i = 0; i < desiredPop; i++) {
            var sp = new Sprite(this);
            bots.push(sp);
            this.add(sp);
        }
    }
    var oldest;
    this.update = function() {
        for (var i = 0; i < bots.length; ) {
            var bot = bots[i];
            bot.update();
            if (bot.dead) {
                //Dead
                var top = bots.pop();
                if (top !== bot)
                    bots[i] = top;
            } else {
                i++;
                //Alive
            }
            if (!oldest || oldest.age < bot.age)
                oldest = bot;
        }
        if (bots.length < desiredPop) {
            //Breed
            var sp = new Sprite(this,oldest);
            bots.push(sp);
            this.add(sp);
        }
    }
    this.centerOnOldest = function() {
        if (!oldest)
            return;
        this.setOrigin(oldest.x - (canv.width * 0.5), oldest.y - (canv.height * 0.5));
    }
}
console.log("world")

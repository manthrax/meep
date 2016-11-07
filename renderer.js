function Renderer(canv,world) {

    var ctx = canv.getContext('2d');
    var bgcanv = document.createElement('canvas');
    var bgctx = bgcanv.getContext('2d');

    var buttons = 0;
    canv.onmousedown = function(evt){        
        buttons|=1<<evt.button;
    }
    canv.onmouseup = function(evt){
        buttons&=~(1<<evt.button);
    }
    canv.onmousemove = function(evt){        
        if(buttons==1){
            world.moveOrigin(-evt.movementX,-evt.movementY);
        }else{
            var terrain = world.getTerrainAtScreen(evt.clientX,evt.clientY,function(terrain){
                bgctx.fillRect(0,0,100,20);
                bgctx.strokeText(terrain,3,13)                
            });
        }
    }
    this.resize = function() {
        canv.width = window.innerWidth;
        canv.height = window.innerHeight;
        bgcanv.width = canv.width;
        bgcanv.height = canv.height;
        bgctx.fillStyle = 'Teal';
        bgctx.fillRect(0, 0, canv.width, canv.height);
        world.rebuildVisibleMap(bgctx);
    }

    this.resize();

    this.repaint = function(map) {
        var resize = false;
        if (canv.width != window.innerWidth || canv.height != window.innerHeight)
            this.resize();
        
        ctx.drawImage(bgcanv, 0, 0);
        ctx.fillStyle = 'Black';
        ctx.save();

        world.drawItems(ctx);
    }
}

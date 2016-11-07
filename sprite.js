function rnd(rng){var rng = rng?rng:1;return Math.random()*rng;}

var spriteIdTop = 0;
function Sprite(world){
    var p=this;
    p.world = world;
	p.x=rnd(canv.width);
	p.y=rnd(canv.height);
	p.z=0;
	p.vx=Math.random()-0.5;
	p.vy=Math.random()-0.5;
	p.vz=0;
	p.a=0;
	p.id = spriteIdTop++;
}

Sprite.prototype.draw = function(ctx){
	ctx.save();
	ctx.translate(this.x|0,this.y|0);
	ctx.rotate(this.a);
    ctx.fillRect(-4,-4,8,8);
    ctx.strokeStyle = 'white';
	ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(0,-8);
    ctx.stroke();
    ctx.restore();
}

Sprite.prototype.update = function(p){
    p=p?p:this;
	if(p.cell.active == false)
		return;
	p.a=Math.cos((frame+(p.id*0.7123))*-0.015463)*Math.sin(frame*-0.03241)*Math.PI;
	p.vx=Math.sin(p.a);
	p.vy=-Math.cos(p.a);

    var px = p.x;
    var py = p.y;
    p.x+=p.vx;
    p.y+=p.vy;

	p.world.getTerrainAt(p,function(terrain){
		if(terrain=='Grass')
			p.world.moveObject(p);
		else{
			p.x=px;
			p.y=py;
		}
	});

/*    if(p.x<0){p.x=0;p.vx*=-1;}
    if(p.y<0){p.y=0;p.vy*=-1;}
    if(p.x>canv.width){p.x=canv.width;p.vx*=-1;}
    if(p.y>canv.height){p.y=canv.height;p.vy*=-1;}
*/
}

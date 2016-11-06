function rnd(rng){var rng = rng?rng:1;return ((Math.random()*rng)+rng)*0.5;}

var spriteIdTop = 0;
function sprite(){
    var p=this;
	p.x=rnd(800);
	p.y=rnd(800);
	p.z=0;
	p.vx=Math.random();p.vy=Math.random();
	p.vz=0;
	p.a=0;
	p.id = spriteIdTop++;
}
sprite.prototype.draw = function(ctx){
	ctx.save();
	ctx.translate(this.x|0,this.y|0);
	ctx.rotate(this.a);
    ctx.fillRect(-4,-4,8,8);
	
    ctx.moveTo(0,0);
    ctx.lineTo(0,-8);
    //ctx.stroke();
    ctx.restore();
}

sprite.prototype.update = function(p){
    p=p?p:this;

	p.a=Math.sin((frame+(p.id*7))*-0.02)*Math.cos(frame*-0.01)*Math.PI;
	p.vx=Math.cos(p.a);
	p.vy=Math.sin(p.a);
    p.x+=p.vx;
    p.y+=p.vy;
    if(p.x<0){p.x=0;p.vx*=-1;}
    if(p.y<0){p.y=0;p.vy*=-1;}
    if(p.x>800){p.x=800;p.vx*=-1;}
    if(p.y>800){p.y=800;p.vy*=-1;}
}

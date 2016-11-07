var time=performance.now();
var frame=0;
function start(){
	var world = new World();
	var renderer = new Renderer(canv,world);

	var bots=[];

	for(var i=0;i<1000;i++){var sp=new Sprite(world);bots.push(sp);world.add(sp);}

	function render(){
		requestAnimationFrame(render);
		renderer.repaint();
		for(var i=0;i<bots.length;i++)bots[i].update();
		frame++;
	}
	requestAnimationFrame(render);
}
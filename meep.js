var time=performance.now();
var frame=0;
function start(){
	var world = new World();
	var renderer = new Renderer(canv,world);
	world.start();
	function render(){
		requestAnimationFrame(render);
		renderer.repaint();

		world.update();

		frame++;
	}
	requestAnimationFrame(render);
}
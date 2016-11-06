var time=performance.now();
var frame=0;
function start(){
	var mainview = new renderer(canv);
	var map={0:{cells:[],items:[]}}
	var bots=[];
	for(var i=0;i<10;i++){var sp=new sprite();bots.push(sp);map[0].items.push(sp);}
	function render(){
		requestAnimationFrame(render);
		mainview.repaint(map);
		for(var i=0;i<bots.length;i++)bots[i].update();
		frame++;
	}
	requestAnimationFrame(render);
}
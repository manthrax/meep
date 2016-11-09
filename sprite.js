function rnd(rng) {
    var rng = rng ? rng : 1;
    return Math.random() * rng;
}
var spriteIdTop = 0;
var codeSize = 256;
var dataSize = 256;

function Sprite(world,parent) {
    var p = this;
    p.world = world;
    p.x = rnd(canv.width);
    p.y = rnd(canv.height);
    p.z = 0;
    p.vx = Math.random() - 0.5;
    p.vy = Math.random() - 0.5;
    p.vz = 0;
    p.a = 0;
    p.id = spriteIdTop++;
    p.terrain = 'Grass';
    p.battery = 100.0;
    p.age = 0;
    p.brain = new Array(codeSize+dataSize);
    p.clockSpeed = 1.0;
    p.opCtr = 0.0;
    p.pc = 0;
    
    if(parent){
        p.x = parent.x+rnd(800)-400;
        p.y = parent.y+rnd(800)-400;
        for(var i=0;i<codeSize+dataSize;i++)p.brain[i]=parent.brain[i];
    }
}

var frms = Sprite.prototype.frames = [new Image()];
frms[0].src = '0001.png';
frms[0].onload = function() {
    console.log('frame loaded.');
}

Sprite.prototype.terrainStats = {
    'Grass': {
        move: 1,
        battery: 0.0001
    },
    'Beach': {
        move: 0.5,
        battery: 0.001
    },
    'Shallow': {
        move: 0.25,
        battery: 0.01
    },
    'Deep': {
        move: 0.05,
        battery: 1.0
    },
    'Rock': {
        move: 0,
        battery: 0.1
    },
    'Snow': {
        move: 0,
        battery: 0.1
    },
}

Sprite.prototype.draw = function(ctx) {
    ctx.save();
    ctx.translate(this.x | 0, this.y | 0);
    ctx.rotate(this.a);
    //    ctx.fillRect(-4,-4,8,8);
    var fwid = frms[0].width;
    ctx.drawImage(frms[0], fwid * -0.5, fwid * -0.5, fwid, fwid);
    //    ctx.drawImage(frms[0],-32,-32,64,64);
    /*    ctx.strokeStyle = 'white';
	ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(0,-8);
    ctx.stroke();
*/
    ctx.restore();
}

var INST_MASK = 255;

var ADDR_MASK = 255;

var RAM_BASE = 256;

var iobase = ADDR_MASK;
var IO_STEER    = iobase--;
var IO_MOVE     = iobase--;

var ioPorts= {
    'steering':IO_STEER,
    'movement':IO_MOVE,
}

Sprite.prototype.ioport = function(idx,value){
    if(value!==undefined)return this.brain[idx]=value;
    return this.brain[idx];
}


Sprite.prototype.ops = {
    'ldi':{type:'immediate',fn:function(p,o){p.accum = o;}},
    'ldm':{type:'addr',fn:function(p,o){p.accum = p.brain[o];}},
    'st':{type:'addr',fn:function(p,o){p.brain[o] = p.accum;}},
    'cmp':{type:'addr',fn:function(p,o){var v=p.brain[o];p.ccode=v<p.accum?-1:v>p.accum?1:0;}},
    'blt':{type:'label',fn:function(p,o){if(p.ccode<0)p.pc = o;}},
    'bgt':{type:'label',fn:function(p,o){if(p.ccode>0)p.pc = o;}},
    'beq':{type:'label',fn:function(p,o){if(p.ccode==0)p.pc = o;}},
    'jmp':{type:'label',fn:function(p,o){p.pc = o;}},
    'add':{type:'addr',fn:function(p,o){p.brain[o]+=p.accum;}},
    'sub':{type:'addr',fn:function(p,o){p.brain[o]-=p.accum;}},
    'mul':{type:'addr',fn:function(p,o){p.brain[o]*=p.accum;}},
    'div':{type:'addr',fn:function(p,o){p.brain[o]/=p.accum;}}
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function ascii2hex(str)  
{  
    var arr1 = [];  
    for (var n = 0, l = str.length; n < l; n ++)   
    {  
        var hex = Number(str.charCodeAt(n)).toString(16);  
        arr1.push(hex);  
    }  
    return arr1.join('');  
}

Sprite.prototype.compile = function(str){
    var lines = str.split('\n');
    var srclines = lines.slice(0);
    var labels={};
    var srcmap={};
    for(var i=0;i<lines.length;i++){    //Strip comments + whitespace + tokenize
        var comment = lines[i].indexOf('//');
        if(comment>=0)lines[i]=lines[i].slice(0,comment);
        lines[i] = lines[i].split(/[ ,\r]+/).filter(Boolean);
    }
    for(var i=0,mapbase=0;i<lines.length;){    //Strip white/empty lines
        if((lines[i].length==0)||((lines[i].length==1)&&(lines[i][0].length==1)))lines.splice(i,1);
        else{srcmap[i]=mapbase; i++;}
        mapbase++;
    }
    var srcdec = 0;
    var errors=[];
    for(var i=0;i<lines.length;){    //Find / translate / remove labels
        var ln = lines[i];
        var colon = ln[0].indexOf(':');
        if(colon>=0){
            ln[0]=ln[0].substr(0,colon);
            lines.splice(i,1);//Remove the line..
            labels[ln[0]] = i & INST_MASK;
            srcdec++;
        }
        else{ i++; srcmap[i]+=srcdec; }
    }
    var curOp=0;
    var ln;
    var pc=0;
    for(var i=0;i<lines.length;){
        try{
            //Compile instructions
            curOp=0;
            var ln = lines[i];
            if(ln.length<2)throw 'Expected more arguments'
            var op = this.ops[ln[0]];
            if(op==undefined)throw 'Unknown opcode'
            var targ;
            curOp = 1;
            if(op.type=='immediate'){
                var iv = parseFloat(ln[1]);
                if(isNaN(iv) || !isFinite(iv))throw 'Malformed immediate value'
                targ = iv;
            }else if(op.type=='label'){
                if(ln[1].indexOf('@')!=0)throw 'Malformed label reference'
                ln[1]=ln[1].substr(1)
                targ = labels[ln[1]]-1;
                if(targ==undefined)throw 'Label not found'
            }else if(op.type=='addr'){
                if(ln[1].indexOf('#')!=0){
                    if(ln[1].indexOf('[')!=0 || ln[1].indexOf(']')!=(ln[1].length-1))throw 'Malformed address'
                    ln[1]=ln[1].substr(1,ln[1].length-2);
                    var iv = parseFloat(ln[1]);
                    if(isNaN(iv) || (!isFinite(iv)) || ((iv&ADDR_MASK)!=iv))throw 'Malformed address value'
                    targ = iv;                   
                }else{
                    ln[1]=ln[1].substr(1);
                    var iv = ioPorts[ln[1]];
                    if(iv==undefined)throw 'Unrecognized io port'
                    targ = iv;
                }
                if(targ==undefined)throw 'Unexpected compiler error'
                targ += RAM_BASE;
            }
            if(pc>INST_MASK-2)throw 'Program to large'
            this.brain[pc++]={o:ln[0],p:targ};
        }
        catch(e){
            var err =(e + ':' + ln[curOp] + ' at line:' + srcmap[i] + '\n' + srcmap[i] + ':' + srclines[srcmap[i]]);
            errors.push(err);
        }
        i++;
    }
    console.log(JSON.stringify(this.brain.slice(0,pc),null,2));
    errors.push('Compiled with '+errors.length+' errors.');
    console.log(errors.join('\n'));
    if(errors.length==1)return true;
}

Sprite.prototype.cycle = function(p) {
    p = p ? p : this;
    var cmd = p.brain[p.pc];
    if(cmd){
        //console.log(cmd.o,cmd.p);
        this.ops[cmd.o].fn(p,cmd.p);
    }
    p.pc=(p.pc+1)&255;
}

Sprite.prototype.think = function(p) {
    p = p ? p : this;
    p.opCtr += p.clockSpeed;
    var opct = p.opCtr|0;
    p.opCtr-=opct;

    for(var i=0;i<opct;i++){
        p.cycle();
    }
}

var nmax=1.0;
function nclamp(v){
    v=v==undefined?0:v;
    v=parseFloat(v);
    return v<-nmax?-nmax:v>nmax?nmax:v;
}
Sprite.prototype.update = function(p) {
    p = p ? p : this;
    if (p.cell.active == false)
        return;

    this.think();

    var px = p.x;
    var py = p.y;
    p.terrain = p.terrain ? p.terrain : 'Deep';
    var tstats = p.terrainStats[p.terrain];

    var steer = nclamp(p.brain[IO_STEER+RAM_BASE]);
    var move = nclamp(p.brain[IO_MOVE+RAM_BASE]);
    p.a += steer * tstats.move;//Math.cos((frame + (p.id * 0.7123)) * -0.015463) * Math.sin(frame * -0.03241) * Math.PI;
    p.vx = Math.sin(p.a)*move;
    p.vy = -Math.cos(p.a)*move;

        
    p.x += p.vx * tstats.move;
    p.y += p.vy * tstats.move;
    p.world.getTerrainAt(p, function(terrain) {
        var tstats = p.terrainStats[terrain];
        if (tstats.move != 0) {
            p.world.moveObject(p);
            p.terrain = terrain;
        } else {
            p.x = px;
            p.y = py;
        }
        p.battery -= tstats.battery;
        if (p.battery < 0) {
            p.dead = true;
            p.world.remove(p);
        }else{
            p.age++;
        }
    });
    /*if(p.x<0){p.x=0;p.vx*=-1;}
    if(p.y<0){p.y=0;p.vy*=-1;}
    if(p.x>canv.width){p.x=canv.width;p.vx*=-1;}
    if(p.y>canv.height){p.y=canv.height;p.vy*=-1;}*/
}


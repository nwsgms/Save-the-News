function Animation() {
    this.__init__.apply(this, arguments);
}


Animation.prototype = {
  
    __init__ : function(basename, delay, left, top, endless) {
	_.bindAll(this, "render");
	if(endless === undefined) {
	    endless = true;
	}
	this.endless = endless;
	this.running = true;
	this.phases = [];
	this.left = left;
	this.top = top;
	var i = 0;
	while(true) {
	    var name = sprintf("%s_%02d", basename, i + 1);
	    var res = rm.get(name);
	    if(res === undefined) {
		break;
	    }
	    
	    this.phases.push(
		{
		    image : res,
		    delay : delay
		});
	    i += 1;
	}
	this.elapsed = 0;
	this.active = 0;
    },

    render : function(game, elapsed) {
	var phase = this.phases[this.active];
	var ctx = game.ctx;
	ctx.drawImage(phase.image, this.left, this.top);
	if(this.running && this.elapsed >= phase.delay) {
	    this.elapsed -= phase.delay;
	    this.active = (this.active + 1) % this.phases.length;
	    if(!this.endless && this.active == 0) {
		this.active = this.phases.length - 1;
		this.running = false;
	    }
	}
	this.elapsed += elapsed;
    }
};
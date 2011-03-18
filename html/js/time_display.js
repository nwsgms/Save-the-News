function TimerDisplay() {
    this.__init__.apply(this, arguments);
}

TimerDisplay.prototype = {
  
    __init__ : function(lifetime, hour, minute, second) {
	this.hour = hour;
	this.minute = minute;
	this.second = second;
	this.lifetime = lifetime;
	this.elapsed = .0;
	this.fill_style = "#fff";
	this.lineheight = 40;
	this.top = 0;
	this.left = 420;
	this.fontname = "Arial";
    },

    render : function(game, elapsed) {
	this.elapsed += elapsed;
	var f = Math.floor;
	var hour = f(this.hour);
	var minute = f(this.minute);
	var second = f(this.second);
	second += Math.floor(this.elapsed);
	while(second > 59) {
	    minute += 1;
	    second -= 60;
	}
	while(minute >59) {
	    hour += 1;
	    minute -= 60;
	}
	hour = hour % 24;
	var ts = sprintf("%02d:%02d:%02d", hour, minute, second);
	var ctx = game.ctx;
	ctx.save();
	ctx.fillStyle = this.fill_style;
	ctx.font = this.lineheight + "px " + this.fontname;
	ctx.fillText(ts, this.left, this.top + this.lineheight);
	ctx.restore();
	if(this.lifetime <= this.elapsed) {
	    game.over();
	}
    }
};
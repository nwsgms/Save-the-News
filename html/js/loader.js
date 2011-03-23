function LoadScreen() {
    this.__init__.apply(this, arguments);
}

LoadScreen.prototype = _.extend(
    { },
    GameBase.prototype,
    {
	BACKGROUND_COLOR : "#346e9e",

	__init__ : function(canvas, fps) {
	    GameBase.prototype.__init__.call(this, canvas, fps);
	    _.bindAll(this, "loop", "progress_changed", "loading_finished");
	    window.rm = new ResourceLoader();
	    window.rm.bind("change:progress", this.progress_changed);
	    window.rm.bind("change:finished", this.loading_finished);
	    this.progress = .0;
	    window.rm.start();
	},


	progress_changed : function(manager, progress) {
	    console.log("progress_changed");
	    console.log(manager);
	    console.log(progress);
	    this.progress = progress;
	},

	loading_finished : function() {
	    this.running = false;
	    window.game = new StartScreen(this.canvas, 30.0);
	    window.game.start();
	},

	loop : function(elapsed) {
            var ctx = this.ctx;
            ctx.save();
            ctx.fillStyle = this.BACKGROUND_COLOR;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	    ctx.fillStyle = "#fff";
	    ctx.font = "40px Arial";
	    ctx.fillText(Math.ceil(this.progress * 100.0) + "%", 100, 100);
	    ctx.restore();	    
	},

    }
);

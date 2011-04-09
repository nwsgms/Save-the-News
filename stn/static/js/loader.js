function LoadScreen() {
    this.__init__.apply(this, arguments);
}

LoadScreen.prototype = _.extend(
    { },
    GameBase.prototype,
    {
	BACKGROUND_COLOR : "#346e9e",

	__init__ : function(canvas, fps, scale, loading_finished_callback) {
	    GameBase.prototype.__init__.call(this, canvas, fps, scale);
	    _.bindAll(this, "loop", "progress_changed", "loading_finished");
            this.width = canvas.width / this.scale.x;
            this.height = canvas.height / this.scale.y;
	    window.rm = new ResourceLoader();
	    window.rm.bind("change:progress", this.progress_changed);
	    window.rm.bind("change:finished", this.loading_finished);
	    this.progress = .0;
	    window.rm.start();
	    this.callback = null;
	    if(loading_finished_callback !== undefined) {
		this.callback = loading_finished_callback;
	    }
	},


	progress_changed : function(manager, progress) {
	    log("progress_changed");
	    log(manager);
	    log(progress);
	    this.progress = progress;
	},

	loading_finished : function(manager, finished) {
	    this.running = false;
	    if(this.callback !== null) {
		this.callback();		
	    } else {
		window.game = new StartScreen(this.canvas, 30.0, this.scale);
		window.game.start();
	    }
	},

	loop : function(elapsed) {
            var ctx = this.ctx;
            ctx.save();
            ctx.fillStyle = this.BACKGROUND_COLOR;
            ctx.fillRect(0, 0, this.width, this.height);
	    ctx.fillStyle = "#fff";
	    ctx.font = "40px optimer";
	    ctx.fillText(Math.ceil(this.progress * 100.0) + "%", 100, 100);
	    ctx.restore();	    
	}
    }
);

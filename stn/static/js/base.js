function construct(constructor, args) {
    function F() {
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
}


function GameBase() {
    
};

SCALED = false;

GameBase.prototype = {
    __init__ : function(canvas, fps, scale) {
	_.bindAll(this, "render_debug_info", "game_over_screen", "start",
		  "run", "schedule", "mousepos", "goto_stage");
	if(scale === undefined) {
	    scale = { x : 1.0, y : 1.0};
	}
	if(typeof(scale) == "number") {
	    scale = { x : scale, y : scale};
	}
	this.scale = scale;
	
	// adjust our frame to the full width of
	// the retina display, we scale down
        var width = canvas.width / this.scale.x;
        var height = canvas.height / this.scale.y;
        this.frame = new Rect(0, 0, width, height);

	this.fps = fps;
	this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
	// ok, this sucks, but it appears as if 
	// the context you get from a canvas *is* already
	// scaled, once it has been scaled before..
	if(!SCALED) {
	    this.ctx.scale(scale.x, scale.y);
	    SCALED = true;	    
	}

	this.running = false;
	this.debug = false;
        this.max_fps = 0;
        this.min_fps = 1000;
    },


    run : function() {
        if(!this.running)
	    return;
        var t = new Date().getTime();
	// skip the first frame
	if(this.now === undefined) {
	    this.now = t;
	    this.schedule();
	}
        var elapsed = (t - this.now) / 1000.0;
        if (elapsed == 0) {
	    return;
        }
	this.now = t;
	// reschedule ourselves for the game-loop
	this.ctx.save();
	this.loop(elapsed);
	this.ctx.restore();
	this.schedule();
    },

    render_debug_info : function(ctx, elapsed) {
	function drawer() {
            var fps = Math.ceil(1.0 / elapsed);
            ctx.fillStyle = "rgba(0, 0, 0, .5)";
            ctx.fillRect(0, 0, 200, 80);
            ctx.strokeStyle = "#fff";
            if(fps > this.max_fps) {
		this.max_fps = fps;
            }
            if(fps < this.min_fps) {
		this.min_fps = fps;
            }
            var left = 10;
            var top = 10;
            ctx.strokeText("FPS: " + fps + " Max: " + this.max_fps + " Min: " + this.min_fps, left, top);
            top += 15;
            ctx.strokeText("Objects: " + this.length, left, top);
	}
	drawer = _.bind(drawer, this);
	drawer.zindex = 1000;
	return drawer;
    },

    mousepos : function(e) {
	if(e === undefined) {
	    return this._mousepos;
	}
        var c = $(this.canvas);
        var x = Math.floor((e.pageX - c.offset().left));
        var y = Math.floor((e.pageY - c.offset().top));
	var res = {
	    x : x / this.scale.x,
	    y : y / this.scale.y
	};
	this._mousepos = res;
	return res;
    },

    game_over_screen : function(ctx) {
	this.running = false;
	function drawer() {
            ctx.save();
	    ctx.globalAlpha = .65;
	    ctx.fillStyle = "#000";
	    ctx.fillRect(0, 0, this.frame.width, this.frame.height);
	    ctx.globalAlpha = 1.0;
            ctx.strokeStyle = "#fff";
            ctx.fillStyle = "#fff";
            ctx.font = "40pt optimer";
            var text = "GAME OVER";
            var tm = ctx.measureText(text);
            var left = this.frame.width / 2 - tm.width / 2;
            var top = this.frame.height / 2 + 40 / 2;
            ctx.fillText(text, left, top);
            ctx.restore();
	}
	drawer = _.bind(drawer, this);
	drawer.zindex = 100;
	return drawer;
    },

    start : function() {
        this.running = true;
	this.schedule();
    },

    schedule : function() {
	var wait = 1000.0 / this.fps;
        setTimeout(this.run, wait);
    },

    goto_stage : function(stage) {
	this.running = false;
	// I suck at javascript
	var args = [];
	if(arguments.length > 1) {
	    for(var i = 1; i < arguments.length; i++) {
		args.push(arguments[i]);
	    }
	}
	// add the default args of all
	// game stages
	args.push(this.canvas);
	args.push(this.fps);
	args.push(this.scale);
	window.game = construct(stage, args);
	window.game.start();
    }
};
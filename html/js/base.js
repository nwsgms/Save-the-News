

function GameBase() {
    
};

GameBase.prototype = {
    __init__ : function() {
	_.bindAll(this, "render_debug_info", "game_over_screen");
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
 
    game_over_screen : function(ctx) {
	this.running = false;
	function drawer() {
            ctx.save();
            ctx.strokeStyle = "#f00";
            ctx.fillStyle = "#f00";
            ctx.font = "40pt Arial";
            var text = "GAME OVER";
            var tm = ctx.measureText(text);
            var left = this.frame.width / 2 - tm.width / 2;
            var top = this.frame.height / 2 - 40 / 2;
            ctx.fillText(text, left, top);
            ctx.restore();
	}
	drawer = _.bind(drawer, this);
	drawer.zindex = 100;
	return drawer;
    }
    
};
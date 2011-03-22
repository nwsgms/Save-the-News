
function Button() {
    this.__init__.apply(this, arguments);
}

Button.prototype = {
  
    __init__ : function(text, opts) {
	_.bindAll(this, "render");
	this.text = text;
	this.opts = opts;
    },

    render : function(game, elapsed) {
	
    }


};

function StartScreen() {
    this.__init__.apply(this, arguments);
}

StartScreen.prototype = _.extend(
    { },
    GameBase.prototype,
    {
	BACKGROUND_COLOR : "#afa",
	__init__ : function(canvas, fps) {
	    GameBase.prototype.__init__.call(this, canvas, fps);
	    _.bindAll(this, "loop", "mousedown");
	},

	loop : function(elapsed) {
            var ctx = this.ctx;
            ctx.save();
            ctx.fillStyle = this.BACKGROUND_COLOR;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	    ctx.fillStyle = "#fff";
	    ctx.font = "40px Arial";
	    ctx.fillText("Click to start", 100, 100);
	    ctx.restore();	    
	},

	mousedown : function(e) {
	    this.running = false;
	    get_messages(
		_.bind(
		    function(messages) {
			window.game = new Game(messages, this.canvas, this.fps);
			window.debug = this.debug;
			window.game.start();
		    }, this));
	}
    }
);

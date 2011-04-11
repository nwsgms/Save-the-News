function Summary() {
    this.__init__.apply(this, arguments);
}


Summary.prototype = _.extend(
    {},
    GameBase.prototype,
    {
	PERCENT_LEFT : 30,
	PERCENT_TOP : 30,

	__init__ : function(score, canvas, fps, scale) {
            _.bindAll(this, "back", "mousdown", "mouseup");
            GameBase.prototype.__init__.call(this, canvas, fps, scale);
	    
	    this.score = score;
	    this.buttons = [];
	    this.buttons.push(new Button("btn_back", 100, 100));
	    this.buttons[this.buttons.length - 1].bind("click", this.back);
	    
	},
	
	loop : function(elapsed) {
            // clear background
            var ctx = this.ctx;
            var bg = rm.get("start_bg");
            ctx.drawImage(bg, 0, 0);
	    
	    ctx.font = "80px optimer";
	    ctx.fillStyle = "#fff";
            ctx.fillText(this.score + "%", this.PERCENT_LEFT, PERCENT_TOP + 80);
	    _.forEach(
		this.buttons,
		_.bind(
		    function(button) {
			button.render(this, elapsed);
		    },
		    this
		)
	    );
	},
	
	back : function() {
	    this.goto_stage(StartScreen);
	}
    },
    ButtonMixin
);

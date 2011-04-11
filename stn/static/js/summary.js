function Summary() {
    this.__init__.apply(this, arguments);
}


Summary.prototype = _.extend(
    {},
    GameBase.prototype,
    {
	PERCENT_SIZE: 180,
	PERCENT_LEFT : 20,
	PERCENT_TOP : 0,
	BTNS_TOP : 480 - 110,
	BTN_BACK_LEFT : 20,
	VSPACE : 5,

	__init__ : function(score, canvas, fps, scale) {
            _.bindAll(this, "back", "mousdown", "mouseup");
            GameBase.prototype.__init__.call(this, canvas, fps, scale);
	    
	    this.score = score;
	    this.buttons = [];
	    this.buttons.push(new Button(
				  "btn_back", 
				  this.BTNS_TOP,
				  this.BTN_BACK_LEFT
			      )
			     );
	    this.buttons[this.buttons.length - 1].bind("click", this.back);
	    
	},
	
	loop : function(elapsed) {
            // clear background
            var ctx = this.ctx;
            var bg = rm.get("start_bg");
            ctx.drawImage(bg, 0, 0);
	    
	    ctx.font = this.PERCENT_SIZE + "px optimer";
	    ctx.fillStyle = "#fff";
            ctx.fillText(this.score + "%", this.PERCENT_LEFT, 
			 this.PERCENT_TOP + this.PERCENT_SIZE);
	    var small_size = Math.ceil(this.PERCENT_SIZE / 3);
	    ctx.font = small_size + "px optimer";
            ctx.fillText("echte T*gesschau", this.PERCENT_LEFT + this.PERCENT_SIZE / 20, 
			 this.PERCENT_TOP + this.PERCENT_SIZE +
			 small_size + this.VSPACE
			);
	    
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

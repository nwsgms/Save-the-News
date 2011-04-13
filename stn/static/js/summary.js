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
	BTN_TWITTER_LEFT : 160,
	VSPACE : 5,

	DDORF_LEFT : 600,
	DDORF_TOP : 10,

	ZE_DDORFS : [
	    [10, "ddorf_surprised"],
	    [20, "ddorf_unsatisfied"],
	    [80, "ddorf_neutral"],
	    [95, "ddorf_happy"]
	],

	__init__ : function(score, canvas, fps, scale) {
            _.bindAll(this, "back", "mousdown", "mouseup", "element4score",
		      "tweet");
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

	    this.buttons.push(new Button(
				  "btn_twitter", 
				  this.BTNS_TOP,
				  this.BTN_TWITTER_LEFT
			      )
			     );
	    this.buttons[this.buttons.length - 1].bind("click", this.tweet);
	    
	},

	tweet : function() {
	    var tweet = "Hat %d%% bei #savethenews erreicht!"
	    window.location = "http://www.twitter.com/share?text=" + tweet;
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

	    var ddorf = this.element4score(this.ZE_DDORFS);
	    ddorf = rm.get(ddorf);
	    ctx.drawImage(ddorf, this.DDORF_LEFT, this.DDORF_TOP);
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
	},

	element4score : function(array) {
	    var res = array[0][1];
	    for(var i in array) {
		if(this.score >= array[i][0]) {
		    res = array[i][1];
		}
	    }
	    return res;
	}
    },
    ButtonMixin
);

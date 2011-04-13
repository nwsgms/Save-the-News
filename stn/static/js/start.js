


function StartScreen() {
    this.__init__.apply(this, arguments);
}

StartScreen.prototype = _.extend(
    { },
    GameBase.prototype,
    {
	BACKGROUND_COLOR : "#afa",

	__init__ : function(canvas, fps, scale) {
	    GameBase.prototype.__init__.call(this, canvas, fps, scale);
	    _.bindAll(this, "loop", "mousedown", "start_game", "mouseup", "mousedown");
	    this.buttons = [];
	    var start_button = new Button("btn_start", 65, 380);
	    start_button.bind("click", this.start_game);
	    this.buttons.push(start_button);
	    this.animations = [new Animation("kasten1", .5, 22, 250),
			       new Animation("kasten2", .5, 224 + 115, 250),
			       //new Animation("kasten2", .5, 224, 250),
			       //new Animation("kasten3", .5, 517, 250),
			       new Animation("kasten4", .5, 742, 250)
			      ];
	},

	loop : function(elapsed) {
            var ctx = this.ctx;
            ctx.save();
	    var bg = rm.get("start_bg");
	    ctx.drawImage(bg, 0, 0);
	    _.forEach(this.buttons,
		      _.bind(
			  function(button) {
			      button.render(this, elapsed);
			  },
		      this)
	    );
	    _.forEach(this.animations,
		      _.bind(
			  function(animation) {
			      animation.render(this, elapsed);
			  },
		      this)
	    );
	    ctx.restore();	    
	},

	start_game : function(e) {
	    this.running = false;
	    get_messages(
		_.bind(
		    function(messages) {
			window.game = new Game(messages, this.canvas, this.fps, this.scale);
			window.debug = this.debug;
			window.game.start();
		    }, this));
	}
    },
    ButtonMixin
);


function Button() {
    this.__init__.apply(this, arguments);
}

Button.prototype = _.extend({
  
    __init__ : function(resource_name, top, left) {
	_.bindAll(this, "render", "mouseup", "mousedown");
	this.resource_name = resource_name;
	this.top = top;
	this.left = left;
	this.pressed = false;
	var img = rm.get(resource_name);
	this.frame = new Rect(left, top, img.width, img.height);
    },

    render : function(game, elapsed) {
	var rn = this.resource_name;
	if(this.pressed == true) {
	    rn += "_active";
	}
	var img = rm.get(rn);
	game.ctx.drawImage(img, this.left, this.top);
    },

    mousedown : function(p) {
	this.pressed = this.frame.contains(p);
    },

    mouseup : function(p) {
	this.pressed = false;
	if(this.frame.contains(p)) {
	    this.trigger("click");
	}
    }

}, Backbone.Events);



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
	    _.bindAll(this, "loop", "mousedown", "start_game", "mouseup", "mousedown");
	    this.buttons = [];
	    var start_button = new Button("btn_start", 65, 380);
	    start_button.bind("click", this.start_game);
	    this.buttons.push(start_button);
	    this.animations = [new Animation("kasten1", .5, 22, 250),
			       new Animation("kasten2", .5, 224, 250),
			       new Animation("kasten3", .5, 517, 250),
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

	mousedown : function(e) {
	    var mp = this.mousepos(e);
	    _.forEach(this.buttons,
		     _.bind(
		     function(button) {
			 button.mousedown(mp);
		     }, this));
	},


	mouseup : function(e) {
	    var mp = this.mousepos(e);
	    _.forEach(this.buttons,
		     _.bind(
		     function(button) {
			 button.mouseup(mp);
		     }, this));
	},


	start_game : function(e) {
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


var NewsItem = Backbone.Model.extend(
    {
	initialize : function() {
	    _.bindAll(this, "render", "draw", "collides");
	    this.set(
		{
		    state : "new"
		}
	    );
	    this.color = "#99f";
	    this.clicked = false;
	},

	render : function(game, elapsed) {
	    switch(this.get("state")) {
	    case "new":
		this.width = 50 + Math.floor(Math.random() * 100);
		this.height = 30 + Math.floor(Math.random() * 30);
		this.left = game.canvas.width / 2 - this.width / 2;
		this.top = 0;
		this.velocity = 0.0;
		this.frame = new Rect(this.left, this.top, this.width, this.height);
		this.set({ state : "normal"});
		break;
	    case "normal":
		this.velocity += game.GRAVITY * elapsed;
		this.top = Math.floor(this.top + this.velocity);
		this.frame.move(this.left, this.top);
		var collision_line = this.collides(game);
		if(collision_line !== null) {
		    this.top = collision_line;
		    this.frame.move(this.left, this.top);
		    this.set({ state : "resting"});
		}
		this.draw(game);
		break;
	    case "resting":
		this.draw(game);
	    }
	},

	collides : function(game) {
	    var self = this;
	    var collision_result = null;
	    game.forEach(function(item)
			 {
			     if(item.get("state") != "resting")
				 return;
			     if(collision_result !== null)
				 return;
			     if(item == self)
				 return;
			     var a = self.frame;
			     var b = item.frame;
			     if(a.top > b.top) {
				 var h = a;
				 a = b;
				 b = h;
			     }
			     if(a.bottom >= b.top) {
				 collision_result = b.top - a.height;
			     }
			 });
	    if(collision_result !== null)
		return collision_result;
	    if(this.frame.inside(game.frame))
		return null;
	    return game.frame.bottom - this.frame.height;
	},

	draw : function(game) {
	    var ctx = game.ctx;
	    ctx.save();
	    if(!this.clicked)
		ctx.fillStyle = this.color;
	    else
		ctx.fillStyle = "#f00";
	    ctx.fillRect(this.left, this.top, this.width, this.height);
	    ctx.restore();
	}
    }
);


var GameItems = Backbone.Collection.extend(
    {
	model : NewsItem	
    }
);

function Game() {
    this.__init__.apply(this, arguments);
}

Game.prototype = {
    GRAVITY : 10.0,
    BACKGROUND_COLOR : "#ffa",

    __init__ : function(canvas, fps) {
	_.bindAll(this, "run", "start", "render_debug_info", "add",
		 "click");
	this.game_items = new GameItems();
	this.fps = fps;
	this.running = false;
	this.debug = false;
	this.canvas = canvas;
	this.max_fps = 0;
	this.min_fps = 1000;
	this.ctx = this.canvas.getContext("2d");
	this.frame = new Rect(0, 0, canvas.width, canvas.height);
	$(canvas).click(this.click);
    },

    click : function(e) {
	var c = $(this.canvas);
	var x = Math.floor((e.pageX - c.offset().left));
	var y = Math.floor((e.pageY - c.offset().top));
	console.log({x : x, y : y});
	this.forEach(function(item)
		     {
			 if(item.frame.contains(x, y)) {
			     item.clicked = true;
			     console.log(item.frame);
			 } else {
			     item.clicked = false;
			 }
		     }
		    );
    },

    start : function() {
	this.running = true;
	this.now = new Date().getTime();
	setTimeout(this.run, 1000.0 / this.fps);
    },

    run : function() {
	if(!this.running)
	    return;
	var t = new Date().getTime();
	var elapsed = (t - this.now) / 1000.0;
	if (elapsed == 0) {
	    return;
	}
	this.now = t;
	// reschedule
	this.start();
	var ctx = this.ctx;
	ctx.save();
	ctx.fillStyle = this.BACKGROUND_COLOR;
	ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

	this.game_items.forEach(_.bind(
				    function(item) 
				    { 
					item.render(this, elapsed);
				    }, this));
	if(this.debug) {
	    this.render_debug_info(ctx, elapsed);
	}
	ctx.restore();
    },

    forEach : function(iterator) {
	this.game_items.forEach(iterator);
    },

    render_debug_info : function(ctx, elapsed) {
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
	ctx.strokeText("Objects: " + this.game_items.length, left, top);
    },

    add : function(game_item) {
	this.game_items.add(game_item);
    }
    
};

$(function() {
      var canvas = $("#arena").get(0);
      document.game = new Game(canvas, 30.0);
      document.game.debug = true;
      function spawn() {
	  var ni = new NewsItem();
	  document.game.add(ni);
      }
      setInterval(spawn, 3000);
      document.game.start();
});
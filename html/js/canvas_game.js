
var NewsItem = Backbone.Model.extend(
    {
        initialize : function() {
            _.bindAll(this, "render", "draw", "collides",
                      "placable", "statechanged", "floating");
            var game = this.get("game");
            var width = 50 + Math.floor(Math.random() * 100);
            var height = 30 + Math.floor(Math.random() * 30);
            var left = game.canvas.width / 2 - width / 2;
            var top = 0;
            this.drag_offset = null;
            this.velocity = 0.0;
            this.frame = new Rect(left, top, width, height);
            this.color = "#99f";
            this.clicked = false;
            this.set({ state : "falling"});
            this.bind("change:state", this.statechanged);
        },

	floating : function() {
	    this.set({"state" : "floating"});
	},

        statechanged : function() {
            var game = this.get("game");
            switch(this.get("state")) {
            case "floating":
                // we fly back to bottom position
                var left = game.canvas.width / 2 - this.frame.width / 2;
                var top = game.canvas.height - this.frame.height;
		// if we have other floaters, determine the highest 
		// destination position of one of them, and that's
		// ours then 
		if(game.floaters.length) {
		    game.floaters.forEach(
			function(floater) {
			    top = Math.min(floater.float.top - this.frame.height, top); 
			}
		    );
		}
                var dx = (left - this.frame.left) / game.FLOAT_TIME;
                var dy = (top - this.frame.top) / game.FLOAT_TIME;
		var do_ = -this.frame.height / game.FLOAT_TIME;
                this.float = {
                    left : left,
                    top : top,
                    dx : dx,
                    dy : dy,
		    offset : 0.0,
		    do_ : do_,
		    time : game.FLOAT_TIME
                };
		// finally, add ourselves to the floaters
		this.get("game").floaters.add(this);
                break;
            }
        },

        placable : function() {
	    var game = this.get("game");
	    if(game.length > 0) {
		var gap = game.at(0).frame.top;
		return gap >= this.frame.height;
	    }
	    return true;
        },

        render : function(game, elapsed) {
            switch(this.get("state")) {
            case "falling":
                this.velocity += game.GRAVITY * elapsed;
                this.frame.translate(0, Math.floor(this.velocity));
                var collision_line = this.collides(game);
                if(collision_line !== null) {
                    this.frame.move(this.frame.left, collision_line);
		    this.velocity = .0;
                }
                break;
            case "dragging":
                this.frame.move(game.mousepos);
                this.frame.translate(this.drag_offset);
                break;
            case "floating":
                this.frame.translate(this.float.dx * elapsed, 
                                     this.float.dy * elapsed);
		this.float.offset += elapsed * this.float.do_;
		this.float.time -= elapsed;
		if(this.float.time <= .0) {
                    this.frame.move(this.float.left, this.float.top);
		    game.floaters.remove(this);
                    this.set({"state" : "falling"});
                }
            }
            this.draw(game);
        },

        collides : function(game) {
            // if we are the only one
            // in there, the collision happens with the bottom
	    // potentially this means floating up!
            var candidate_frame = null;
            candidate_frame = game.bottom_collision_frame();
            // the item-collection guarantees that all the 
            // items are in descending order. So once we are beyond 
            // ourselves, the next falling item has the frame in question
            var me = this;
            var found = false;
            var items_below_me = game.filter(
		function(other)
                {
                    if(other == me) {
                        found = true;
                        return false;
                    }
		    return found && other.get("state") == "falling";
                }
            );
            if(items_below_me.length) {
                candidate_frame = items_below_me[0].frame;
            }
            if(this.frame.overlaps(candidate_frame)) {
                return candidate_frame.top - this.frame.height;
            }
            return null;
        },

        draw : function(game) {
            var ctx = game.ctx;
            ctx.save();
            if(!this.clicked)
                ctx.fillStyle = this.color;
            else
                ctx.fillStyle = "#f00";
            ctx.fillRect(this.frame.left, 
                         this.frame.top, 
                         this.frame.width, 
                         this.frame.height);
            ctx.restore();
        }
    }
);


var GameItems = Backbone.Collection.extend(
    {
        model : NewsItem,
        comparator : function(gi) {
            return gi.frame.top;
        }
    }
);

function Game() {
    this.__init__.apply(this, arguments);
}

Game.prototype = {
    GRAVITY : 2.0,
    BACKGROUND_COLOR : "#ffa",
    FLOAT_TIME : .8,
    SPAWN_TIME : 2000,

    __init__ : function(canvas, fps) {
        _.bindAll(this, "run", "start", "render_debug_info", "add",
                 "mousedown", "mousemove", "mouseup", "pre_rendering", "over",
                 "bottom_collision_frame", "filter", "at", "spawn");
        this.game_items = new GameItems();
	this.floaters = new GameItems();
	this.length = 0;
        this.fps = fps;
        this.running = false;
        this.debug = false;
        this.canvas = canvas;
        this.max_fps = 0;
        this.min_fps = 1000;
        this.mousepos = null;
        this.ctx = this.canvas.getContext("2d");
        this.frame = new Rect(0, 0, canvas.width, canvas.height);
        $(canvas).mousedown(this.mousedown).mousemove(this.mousemove).mouseup(this.mouseup);
        this.state = "running";
	this.spawn();
    },

   spawn : function() {
       var ni = new NewsItem({ game : this });
       if(!ni.placable()) {
           this.over();
       } else {
	   this.add(ni);
	   setTimeout(this.spawn, this.SPAWN_TIME);
       }
   },
   
    at : function(index) {
	return this.game_items.at(index);
    },

    bottom_collision_frame : function() {
	var cl = this.frame.bottom + 1;
	this.floaters.forEach(
	    function(floater) {
		cl += floater.float.offset;		
	    }
	);
        return new Rect(this.frame.width / 2, cl, 1, 1);
    },

    over : function() {
        this.state = "over";
        this.game_items.forEach(function(item) 
                                { 
                                    item.set({"state" : "frozen"});
                                });
    },

    mousedown : function(e) {
        if(this.state == "over")
            return;
        var c = $(this.canvas);
        var x = Math.floor((e.pageX - c.offset().left));
        var y = Math.floor((e.pageY - c.offset().top));
        this.mousepos = {
            x : x,
            y : y
        };
        this.forEach(
            _.bind(
                function(item) {
                    if(item.frame.contains(x, y)) {
                        item.drag_offset = {
                            x : item.frame.x - x,
                            y : item.frame.y - y
                            
                        };
                        if(item.get("state") == "resting") {
                            var unrest = true;
                            this.forEach(function(resting_item) {
                                             if(item == resting_item) {
                                                 unrest = false;
                                                 return;
                                             }
                                             if(unrest) {
                                                 if(resting_item.get("state") == "resting") {
                                                     resting_item.set({"state" : "falling"});
                                                     
                                                 }
                                             }
                                         }
                                        );
                        }
                        item.set({"state" : "dragging"});
                        console.log(item.frame);
                    } else {
                        item.clicked = false;
                    }
                    
            }, this)
        );
    },

    mousemove : function(e) {
        if(this.state == "over")
            return;
        var c = $(this.canvas);
        var x = Math.floor((e.pageX - c.offset().left));
        var y = Math.floor((e.pageY - c.offset().top));
        
        //var dx = x - this.mousepos.x;
        //var dy = y - this.mousepos.y;
        this.mousepos = {
            x : x,
            y : y
        };
    },

    mouseup : function(e) {
        if(this.state == "over")
            return;
        this.forEach(function(item)
                     {
                         if(item.get("state") == "dragging") {
                             item.floating();
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

        this.pre_rendering();
        this.game_items.forEach(_.bind(
                                    function(item) 
                                    { 
                                        item.render(this, elapsed);
                                    }, this));

        switch(this.state) {
        case "over":
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
	    this.running = false;
            break;
        }

        if(this.debug) {
            this.render_debug_info(ctx, elapsed);
        }
        ctx.restore();
    },

    pre_rendering : function() {
        this.game_items.sort();
        var resting_items = this.topmost_line = this.game_items.filter(
                function(gi) {
                    return gi.get("state") == "resting" ||
                        gi.get("state") == "falling_to_rest";
                }
            );
        if(resting_items.length == 0) {
            this.topmost_line = this.frame.bottom;
        } else {
            this.topmost_line = resting_items[0].frame.top;
        }
    },

    forEach : function(iterator) {
        return this.game_items.forEach(iterator);
    },

    filter : function(predicate) {
       return this.game_items.filter(predicate);
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
	this.length += 1;
    }
    
};

$(function() {
      var canvas = $("#arena").get(0);
      document.game = new Game(canvas, 30.0);
      document.game.debug = true;
      document.game.start();
});
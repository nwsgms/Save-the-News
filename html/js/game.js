

function DropZone() {
    this.__init__.apply(this, arguments);
}

DropZone.prototype = {
    __init__ : function(game, style, left, top, width, height) {
        _.bindAll(this, "render", "hit");
        this.frame = new Rect(left, top, width, height);
        this.style = style;
        this.count = 0;
        this.game = game;
    },

    render : function(game, elapsed) {
	function drawer() {
            var ctx = game.ctx;
            ctx.save();
            ctx.fillStyle = this.style;
            ctx.fillRect(this.frame.left, 
			 this.frame.top, 
			 this.frame.width, 
			 this.frame.height);
            ctx.fillStyle = "#000";
            ctx.font = "40pt Arial";
            var text = "" + this.count;
            var tm = ctx.measureText(text);
            var left = this.frame.left + this.frame.width / 2 - tm.width / 2;
            var top = this.frame.top + this.frame.height / 2 - 40 / 2;
            ctx.fillText(text, left, top);
            ctx.restore();
	};
	drawer = _.bind(drawer, this);
	drawer.zindex = 10;
	return drawer;
    }, 

    hit : function(news_item) {
        if(this.frame.overlaps(news_item.frame)) {
            this.count += 1;
            news_item.set({"state" : "consumed"});
            return true;
        }
        return false;
    }
};

function Schedule() {
    this.__init__.apply(this, arguments);
}

Schedule.prototype = _.extend(
    {},
    DropZone.prototype,
    {
        __init__ : function(capacity, game, style, left, top, width, height) {
            DropZone.prototype.__init__.call(this, 
                                              game, 
                                              style,
                                              left,
                                              top,
                                              width,
                                              height);
            this.capacity = capacity;
	    this.items = [];
        },

        hit : function(news_item) {
            if(DropZone.prototype.hit.call(this, news_item)) {
		this.items.push(news_item);
                if(this.count >= this.capacity) {
                    this.game.sorting_stage(this.items);
                }
            }
        }
    }
);

function Game() {
    this.__init__.apply(this, arguments);
}

Game.prototype = _.extend(
    {},
    GameBase.prototype,
    {
	GRAVITY : 4.0,
	BACKGROUND_COLOR : "#ffa",
	FLOAT_TIME : .8,
	SPAWN_TIME : 2000,

	__init__ : function(canvas, messages, fps) {
	    GameBase.prototype.__init__.call(this);
            _.bindAll(this, "run", "start", "render_debug_info", "add",
                      "mousedown", "mousemove", "mouseup", "pre_rendering", "over",
                      "bottom_collision_frame", "filter", "at", "spawn", "remove",
                      "hit_dropzone", "sorting_stage");
            this.messages = render_messages(messages, 240);
            this.game_items = new GameItems();
            this.floaters = new GameItems();
            var plan = new Schedule(3, this, "#0f0", 0, 0, canvas.width / 4, canvas.height);
            var bin = new DropZone(this, "#f00", canvas.width - canvas.width / 4, 0, canvas.width / 4, canvas.height);
            this.dropzones = [plan, bin];
	    this.td = new TimerDisplay(60.0, 19, 59, 0);
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
	
	sorting_stage : function(messages) {
	    console.log("sorting_stage");
	    this.running = false;
	    window.game = new SortingGame(this.canvas, this.fps, this.td);
	    _.forEach(
		messages,
		function(message) {
		    var image = message.get("image");
		    var ni = new StageItem({ game : window.game ,
					     image : image });

		    window.game.add(ni);
		}
	    );
	    window.game.debug = this.debug;
	    window.game.start();
	},
	
	hit_dropzone : function(news_item) {
            _.forEach(this.dropzones, 
                      function(dz) {
			  dz.hit(news_item);
                      }
                     );
	},

	spawn : function() {
	    if(_.isEqual(this.messages, {})) {
		return;
	    }
	    var img = null;
	    for(var key in this.messages) {
		img = this.messages[key];
		delete this.messages[key];
		break;
	    }
	    var ni = new NewsItem({ game : this ,
				    image : img });
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
            this.game_items.forEach(
		function(item) 
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

            this.pre_rendering();


	    // clear background
            var ctx = this.ctx;
            ctx.save();
            ctx.fillStyle = this.BACKGROUND_COLOR;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);


	    var drawers = [];
	    drawers.push(this.td.render(this, elapsed));

            _.forEach(this.dropzones, 
                      _.bind(
			  function(dz) {
                              drawers.push(dz.render(this, elapsed));
			  }, this)
                     );

            this.game_items.forEach(
		_.bind(
                    function(item) 
                    { 
			drawers.push(item.render(this, elapsed));
                    }, this));

            switch(this.state) {
            case "over":
		drawers.push(this.game_over_screen(ctx));
		break;
            }

            if(this.debug) {
		drawers.push(this.render_debug_info(ctx, elapsed));
            }
	    drawers = _.sortBy(drawers, 
			       function(d) {
				   return d.zindex;
			       });
	    _.forEach(drawers, function(d) {d()});
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

	add : function(game_item) {
            this.game_items.add(game_item);
            this.length += 1;
	},

	remove :  function(news_item) {
            this.game_items.remove(news_item);
            this.length -= 1;
	}

    });

MESSAGES = [
    "EU for|dert „un|ver|züg|li|chen Rück|tritt“ Gad|dafis",
    "Erste Test|be|richte zum iPad 2 lo|ben die ho|he Ge|schwin|dig|keit",
    "Posch muss drau|ßen blei|ben",
    "NRW-Am|bi|tio|nen: Rött|gen gibt sich trotz E10-De|sas|ter selbst|be|wusst"
];


$(function() {
      var canvas = $("#arena").get(0);
      window.game = new Game(canvas, MESSAGES, 30.0);
      window.game.debug = true;
      window.game.start();
  });
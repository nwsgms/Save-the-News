

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
            ctx.font = "40pt optimer";
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

	__init__ : function(messages, canvas, fps, scale) {
	    GameBase.prototype.__init__.call(this, canvas, fps, scale);
            _.bindAll(this, "render_debug_info", "add",
                      "mousedown", "mousemove", "mouseup", "pre_rendering", "over",
                      "bottom_collision_frame", "filter", "at", "spawn", "remove",
                      "hit_dropzone", "sorting_stage", "loop");
	    this.messages = messages;
	    // add the image
            render_messages(messages, 240);
            this.game_items = new GameItems();
            this.floaters = new GameItems();
            var plan = new Schedule(3, this, "rgba(0, 255, 0, .5)", 0, 0, canvas.width / 4, canvas.height);
            var bin = new DropZone(this, "rgba(255, 0, 0, .5)", canvas.width - canvas.width / 4, 0, canvas.width / 4, canvas.height);
            this.dropzones = [plan, bin];
	    this.td = new TimerDisplay(60.0);
            this.length = 0;
            this.debug = false;
            this.canvas = canvas;
            this.frame = new Rect(0, 0, canvas.width, canvas.height);
            this.state = "running";
	},

	start : function() {
	    GameBase.prototype.start.call(this);
	    this.spawn();
	},
	
	sorting_stage : function(messages) {
	    this.running = false;
	    window.game = new SortingGame(this.td, this.canvas, this.fps, this.scale);
	    _.forEach(
		messages,
		function(message) {
		    var message = message.get("message");
		    var ni = new StageItem({ game : window.game ,
					     message : message });

		    window.game.add(ni);
		}
	    );
	    window.game.debug = this.debug;
	    window.game.start();
	},
	
	hit_dropzone : function(news_item) {
	    // Checks if a news-item is currently
	    // over one of the dropzones.
	    // Is called by the NewsItem when the
	    // state is changed to floating
	    var hit = false;
            _.forEach(this.dropzones, 
                      function(dz) {
			  hit |= dz.hit(news_item);
                      }
                     );
	    return hit;
	},

	spawn : function() {
	    console.log("spawn");
	    if(!this.running) {
		return;
	    }
	    if(_.isEqual(this.messages, [])) {
		return;
	    }
	    var img = null;
	    for(var key in this.messages) {
		message = this.messages[key];
		delete this.messages[key];
		break;
	    }
	    var ni = new NewsItem({ game : this ,
				    message : message });
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
	    this.running = false;
	    this.game_over_screen(this.ctx)();
	    setTimeout(
		_.bind(
		    function() {
			window.game = new StartScreen(this.canvas, this.fps);
			window.game.debug = this.debug;
			window.game.start();
		    },
		    this),
		5000
	    );
	},

	mousedown : function(e) {
            if(this.state == "over")
		return;
	    // record the current mousposition
	    var mp = this.mousepos(e);
	    var x = mp.x;
	    var y = mp.y;
	    console.log(mp);
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
				this.forEach(
				    function(resting_item) {
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
            if(!this.state == "over")
		return;
	    // record the current mousposition
	    this.mousepos(e);
	},

	mouseup : function(e) {
            if(this.state == "over")
		return;
	    // record the current mousposition
	    this.mousepos(e);
            this.forEach(
		function(item)
		{
                    if(item.get("state") == "dragging") {
			item.floating();
                    }
		}
	    );
	},


	loop : function(elapsed) {
            this.pre_rendering();
	    // clear background
            var ctx = this.ctx;
            ctx.save();
	    var bg = rm.get("start_bg");
	    ctx.drawImage(bg, 0, 0);

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

var StageItem = Backbone.Model.extend(
    {
        initialize : function() {
            _.bindAll(this, "render", "draw", "overlap",
                      "placable", "statechanged", "floating",
		      "apply_force", "calc_force");
            var game = this.get("game");
            var image = this.get("image");
            var width = image.width;
            var height = image.height;
            var left = game.canvas.width / 2 - width / 2;
            var top = 30;
            this.drag_offset = null;
            this.frame = new Rect(left, top, width, height);
            this.clicked = false;
            this.set({ state : "normal"});
            this.bind("change:state", this.statechanged);
	    this.force = .0;
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
            case "consumed":
                this.get("game").remove(this);
            }
        },

        render : function(game, elapsed) {
            switch(this.get("state")) {
            case "normal":
		this.frame.translate(0, this.force * elapsed);
                break;
            case "dragging":
                this.frame.move(this.frame.left, game.mousepos.y);
                this.frame.translate(0, this.drag_offset.y);
		if(this.frame.top < game.frame.top) {
		    this.frame.move(this.frame.left, game.frame.top);
		}
		if(this.frame.bottom > game.frame.bottom) {
		    this.frame.translate(0, this.frame.bottom - game.frame.bottom);
		}
                break;
            }
            return this.draw(game);
        },

        draw : function(game) {
	    function drawer() {		
		var ctx = game.ctx;
		var image = this.get("image");
		ctx.save();
		var top = this.frame.top;
		if(top <= 0) {
		    top = 0
		} else if(top + this.frame.height > game.frame.bottom) {
		    top = game.frame.bottom - this.frame.height;
		}
		ctx.putImageData(image, this.frame.left, top);		
		ctx.restore();
	    };
	    drawer = _.bind(drawer, this);
	    drawer.zindex = 0;
	    if(this.get("state") == "dragging") {
		drawer.zindex = 1;
	    }
	    return drawer;
        }
    }
);



var StageItems = Backbone.Collection.extend(
    {
        model : StageItem,
        comparator : function(gi) {
            return gi.frame.center_y;
        }
    }
);


function SortingGame() {
    this.__init__.apply(this, arguments);
}

SortingGame.prototype = _.extend(
    {},
    GameBase.prototype,
    {
	GRAVITY : 4.0,
	BACKGROUND_COLOR : "#faa",
	FLOAT_TIME : .8,
	
    __init__ : function(canvas, fps, td) {
	GameBase.prototype.__init__.call(this, canvas, fps);
        _.bindAll(this, "loop", "start", "render_debug_info", "add",
                 "mousedown", "mousemove", "mouseup", "over",
                 "bottom_collision_frame", "filter", "at", "spawn", "remove",
                 "hit_dropzone", "place_items");
        this.stage_items = new StageItems();
	this.length = this.stage_items.length;
	this.td = td;
        this.fps = fps;
        this.running = false;
        this.canvas = canvas;
        this.mousepos = null;
        this.ctx = this.canvas.getContext("2d");
        this.frame = new Rect(0, 0, canvas.width, canvas.height);
        $(canvas).mousedown(this.mousedown).mousemove(this.mousemove).mouseup(this.mouseup);
        this.state = "running";
    },


    place_items : function() {
	this.stage_items.sort();
	var top = this.upper_bound;
	this.forEach(
	    function(item) {
		if(item.get("state") == "normal") {
		    item.frame.move(item.frame.left, top);		       
		}
		top += item.frame.height;
	    }
	);
    },

    add : function(game_item) {
        this.stage_items.add(game_item);
        this.length += 1;
    },

    at : function(index) {
        return this.stage_items[index];
    },

    over : function() {
	this.running = false;
        this.state = "over";
	window.game = new StartScreen(this.canvas, this.fps);
	window.game.debug = this.debug;
	window.game.start(0);
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
                        item.set({"state" : "dragging"});
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
        this.forEach(
	    function(item) {
                if(item.get("state") == "dragging") {
                    item.set({state : "normal"});
                }
            }
        );
    },


    start : function() {
	this.stage_items.sort();
	// compute the total height of all
	// items for the sorting
	var height = 0;
	this.forEach(
	    function(item) {
		height += item.frame.height;
	    }
	);
	this.upper_bound = this.frame.top + (this.frame.height - height) / 2;
	this.lower_bound = this.frame.bottom - this.upper_bound;
	GameBase.prototype.start.call(this);
    },

    loop : function(elapsed) {

	// clear background
        var ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = this.BACKGROUND_COLOR;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	var drawers = [];
	drawers.push(this.td.render(this, elapsed));
	this.place_items();
        this.stage_items.forEach(
	    _.bind(
                function(item) { 
                    drawers.push(item.render(this, elapsed));
                }, this));

        switch(this.state) {
        case "over":
	    function go() {		
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
	    }
	    go = _.bind(go, this);
	    go.zindex = 100;
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

    at : function(index) {
        return this.stage_items.at(index);
    },

    forEach : function(iterator) {
        return this.stage_items.forEach(iterator);
    }

});



MESSAGES = [
    "EU for|dert „un|ver|züg|li|chen Rück|tritt“ Gad|dafis",
    "Erste Test|be|richte zum iPad 2 lo|ben die ho|he Ge|schwin|dig|keit",

    "Posch muss drau|ßen blei|ben"];
//     "NRW-Am|bi|tio|nen: Rött|gen gibt sich trotz E10-De|sas|ter selbst|be|wusst"
// ];



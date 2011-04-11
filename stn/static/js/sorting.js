
var StageItem = Backbone.Model.extend(
    {
        initialize : function() {
            _.bindAll(this, "render", "draw", "overlap",
                      "placable", "statechanged", "floating",
                      "apply_force", "calc_force");
            var game = this.get("game");
            var image = this.get("message").image;
            var width = image.width;
            var height = image.height;
            var left = game.frame.width / 2 - width / 2;
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
                var left = game.frame.width / 2 - this.frame.width / 2;
                var top = game.frame.height - this.frame.height;
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
                this.frame.move(this.frame.left, game.mousepos().y);
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
                var image = this.get("message").image;
                ctx.save();
                var top = this.frame.top;
                if(top <= 0) {
                    top = 0;
                } else if(top + this.frame.height > game.frame.bottom) {
                    top = game.frame.bottom - this.frame.height;
                }
                ctx.drawImage(image, this.frame.left, top);             
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
        FLOAT_TIME : .8,
        
    __init__ : function(td, canvas, fps, scale) {
        _.bindAll(this, "loop", "start", "render_debug_info", "add",
                 "mousedown", "mousemove", "mouseup", "over",
                 "bottom_collision_frame", "filter", "at", "spawn", "remove",
                 "hit_dropzone", "place_items");


        GameBase.prototype.__init__.call(this, canvas, fps, scale);
        var width = canvas.width / this.scale.x;
        var height = canvas.height / this.scale.y;
        this.stage_items = new StageItems();
        this.length = this.stage_items.length;
        this.td = td;
        this.frame = new Rect(0, 0, width, height);
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
	this.running = false; // this is needed because otherwise multiple
	// post-requests are done.
	this.stage_items.sort();
	var params = {
	    news : this.stage_items.map(
		function(item) {
		    return item.get("message").id;
		}
	    )
	};
	$.post(
	    "/score",
	    params,
	    _.bind(
		function(data) {
		    console.log(data);
		    this.goto_stage(Summary, data.score);
		},
		this)
	);
    },

    mousedown : function(e) {
        if(this.state == "over")
            return;
        var mp = this.mousepos(e);
        this.forEach(
            _.bind(
                function(item) {
                    if(item.frame.contains(mp.x, mp.y)) {
                        item.drag_offset = {
                            x : item.frame.x - mp.x,
                            y : item.frame.y - mp.y
                            
                        };
                        item.set({"state" : "dragging"});
                    } 
            }, this)
        );
    },

    mousemove : function(e) {
        if(this.state == "over")
            return;
        // record the mousepos
        this.mousepos(e);
    },

    mouseup : function(e) {
        if(this.state == "over")
            return;
        // record the mousepos
        this.mousepos(e);
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
        var bg = rm.get("start_bg");
        ctx.drawImage(bg, 0, 0);
        var drawers = [];
        drawers.push(this.td.render(this, elapsed));
        this.place_items();
        this.stage_items.forEach(
            _.bind(
                function(item) { 
                    drawers.push(item.render(this, elapsed));
                }, this));

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




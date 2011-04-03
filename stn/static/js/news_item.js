
var NewsItem = Backbone.Model.extend(
    {
        initialize : function() {
            _.bindAll(this, "render", "draw", "collides",
                      "placable", "statechanged", "floating");
            var game = this.get("game");
            var message = this.get("message");
            var image = message.image;
            var width = image.width;
            var height = image.height;
            var left = game.frame.width / 2 - width / 2;
            var top = 0;
            this.drag_offset = null;
            this.velocity = 0.0;
            this.frame = new Rect(left, top, width, height);
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
                // first, check if we are hitting a dropzone. If yes,
                // we are consumed
                if(game.hit_dropzone(this)) {
                    return;
                }
                // we fly back to bottom position
                var left = game.frame.width / 2 - this.frame.width / 2;
                var top = game.frame.height - this.frame.height;
                // if we have other floaters, determine the highest 
                // destination position of one of them, and that's
                // ours then 
                if(game.floaters.length) {
                    game.floaters.forEach(
                        _.bind(
                            function(floater) {
                                top = Math.min(floater.float.top - this.frame.height, top); 
                            },
                            this)
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

        placable : function() {
            var game = this.get("game");
            var top = game.frame.bottom;
            game.forEach(
                function(item) {
                    var s = item.get("state");
                    if(s != "floating" &&
                       s != "dragging") {
                        top = Math.min(item.frame.top, top);
                    }
                }
            );
            log("placable: " + top);
            return top >= this.frame.height;
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
                this.frame.move(game.mousepos());
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
            return this.draw(game);
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
            function drawer() {
                var ctx = game.ctx;
                var image = this.get("message").image;
                ctx.save();
                ctx.drawImage(image, this.frame.left, this.frame.top);
                ctx.restore();
            }
            drawer = _.bind(drawer, this);
            drawer.zindex = this.get("state") == "dragging" ? 200 : 0;
            return drawer;
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

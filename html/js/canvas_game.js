
var NewsItem = Backbone.Model.extend(
    {
        initialize : function() {
            _.bindAll(this, "render", "draw", "collides",
                      "placable", "statechanged");
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

        statechanged : function() {
            var game = this.get("game");
            switch(this.get("state")) {
            case "resting":
                this.velocity = .0;
                break;
            case "floating":
                // we fly back to bottom position
                var left = game.canvas.width / 2 - this.frame.width / 2;
                var top = game.canvas.height - this.frame.height;
                var dx = (left - this.frame.left) / game.FLOAT_TIME;
                var dy = (top - this.frame.top) / game.FLOAT_TIME;
                this.float = {
                    left : left,
                    top : top,
                    dx : dx,
                    dy : dy
                };
                break;
            }

        },

        placable : function() {
            var gap = this.get("game").topmost_line;
            return gap >= this.frame.height;
        },

        render : function(game, elapsed) {
            switch(this.get("state")) {
            case "falling":
                this.velocity += game.GRAVITY * elapsed;
                this.frame.translate(0, Math.floor(this.velocity));
                var collision_line = this.collides(game);
                if(collision_line !== null) {
                    this.frame.move(this.frame.left, collision_line);
                    this.set({ state : "resting"});
                }
                break;
            case "dragging":
                this.frame.move(game.mousepos);
                this.frame.translate(this.drag_offset);
                break;
            case "floating":
                this.frame.translate(this.float.dx * elapsed, 
                                     this.float.dy * elapsed);
                function close_enough(a, b) {
                    return Math.abs(a - b) < 2.0;
                }
                if(close_enough(this.frame.left, this.float.left) && 
                   close_enough(this.frame.top, this.float.top)) {
                    this.frame.move(this.float.left, this.float.top);
                    this.set({"state" : "resting"});
                }
            }
            this.draw(game);
        },

        collides : function(game) {
            if(this.frame.bottom >= game.topmost_line) {
                return game.topmost_line - this.frame.height;
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
    GRAVITY : 10.0,
    BACKGROUND_COLOR : "#ffa",
    FLOAT_TIME : .8,

    __init__ : function(canvas, fps) {
        _.bindAll(this, "run", "start", "render_debug_info", "add",
                 "mousedown", "mousemove", "mouseup", "pre_rendering", "over");
        this.game_items = new GameItems();
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
                             item.set({"state" : "floating"});
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
                    return gi.get("state") == "resting";
                }
            );
        if(resting_items.length == 0) {
            this.topmost_line = this.frame.bottom;
        } else {
            this.topmost_line = resting_items[0].frame.top;
        }
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
          var ni = new NewsItem({ game : document.game });
          if(!ni.placable()) {
              document.game.over();
              return;
          }
          document.game.add(ni);
          setTimeout(spawn, 1000);
      }
      setTimeout(spawn, 1000);
      document.game.start();
});
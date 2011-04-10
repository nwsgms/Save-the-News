var ImageSortingItem = Backbone.Model.extend(
    {
	IMG_PLACEMENT : {
            left: 3,
            top: 3
	},

        initialize : function() {
            _.bindAll(this, "render");
	    this.image = this.get("message").images["Ordering"];
	},

	render : function(game, elapsed) {
	    function drawer() {
		var ctx = game.ctx;
		var box = rm.get("small_screen");
		var p = this.get("position");
		ctx.drawImage(box, p.left, p.top);
		var lo = 3;
		var to = 3;
		ctx.drawImage(
		    this.image, 
		    p.left + lo, 
		    p.top + to,
		    box.width - lo * 2,
		    box.height - to * 2
		);
	    }
	    drawer = _.bind(drawer, this);
	    drawer.zindex = 10;
	    return drawer;
	}

    }
);

var ImageSortingItems = Backbone.Collection.extend(
    {
        model : ImageSortingItem
    }
);

function ImageSortingGame() {
    this.__init__.apply(this, arguments);
}


ImageSortingGame.prototype = _.extend(
    {},
    GameBase.prototype,
    {
        GRAVITY : 4.0,
        FLOAT_TIME : .8,
        
    __init__ : function(td, canvas, fps, scale) {
        _.bindAll(this, "over", "start", "loop", "set_messages");
        GameBase.prototype.__init__.call(this, canvas, fps, scale);
        var width = canvas.width / this.scale.x;
        var height = canvas.height / this.scale.y;
        this.td = td;
        this.frame = new Rect(0, 0, width, height);
	this.items = new ImageSortingItems();
    },
	
    set_messages :  function(messages) {
	var left = 960 - 140;
	var top = 20;
	var box = rm.get("small_screen");

	_.forEach(
	    messages,
	    _.bind(
		function(message) {
		    message.image = message.images["Ordering"];
		    this.items.add(
			new ImageSortingItem(
			    {
				message : message,
				position  : { 
				    left : left, 
				    top : top
				}
			    }
			)
		    );
		    top += box.height + 20;
		},
		this)
	);
    },

    over : function() {
        this.running = false;
        this.state = "over";
        window.game = new StartScreen(this.canvas, this.fps, this.scale);
        window.game.debug = this.debug;
        window.game.start(0);
    },


    start : function() {
        GameBase.prototype.start.call(this);
    },

    loop : function(elapsed) {
        // clear background
        var ctx = this.ctx;
        ctx.save();
        var bg = rm.get("start_bg");
        ctx.drawImage(bg, 0, 0);

        var box = rm.get("large_screen");
        ctx.drawImage(box, 100, 100);


        var drawers = [];
        drawers.push(this.td.render(this, elapsed));

        this.items.forEach(
            _.bind(
                function(item) {
                    drawers.push(item.render(this, elapsed));
                }, this));
        drawers = _.sortBy(
	    drawers, 
            function(d) {
                return d.zindex;
            });
        _.forEach(drawers, function(d) {d()});
        ctx.restore();
    }


});

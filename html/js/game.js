

NewsItem = Backbone.View.extend(
    {
	tagName: "div",
	className: "newsitem",


	initialize: function() {
	    _.bindAll(this, "render", "dragstart", "dragstop", "collided");
	    this.velocity = .0;
	    this.state = "falling";
	    this.max_top = this.options.max_top;
	    this.arena = this.options.arena;
	    var arena = this.arena;
	    $(this.el).text(this.options.message);

	    var item = $(this.el);
	    arena.append(item);
	    var w = item.outerWidth();
	    var h = item.outerHeight();
	    var aw = arena.innerWidth();
	    var ah = arena.innerHeight();
	    var left = aw / 2 - w / 2;
	    this.top = 0;
	    item.css("top", this.top);
	    item.css("left", left);
	    item.draggable({
			       start: this.dragstart,
			       stop : this.dragstop
			   });
	},

	collided : function() {
	    var item = $(this.el);
	    return item.offset().top + item.outerHeight() >= this.max_top;
	},

	render: function(elapsed) {
	    var item = $(this.el);
	    if(this.state == "resting") {
		return;
	    }
	    if(this.collided()) {
		if(this.velocity >= 0) {
		    this.velocity = -this.velocity * NewsItem.DAMPING;
		}
		if(Math.abs(this.velocity) < NewsItem.RESTING_THRESHOLD) {
		    item.css("top", this.max_top - item.outerHeight() - this.arena.position().top);
		    this.state = "resting";
		}
	    }
	    if(this.state == "falling") {
		this.velocity += NewsItem.GRAVITY * elapsed;
		var p = item.position();
		item.css("top", p.top + elapsed * this.velocity);
	    } else {
		this.velocity = .0;
	    }
	},
	
	dragstart : function() {
	    this.state = "dragging";
	},

	dragstop : function() {
	    console.log("dragstop");
	    this.state = "falling";
	}
    },
    {
	GRAVITY : 20.0,
	DAMPING : .5,
	RESTING_THRESHOLD : .4
    }

);

FRAMERATE = 15.0;

var newsitems = [];

var now = new Date().getTime();

function gameloop() {
    setTimeout(gameloop, 1.0 / FRAMERATE * 1000);
    var t = new Date().getTime();
    var elapsed = (t - this.now) / 1000.0;
    now = t;
    if(elapsed == 0)
	return;
    $.each(newsitems, function(_, item) {
	       item.render(elapsed);
	   }
	  );
}

$(function() {
      var arena = $("#arena");
      ni = new NewsItem({
			    arena : arena,
			    message : "Bestes Spiel der Welt veröffentlicht",
			    max_top : arena.position().top + arena.innerHeight()
			});
      newsitems.push(ni);
      gameloop();
  });

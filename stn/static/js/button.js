
function Button() {
    this.__init__.apply(this, arguments);
}

Button.prototype = _.extend({
  
    __init__ : function(resource_name, top, left) {
	_.bindAll(this, "render", "mouseup", "mousedown");
	this.resource_name = resource_name;
	this.top = top;
	this.left = left;
	this.pressed = false;
	var img = rm.get(resource_name);
	this.frame = new Rect(left, top, img.width, img.height);
    },

    render : function(game, elapsed) {
	var rn = this.resource_name;
	if(this.pressed == true) {
	    rn += "_active";
	}
	var img = rm.get(rn);
	game.ctx.drawImage(img, this.left, this.top);
    },

    mousedown : function(p) {
	this.pressed = this.frame.contains(p);
    },

    mouseup : function(p) {
	this.pressed = false;
	if(this.frame.contains(p)) {
	    this.trigger("click");
	}
    }

}, Backbone.Events);


ButtonMixin = {
    mousedown : function(e) {
	var mp = this.mousepos(e);
	_.forEach(this.buttons,
		  _.bind(
		      function(button) {
			  button.mousedown(mp);
		      }, this));
    },

    
    mouseup : function(e) {
	var mp = this.mousepos(e);
	_.forEach(this.buttons,
		  _.bind(
		      function(button) {
			  button.mouseup(mp);
		      }, this));
    }
    
};
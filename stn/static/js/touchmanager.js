

function TouchManager() {
    this.__init__.apply(this, arguments);
}


TouchManager.prototype = {
  
    __init__ : function(element) {
	_.bindAll(this, "touch", "log_all");
	this.debug = false;
	this.tracked_event = null;
	element.addEventListener("touchstart", this.touch, false);
	element.addEventListener("touchmove", this.touch, false);
	element.addEventListener("touchend", this.touch, false);
	this.element = $(element);
    },

    touch : function(event) {
	event.preventDefault();
	if(this.debug) {
	    this.log_all(event);
	}
	var fake_event = new $.Event();
	switch(event.type) {
	case "touchstart":
	    if(this.tracked_event === null) {
		var e = event.touches[0];
		this.tracked_event = e.identifier;
	        fake_event.pageX = e.pageX;
	        fake_event.pageY = e.pageY;
		fake_event.type = "mousedown";
		this.element.trigger(fake_event);
	    }
	    break;
	case "touchmove":
	    for(var i in event.touches) {
		var e = event.touches[i];
		if(e.identifier === this.tracked_event) {
	            fake_event.pageX = e.pageX;
	            fake_event.pageY = e.pageY;
		    fake_event.type = "mousemove";
		    this.element.trigger(fake_event);
		    return;
		}
	    }
	    break;
	case "touchend":
	    for(var i in event.changedTouches) {
		var e = event.changedTouches[i];
		if(e.identifier === this.tracked_event) {
		    this.tracked_event = null;
	            fake_event.pageX = e.pageX;
	            fake_event.pageY = e.pageY;
		    fake_event.type = "mouseup";
		    this.element.trigger(fake_event);
		    return;
		}
	    }
	    break;
	}
    },

    log_all : function(event) {
	log("++++");
	log(event.type);
	log("event.touches.length: " + event.touches.length);
	log("event.targetTouches.length: " + event.targetTouches.length);
	log("event.changedTouches.length: " + event.changedTouches.length);
	log("----");
    }
};

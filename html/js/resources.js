RESOURCES = [
    ["start_bg", "media/Startseite/Hintergrund.png"],
    ["btn_start", "media/Startseite/Startbutton_norm.png"],
    ["btn_start_active", "media/Startseite/Startbutton_aktiv.png"],
    ["btn_info", "media/Startseite/Infobutton_norm.png"],
    ["btn_info_active", "media/Startseite/Infobutton_aktiv.png"],
    ["corners", "media/Startseite/Corners.png"]
]


var ResourceLoader = Backbone.Model.extend(
    {
	initialize : function() {
	    _.bindAll(this, "start", "progress_changed", "loaded");
	    this.set({"progress" : .0,
		      "finished" : false});
	    this.bind("change:progress", this.progress_changed);
	    this.resources = {};
	    this.counter = 0;
	},

	start : function() {
	    _.forEach(RESOURCES,
		      _.bind(
			  function(desc) {
			      var handle = desc[0];
			      var path = desc[1];
			      var img = $("<img src='" + path + "'/>");
			      this.resources[handle] = img.get(0);
			      img.load(this.loaded);
			  },
			  this)
		     );
	},

	loaded : function() {
	    this.counter += 1;
	    var total = _.size(this.resources);
	    var p = this.counter / total;
	    if(this.counter == total) {
		p = 1.0;
	    }
	    this.set({"progress" : p,});
	    this.set({"finished" : true});
	},

	progress_changed : function() {
	    console.log("progress: " +this.get("progress"));
	},

	get : function(handle) {
	    return this.resources[handle];
	}
    }

);
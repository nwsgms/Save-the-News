RESOURCES = [
    ["start_bg", "media/Startseite/Hintergrund.png"],
    ["btn_start", "media/Startseite/Startbutton_norm.png"],
    ["btn_start_active", "media/Startseite/Startbutton_aktiv.png"],
    ["btn_info", "media/Startseite/Infobutton_norm.png"],
    ["btn_info_active", "media/Startseite/Infobutton_aktiv.png"],
    ["corners", "media/Startseite/Corners.png"],
    ["kasten1_01", "media/Startseite/Kasten1/01.png"],
    ["kasten1_02", "media/Startseite/Kasten1/02.png"],
    ["kasten1_03", "media/Startseite/Kasten1/03.png"],
    ["kasten2_01", "media/Startseite/Kasten2/01.png"],
    ["kasten2_02", "media/Startseite/Kasten2/02.png"],
    ["kasten2_03", "media/Startseite/Kasten2/03.png"],
    ["kasten2_04", "media/Startseite/Kasten2/04.png"],
    ["kasten2_05", "media/Startseite/Kasten2/05.png"],
    ["kasten3_01", "media/Startseite/Kasten3/01.png"],
    ["kasten3_02", "media/Startseite/Kasten3/02.png"],
    ["kasten3_03", "media/Startseite/Kasten3/03.png"],
    ["kasten3_04", "media/Startseite/Kasten3/04.png"],
    ["kasten3_05", "media/Startseite/Kasten3/05.png"],
    ["kasten3_06", "media/Startseite/Kasten3/06.png"],
    ["kasten4_01", "media/Startseite/Kasten4/01.png"],
    ["kasten4_02", "media/Startseite/Kasten4/02.png"],
    ["kasten4_03", "media/Startseite/Kasten4/03.png"],
    ["kasten4_04", "media/Startseite/Kasten4/04.png"],
    ["kasten4_05", "media/Startseite/Kasten4/05.png"],
    ["kasten4_06", "media/Startseite/Kasten4/06.png"],
    ["kasten4_07", "media/Startseite/Kasten4/03.png"],
    ["kasten4_08", "media/Startseite/Kasten4/04.png"],
    ["kasten4_09", "media/Startseite/Kasten4/05.png"],
    ["kasten4_10", "media/Startseite/Kasten4/06.png"]
]


var ResourceLoader = Backbone.Model.extend(
    {
	initialize : function() {
	    _.bindAll(this, "start", "loaded");
	    this.set({"progress" : .0,
		      "finished" : false});
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
	    this.set({"progress" : p});
	    if(p == 1.0) {
		this.set({"finished" : true});
	    }
	},

	get : function(handle) {
	    return this.resources[handle];
	}
    }

);
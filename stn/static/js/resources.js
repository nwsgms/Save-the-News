RESOURCES = [
    ["start_bg", "media/Startseite/Hintergrund.png"],
    ["btn_start", "media/Startseite/Startbutton_norm.png"],
    ["btn_start_active", "media/Startseite/Startbutton_aktiv.png"],
    ["btn_info", "media/Startseite/Infobutton_norm.png"],
    ["btn_info_active", "media/Startseite/Infobutton_aktiv.png"],
    ["btn_facebook", "media/Ergebnis/button_facebook.png"],
    ["btn_facebook_active", "media/Ergebnis/button_facebook_aktiv.png"],
    ["btn_twitter", "media/Ergebnis/button_twitter.png"],
    ["btn_twitter_active", "media/Ergebnis/button_twitter_aktiv.png"],
    ["btn_back", "media/Ergebnis/button_zurueck.png"],
    ["btn_back_active", "media/Ergebnis/button_zurueck_aktiv.png"],
    ["ddorf_unsatisfied", "media/Ergebnis/Deppendorf_unzufrieden.png"],
    ["ddorf_neutral", "media/Ergebnis/Deppendorf_neutral.png"],
    ["ddorf_happy", "media/Ergebnis/Deppendorf_gluecklich.png"],
    ["ddorf_surprised", "media/Ergebnis/Deppendorf_ueberrascht.png"],
    ["corners", "media/Startseite/Corners.png"],
    ["table", "media/Tisch.png"],
    ["trash", "media/Muelleimer.png"],
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
    ["kasten4_10", "media/Startseite/Kasten4/06.png"],
    ["sendeplan_1", "media/Sendeplan/01.png"],
    ["sendeplan_2", "media/Sendeplan/02.png"],
    ["sendeplan_3", "media/Sendeplan/03.png"],
    ["sendeplan_4", "media/Sendeplan/04.png"], 
    ["sendeplan_5", "media/Sendeplan/05.png"],
    ["sendeplan_6", "media/Sendeplan/06.png"],
    ["add2schedule_01", "media/auf_sendeplan_ziehen/01.png"],
    ["add2schedule_02", "media/auf_sendeplan_ziehen/02.png"],
    ["add2schedule_03", "media/auf_sendeplan_ziehen/03.png"],
    ["add2schedule_04", "media/auf_sendeplan_ziehen/04.png"],
    ["add2schedule_05", "media/auf_sendeplan_ziehen/05.png"],
    ["add2schedule_06", "media/auf_sendeplan_ziehen/06.png"],
    ["add2schedule_07", "media/auf_sendeplan_ziehen/07.png"],
    ["add2schedule_08", "media/auf_sendeplan_ziehen/08.png"],
    ["add2schedule_09", "media/auf_sendeplan_ziehen/09.png"],
    ["add2schedule_10", "media/auf_sendeplan_ziehen/10.png"],
    ["add2schedule_11", "media/auf_sendeplan_ziehen/11.png"],
    ["add2schedule_12", "media/auf_sendeplan_ziehen/12.png"],
    ["add2schedule_13", "media/auf_sendeplan_ziehen/13.png"],
    ["add2schedule_14", "media/auf_sendeplan_ziehen/14.png"],
    ["add2schedule_15", "media/auf_sendeplan_ziehen/15.png"],
    ["add2schedule_16", "media/auf_sendeplan_ziehen/16.png"],
    ["crumple_01", "media/zerknuellen/01.png"],
    ["crumple_02", "media/zerknuellen/02.png"],
    ["crumple_03", "media/zerknuellen/03.png"],
    ["crumple_04", "media/zerknuellen/04.png"],
    ["crumple_05", "media/zerknuellen/05.png"],
    ["crumple_06", "media/zerknuellen/06.png"],
    ["crumple_07", "media/zerknuellen/07.png"],
    ["crumple_08", "media/zerknuellen/08.png"],
    ["crumple_09", "media/zerknuellen/09.png"],
    ["crumple_10", "media/zerknuellen/10.png"],
    ["crumple_11", "media/zerknuellen/11.png"],
    ["crumple_12", "media/zerknuellen/12.png"],
    ["crumple_13", "media/zerknuellen/13.png"],
    ["crumple_14", "media/zerknuellen/14.png"],
    ["crumple_15", "media/zerknuellen/15.png"],
    ["crumple_16", "media/zerknuellen/16.png"],
    ["large_screen", "media/Bildordnung/Screen_gr.png"],
    ["small_screen", "media/Bildordnung/Kasten_kl_1.png"]
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
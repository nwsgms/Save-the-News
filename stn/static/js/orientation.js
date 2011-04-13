function orientation_changed() {
    function start_game() {
        if(window.game !== undefined) {
	    window.game.stopped = false;
	    window.game.now = undefined;
            window.game.run();		 
	}

    }

    function stop_game() {
        if(window.game !== undefined) {
	    window.game.stopped = true;		 
	}
    }

    function install_overlay() {
	var o = $("<div id='overlay'/>");
	o.text("Bitte das iPhone quer halten.");
	$("body").prepend(o);
    }
    switch(window.orientation) {
    case 0:
    case 180:
	stop_game();
	install_overlay();
	break;
    case 90:
    case -90:
	while($("#overlay").length) {
	    $("#overlay").remove();
	}
	start_game();
    }
}

$(function(){
   $("body").bind("orientationchange", orientation_changed);
});
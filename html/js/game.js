$(function() {
      var item = $("<div class='newsitem'/>");
      item.text("Bestes Spiel der Welt veröffentlicht");
      item.hide();
      var arena = $("#arena");
      arena.append(item);
      var w = item.outerWidth();
      var h = item.outerHeight();
      var aw = arena.innerWidth();
      var ah = arena.innerHeight();
      var left = aw / 2 - w / 2;
      var top = 0;
      
      function place() {
	  item.css("left", left);
	  item.css("top", top);
	  
	  item.fadeIn(
	      function() {
		  item.animate(
		      {
			  left: left,
			  top: ah - h
		      },
		      3000,
		      "easeOutBounce",
		      place
		  );
	      }
	  );
      };
      place();
  });

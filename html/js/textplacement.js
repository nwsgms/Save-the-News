function place_text(text, lineheight, ctx, width, height) {
    ctx.save();
    ctx.restore();
    var top = lineheight;
    var h = split(text);
    var s = [];
    for(var i = 0; i < (width / lineheight) * 2; i++) {
	s.push ("X");
    }
    var sentinel = s.join("");
    h.push(sentinel);
    var parts = [];
    while(h.length) {
	parts.push(h.pop());
    }

    function stitch(parts) {
	var candidate = line_parts.join(" ");
	if(candidate[candidate.length-1] == "|") {
	    candidate = candidate.substring(0,
					    candidate.length -1) + "-";
	}
	while(true) {
	    var h = candidate.replace("| ", "");
	    if(h == candidate) {
		break;
	    }
	    candidate = h;
	}

	return candidate;
    }

    while(true) {
	var line_parts = [parts.pop()];
	while(true) {
	    var candidate = stitch(line_parts);
	    var tm = ctx.measureText(candidate);
	    if(tm.width >= width)
		break;
	    line_parts.push(parts.pop());
	};
	// take away the thing that pushed us over the limit
	parts.push(line_parts.pop());
	// we either reached the sentinel, or
	// a part that's too large for display
	if(_.isEmpty(line_parts)) {
	    if(parts[parts.length - 1] == sentinel) {
		return top + lineheight;
	    }
	    return -1;
	}
	ctx.fillText(stitch(line_parts), 0, top);
	top += lineheight;
    }
}

function redraw() {
    var canvas = $("#canvas").get(0);
    $(canvas).attr("width", $("#canvas_width").slider("value"));

    var w = canvas.width;
    var h = canvas.height;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    var text = $("#texts li.selected").text();
    var fontsize = $("#text_size").slider("value");
    var fontname = fontsize + "px Arial";
    ctx.fillStyle = "#fff";
    ctx.font = fontname;
    place_text(text, fontsize, ctx, w, h);
}


MESSAGES = [
    "EU for|dert „un|ver|züg|li|chen Rück|tritt“ Gad|dafis",
    "Erste Test|be|richte zum iPad 2 lo|ben die ho|he Ge|schwin|dig|keit",
    "Posch muss drau|ßen blei|ben",
    "NRW-Am|bi|tio|nen: Rött|gen gibt sich trotz E10-De|sas|ter selbst|be|wusst"
];

$(function() {
      _.forEach(MESSAGES,
		function(text) {
		    var li = $("<li/>");
		    li.text(text);
		    $("#texts").append(li);
		}
	       );
      $("#texts li").click(
	  function() {
	      $("#texts li").removeClass("selected");
	      $(this).addClass("selected");
	      redraw();
	  }
      );


      $("#canvas_width").slider(
	  {
	      min: 50,
	      max: 200,
	      value: 100,
	      change : function(event, ui) {
		  redraw();
	      }

	  }
      );
      $("#text_size").slider(
	  {
	      min: 5,
	      max: 50,
	      value: 20,
	      change : function(event, ui) {
		  redraw();
	      }

	  }
      );

      $("#texts li").first().click();
});
function place_text(text, text_style, lineheight, ctx, width, height, options) {
    var o = {
        really_draw : true,
        center : true
    };
    if(options !== undefined) {
        _.extend(o, options);
    }
    ctx.fillStyle = text_style;
    var top = lineheight;
    var h = split(text);
    var s = [];
    for(var i = 0; i < width ; i++) {
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
            if(tm.width >= width) {
                break;          
            }
            line_parts.push(parts.pop());
        };
        // take away the thing that pushed us over the limit
        parts.push(line_parts.pop());
        // we either reached the sentinel, or
        // a part that's too large for display
        if(_.isEmpty(line_parts)) {
            if(parts[parts.length - 1] == sentinel) {
                return top;
            }
            return -1;
        }
        if(o.really_draw) {
            var candidate = stitch(line_parts);
            var left = 0;
            if(o.center) {
                var tm = ctx.measureText(candidate);
                left = (width - tm.width) / 2;
            }
            ctx.fillText(candidate, left, top);
        }
        top += lineheight;
    }
}


function render_text(canvas, text, fontsize, options) {
    var w = canvas.width;
    var h = canvas.height;
    var ctx = canvas.getContext("2d");

    var fontname = fontsize + "px Arial";
    ctx.font = fontname;

    // the width and height for the text to render. 
    var tw = w - options.padding_left - options.padding_right;
    var th = h - options.padding_top - options.padding_bottom;


    // place text without rendering to determine the height
    var needed_height = place_text(text, options.text_style, fontsize, ctx, tw, th, {
                                       really_draw : false});
    if(needed_height != -1) {
        h = Math.min(needed_height, h); 
    }

    // clear the canvas
    ctx.fillStyle = "rgba(0, 0,0 ,0)";
    ctx.fillRect(0, 0, w, h);

    // draw the background with rounded corners;
    ctx.fillStyle = options.background;
    ctx.fillRect(options.corner_radius, 0, w - options.corner_radius * 2, h);
    ctx.fillRect(0, options.corner_radius, w, h - options.corner_radius * 2);
    
    function dc(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, options.corner_radius, 0, 360, false);
        ctx.fill();
    }
    dc(options.corner_radius, options.corner_radius);
    dc(w - options.corner_radius, options.corner_radius);
    dc(w - options.corner_radius, h - options.corner_radius);
    dc(options.corner_radius, h - options.corner_radius);


    ctx.save();
    ctx.translate(options.padding_left, options.padding_top);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(tw, 0);
    ctx.lineTo(tw, th);
    ctx.lineTo(0, th);
    ctx.lineTo(0, 0);
    ctx.clip();

    place_text(text, options.text_style, fontsize, ctx, tw, th);
    ctx.restore();
}


function redraw() {
    var canvas = $("#canvas").get(0);
    $(canvas).attr("width", $("#canvas_width").slider("value"));
    var fontsize = $("#text_size").slider("value");
    var text = $("#texts li.selected").text();
    render_text(canvas, text, fontsize, {
                    padding_top : 10,
                    padding_bottom : 10,
                    padding_left: 10,
                    padding_right: 10,
                    background : "#eef",
                    corner_radius : 8,
                    text_style : "#000"
                });
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
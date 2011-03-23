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


function render_text(ctx, w, h, text, options) {
    var fontsize = options.fontsize;
    var fontname = fontsize + "px " + options.fontname;
    ctx.font = fontname;

    // the width and height for the text to render. 
    var tw = w - options.padding_left - options.padding_right;
    var th = h - options.padding_top - options.padding_bottom;


    // place text without rendering to determine the height
    var needed_height = place_text(text, options.text_style, fontsize, ctx, tw, th, {
                                       really_draw : false});
    if(needed_height != -1) {
        h = Math.min(needed_height, h); 
    } else {
        return null;
    }

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


    // clip the rendering aera
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
    image_data = ctx.getImageData(0, 0, w, h);
    var img_canvas = document.createElement("canvas");
    img_canvas.setAttribute("width", w);
    img_canvas.setAttribute("height", h);
    img_canvas.getContext("2d").putImageData(image_data, 0, 0);
    return img_canvas;
}

function render_messages(messages, max_width, options) {
    var o = {};
    _.extend(o, 
             // the defaults
             {
                    padding_top : 10,
                    padding_bottom : 10,
                    padding_left: 10,
                    padding_right: 10,
                    background : "#eef",
                    corner_radius : 8,
                    text_style : "#000",
                    fontname : "Arial",
                    fontsize : 20
             },
            options);
    var canvas = $("<canvas/>");
    canvas.attr("width", max_width);
    canvas.attr("height", max_width);
    var ctx = canvas.get(0).getContext("2d");
    _.forEach(messages,
              function(message) {
		  var text = message.headline;
		  ctx.globalCompositeOperation = "copy";
		  ctx.fillStyle = 'rgba(0, 0, 0, 255)';
		  ctx.fillRect(0, 0, max_width, max_width);
		  ctx.globalCompositeOperation = "source-over";
                  message.image = render_text(ctx, max_width, max_width, text, o);
              }
             );
}
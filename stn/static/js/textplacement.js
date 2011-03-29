
function redraw() {
    var canvas = $("#canvas").get(0);
    var ctx = canvas.getContext("2d");
    // clear the canvas
    ctx.fillStyle = "rgba(0, 0,0 , 255)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var width = $("#canvas_width").slider("value");
    var height = canvas.height;
    var fontsize = $("#text_size").slider("value");
    var text = $("#texts li.selected").text();
    render_text(ctx, width, height, text, {
                    padding_top : 10,
                    padding_bottom : 10,
                    padding_left: 10,
                    padding_right: 10,
                    background : "#eef",
                    corner_radius : 8,
                    text_style : "#000",
                    fontname : "optimer",
                    fontsize : fontsize
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
      var foo = render_messages(MESSAGES, 400);
});
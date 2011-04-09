
function Message() {
    this.__init__.apply(this, arguments);
}

Message.prototype = {
  
    __init__ : function(entry)  {
	_.bindAll(this, "load_image");
	this.headline = entry.headline;
	this.category = entry.category;
	this.id = entry.id;
    },

    load_image : function (device, stage, callback) {
	var image = $("<img/>");
	image.attr(
	    "src", 
	    "/textblock/" + device + "/" + stage + "/" + this.id
	);
	image.load(
	    function() {
		callback(image.get(0));
	    }
	);
    }
};

function get_messages(callback) {
    $.getJSON(
	"/sample",
	{},	
	function(res) {
	    var messages = _.map(
		res.news,
		function(entry) {
		    return new Message(entry);
		}
	    );
	    callback(messages);
	}
    );
};

function Message() {
    this.__init__.apply(this, arguments);
}

Message.prototype = {
  
    __init__ : function(entry)  {
	_.bindAll(this, "load_images");
	this.headline = entry.headline;
	this.category = entry.category;
	this.id = entry.id;
	this.images = {};
    },

    load_images : function (device, callback) {
	stages = ["Sorting", "Selecting", "Ordering"];
	_.forEach(
	    stages,
	    _.bind(
		function(stage) {
		    var image = $("<img/>");
		    image.load(
			_.bind(
			    function() {
				this.count += 1;
				this.images[stage] = image.get(0);
				if(_.size(this.images) == _.size(stages)) {
				    callback(this);
				}
			    },
			    this)
		    );
		    image.attr(
			"src", 
			"/textblock/" + device + "/" + stage + "/" + this.id
		    );
		},
		this)
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
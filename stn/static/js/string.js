

function split(text) {
    var res = [];
    var parts = _.compact(text.split(" "));
    _.forEach(
	parts, 
	function(part) {
	    if(part.indexOf("|") == -1) {
		res.push(part);
	    } else {
		_.forEach(
		    part.split("|"),
		    function(subpart) {
			res.push(subpart + "|");
		    }
		);
		var last = res.pop();
		res.push(last.substring(0, last.length - 1));
	    }
	}
    );
    return res;
}
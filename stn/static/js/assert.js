function assert(cond, msg) {
    if(!cond) {
	if(msg === undefined)
	    msg = "assertion failed";
	throw msg;
    }
}

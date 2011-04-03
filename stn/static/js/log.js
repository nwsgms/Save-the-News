function log(m) {
    return;
    if(console === undefined)
	return;
    if(console.log === undefined)
	return;
    console.log(m);
}

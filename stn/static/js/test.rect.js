load("underscore.js");
load('rect.js');


function assert(cond, msg) {
    if(!cond) {
	if(msg === undefined)
	    msg = "assertion failed";
	throw msg;
    }
}

a = new Rect(0, 0, 10, 10);
b = new Rect(10, 0, 10, 10);
assert(!a.overlaps(b), "direct touch, but no overlap");
b.translate(-1, 0);
assert(a.overlaps(b), "one pixel overlap");

c = new Rect(5, 5, 2, 2);

// full inclusion
assert(a.overlaps(c), "full inclusion");
// works inverted
assert(c.overlaps(a), "full inclusion inverted");

// "cross-shaped" overlapping
d = new Rect(0, 5, 20, 5);
e = new Rect(10, 0, 5, 20);

assert(d.overlaps(e), "cross shaped");
assert(e.overlaps(d), "cross shaped, inverted");
// now test that all quadrants don't collide

a = new Rect(0, 0, 10, 10);
b = new Rect(0, 0, 10, 10);
// topleft
b.move(-10, -10);
assert(!a.overlaps(b), "topleft");
// top
b.move(0, -10);
assert(!a.overlaps(b), "top");
// topright
b.move(10, -10);
assert(!a.overlaps(b), "topright");

// bottomleft
b.move(-10, 10);
assert(!a.overlaps(b), "bottomleft");
// bottom
b.move(0, 10);
assert(!a.overlaps(b), "bottom");
// topright
b.move(10, 10);
assert(!a.overlaps(b), "bottomright");

// left
b.move(0, -10);
assert(!a.overlaps(b), "left");
// right
b.move(0, 10);
assert(!a.overlaps(b), "right");

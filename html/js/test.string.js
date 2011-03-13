load("underscore.js");
load("string.js");
load("assert.js");

assert(_.isEqual(split("a   b c"), ["a", "b", "c"]));
assert(_.isEqual(split("a|bc|d e"), ["a|", "bc|", "d", "e"]));


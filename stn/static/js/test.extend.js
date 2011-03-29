load("underscore.js");
load("assert.js");

function Base() {
    
};

Base.prototype = {
  
    test : function() {
	print("Base.test");
	return "Base";
    }
};

function A() {
    
}

A.prototype = _.extend(
    {},
    Base.prototype,
    {
	test : function() {
	    Base.prototype.test.apply(this);
	    print("A.test");
	    return "A";
	}
    }
);


function B() {
    
}

B.prototype = _.extend(
    {},
    A.prototype,
    {
	test : function() {
	    return "B";
	}
    }
);

base = new Base();

assert(base.test() == "Base", "Base.test");

a = new A();
b = new B();

assert(a.test() == "A", "A.test");
assert(b.test() == "B", "B.test");
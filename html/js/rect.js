/*
 * Depends: 
 *     underscore.js
 */

Rect = function() {
    this.__init__.apply(this, arguments);
}


Rect.prototype = {
  
    __init__ : function(x, y, w, h) {
        _.bindAll(this, "translate", "resize", "overlaps", "contains", "inside",
                 "normalize", "contains", "move");
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.normalize();
    },

    move : function(x, y) {
        if(y === undefined) {
            y = x.y;
            x = x.x;
        }
        this.x = x;
        this.y = y;
        this.normalize();
    },

    translate : function(x, y) {
        if(y === undefined) {
            y = x.y;
            x = x.x;
        }
        this.x += x;
        this.y += y;
        this.normalize();
    },

    resize : function() {
        if(arguments.length == 2) {
            args = { x : arguments[0],
                     y : arguments[1]
                   }
        } else {
            args = arguments;
        }
        if("x" in args) {
            this.width += args.x;
            this.height += args.y;
        } else if("width" in args) {
            this.width = args.width;
            this.height = args.height;
        } else {
            throw "wrong parameter for resize" ;
        }
        this.normalize();
    },

    normalize : function() {
        this.top = this.y;
        this.left = this.x;
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
        this.topleft = {x : this.left, y : this.top};
        this.topright = {x : this.right, y : this.top};
        this.bottomleft = {x : this.left, y : this.bottom};
        this.bottomright = {x : this.right, y : this.bottom};
    },

    contains : function(x, y) {
        if(y === undefined) {
            y = x.y;
            x = x.x;
        }
        return this.left <= x && this.right >= x && this.top <= y && this.bottom >= y;
    },

    overlaps : function(other) {
        return this.contains(other.topleft) || this.contains(other.topright) || this.contains(other.bottomleft) || this.contains(other.bottomright);
    },

    inside : function(other) {
        return other.contains(this.topleft) && other.contains(this.topright) && other.contains(this.bottomleft) && other.contains(this.bottomright);
    }

    
};
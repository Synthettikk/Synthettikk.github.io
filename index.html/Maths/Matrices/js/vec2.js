class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get length() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }
    get length2() {
        return this.x*this.x + this.y*this.y;
    }

    get normal() {
        return new Vec2(-this.y, this.x);
    }

    // Adding a vector to the class vector
	add(vec){
		this.x += vec.x;
		this.y += vec.y;
	}
	// Scaling this vector by a scalar value
	scale(scalar){
		this.x *= scalar;
		this.y *= scalar;
	}
	// Substracting a vector from the class vector
	sub(vec){
		this.x -= vec.x;
		this.y -= vec.y;
	}
	

}
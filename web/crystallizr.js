// Vector class

function Vector(x, y) {
	this.x = x;
  this.y = y;
};

Vector.prototype.add(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};

Vector.prototype.subtract(other) {
  return new Vector(this.x - other.x, this.y - other.y);
};

Vector.prototype.magnitude() {
  return Math.sqrt(Math.pow(this.x, 2.0), Math.pow(this.y, 2.0));
};

Vector.prototype.scale(scalar) {
  return new Vector(this.x * scalar, this.y * scalar);
};

Vector.prototype.normalize() {
  var magnitude = this.magnitude;
  return new Vector(this.x / this.magnitude, this.y / this.magnitude);
}; 

// Point class

function Point(position_vector, velocity_vector, repulsion_distance, repulsion_strength, repulsion_distance, attraction_strength, attraction_distance) {
  this.position = position_vector;
  this.velocity = velocity_vector;
  this.repulsion_strength = repulsion_strength;
  this.repulsion_distance = repulsion_distance;
  this.attraction_strength = attraction_strength;
  this.attraction_distance = attraction_distance;
};

Point.prototype.update_position(delta) {
  this.position = this.position.add(this.velocity.scale(delta));
};

Point.prototype.accelerate(acceleration_vector) {
  this.velocity = this.velocity.add(acceleration_vector);
};

// World class

function World(x_size, y_size) {
  this.x_size = x_size;
  this.y_size = y_size;
  this.points = [];
};

World.prototype.add_point(point) {
  this.points.push(point);
};

World.prototype.tick(delta) {
  for (var i=0; i < this.points.length; i++) {
    var point = this.points[i];
    for (var j=0; j < this.points.length; j++) {
      if (i == j) continue; // Skip if we're on the same point
      var target = this.points[j];
      var point_to_target = point.
    }
    point.update_position(delta);
  }
};

// Rendering

var canvas = document.getElementById("canvas-0");
console.log(canvas);
var context = canvas.getContext("2d");
context.fillStyle="#FF0000";
var x = 5;
var y = 5;
context.fillRect(x, y, x+1, y+1);

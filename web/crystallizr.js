// Vector class

var Vector = function(x, y) {
  this.x = x;
  this.y = y;
};

Vector.prototype.add = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};

Vector.prototype.subtract = function(other) {
  return new Vector(this.x - other.x, this.y - other.y);
};

Vector.prototype.magnitude = function() {
  return Math.sqrt(Math.pow(this.x, 2.0) + Math.pow(this.y, 2.0));
};


Vector.prototype.scale = function(scalar) {
  return new Vector(this.x * scalar, this.y * scalar);
};

Vector.prototype.normalize = function() {
  var magnitude = this.magnitude;
  return new Vector(this.x / this.magnitude, this.y / this.magnitude);
}; 

// Point class

var Point = function(position_vector, velocity_vector, color, radius, repulsion_distance, repulsion_strength, attraction_distance, attraction_strength) {
  this.position = position_vector;
  this.velocity = velocity_vector;
  this.color = color;
  this.radius = radius;
  this.repulsion_strength = repulsion_strength;
  this.repulsion_distance = repulsion_distance;
  this.attraction_strength = attraction_strength;
  this.attraction_distance = attraction_distance;
};

Point.prototype.update_position = function(delta) {
  this.position = this.position.add(this.velocity.scale(delta));
};

Point.prototype.accelerate = function(acceleration_vector) {
  this.velocity = this.velocity.add(acceleration_vector);
};

// World class

var World = function(x_size, y_size) {
  this.x_size = x_size;
  this.y_size = y_size;
  this.points = [];
};

World.prototype.add_point = function(point) {
  this.points.push(point);
};

World.prototype.tick = function(delta) {
  for (var i=0; i < this.points.length; i++) {
    var point = this.points[i];
    for (var j=0; j < this.points.length; j++) {
      if (i == j) continue; // Skip if we're on the same point
      var target = this.points[j];
      var point_to_target = point.position.subtract(target.position);
      var distance = point_to_target.magnitude();
      //if (distance < point.repulsion_distance) {
      //  var repulsion_scalar = -point.repulsion_strength / distance;
      //  target.accelerate(point_to_target.scale(repulsion_scalar));
      //}
      //if (distance > point.attraction_distance) {
      //  var attraction_scalar = point.attraction_strength / distance;
      //  target.accelerate(point_to_target.scale(attraction_scalar));
      //}
      var repulsion_scaslar = - point.repulsion_strength * ()
    }

    // Update current point position
    point.update_position(delta);

    // Bound to the world
    if (point.position.x > this.x_size) point.velocity.x *= -1;
    if (point.position.x < 0) point.velocity.x *= -1;
    if (point.position.y > this.y_size) point.velocity.y *= -1;
    if (point.position.y < 0) point.velocity.y *= -1;

    // Apply drag
    point.velocity = point.velocity.scale(0.999);
    
  }
};

// Rendering

function render_world(world, context) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  for (var i=0; i < world.points.length; i++) {
    var point = world.points[i];
    context.fillStyle = point.color;
    context.beginPath();
    context.arc(point.position.x, point.position.y, point.radius, 0, Math.PI*2, true); 
    context.closePath();
    context.fill();
  }
};

var width = 300;
var height = 300;

var canvas = document.getElementById("canvas-0");
var context = canvas.getContext("2d");

canvas.width = width;
canvas.height = height;

var world = new World(width, height);
world.add_point(new Point(new Vector(148, 130), new Vector(0.0, 0.0), "#00FF00", 5, 11, 0.1, 10, 0.01));
world.add_point(new Point(new Vector(160, 130), new Vector(0.0, 0.0), "#FF0000", 5, 11, 0.1, 10, 0.01));

window.setInterval(function() {
  world.tick(1);
  render_world(world, context);
}, 5);
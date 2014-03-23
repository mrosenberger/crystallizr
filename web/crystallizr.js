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
  var magnitude = this.magnitude();
  return new Vector(this.x / magnitude, this.y / magnitude);
}; 

// Point class

var Point = function(position_vector, velocity_vector, color, radius, balance_distance) {
  this.position = position_vector;
  this.velocity = velocity_vector;
  this.color = color;
  this.radius = radius;
  this.balance_distance = balance_distance;
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

World.prototype.update_velocities = function(delta) {
  for (var i=0; i < this.points.length; i++) {
    var point = this.points[i];
    //var twiceBalDistSquared = Math.pow(point.balance_distance * 2.0, 2.0); // Can optimize a LOT here. Skip some square roots, skip cals if outside, etc.
    for (var j=0; j < this.points.length; j++) {
      if (i == j) continue; // Skip if we're on the same point
      var target = this.points[j];
      var point_to_target = point.position.subtract(target.position);
      var distance = point_to_target.magnitude();
      var from_balance = Math.abs(distance - point.balance_distance);
      //var color_val = (distance / (sim_config.new_point_equilibrium_distance * sim_config.interaction_cutoff_in_equilibriums)) * 255;
      context.strokeStyle = sim_config.force_lines_color;
      if (distance > (point.balance_distance * sim_config.interaction_cutoff_in_equilibriums)) {

      } else if (distance > point.balance_distance) { // Point is outside balance, attract
        target.accelerate(point_to_target.scale(from_balance).scale(sim_config.attraction_scalar));
        if (sim_config.draw_force_lines) {
          context.beginPath();
          context.moveTo(point.position.x, point.position.y);
          context.lineTo(target.position.x, target.position.y);
          context.closePath();
          //context.strokeStyle = "green";
          //console.log(from_balance);
          //context.strokeStyle = "rgba(0," + 255 - color_val + "," + color_val + ",1.0)";
          //context.strokeStyle = "rgba(200, 200, 200, 1.0)";
          context.stroke();
        }
      } else { // Point is inside balance, repel
        target.accelerate(point_to_target.scale(from_balance).scale(sim_config.repulsion_scalar));
        if (sim_config.draw_force_lines) {
          context.beginPath();
          context.moveTo(point.position.x, point.position.y);
          context.lineTo(target.position.x, target.position.y);
          context.closePath();
          //context.strokeStyle = "rgba(100,0," + from_balance + ",1)";
          //context.strokeStyle = "red";
          //context.strokeStyle = "rgba(0," + (255 - color_val) + "," + color_val + ",1.0)";
          context.stroke();
        }
      }
    }
  }
};

World.prototype.bound_points = function(delta) {
  for (var i=0; i < this.points.length; i++) {
    var point = this.points[i];
    if (point.position.x > this.x_size - point.radius) {
      point.velocity.x *= sim_config.bounce_offending_multiplier;
      point.velocity.y *= sim_config.bounce_non_offending_multiplier;
      point.position.x = this.x_size - point.radius;
    }
    if (point.position.x < point.radius) {
      point.velocity.x *= sim_config.bounce_offending_multiplier;
      point.velocity.y *= sim_config.bounce_non_offending_multiplier;
      point.position.x = point.radius;
    }
    if (point.position.y > this.y_size - point.radius) {
      point.velocity.y *= sim_config.bounce_offending_multiplier;
      point.velocity.x *= sim_config.bounce_non_offending_multiplier;
      point.position.y = this.y_size - point.radius;
    }
    if (point.position.y < point.radius) {
      point.velocity.y *= sim_config.bounce_offending_multiplier;
      point.velocity.x *= sim_config.bounce_non_offending_multiplier;
      point.position.y = point.radius;
    }
  }
};

World.prototype.bound_points_deprecated = function(delta) {
  for (var i=0; i < this.points.length; i++) {
    var point = this.points[i];
    var friction = 0; // This is dumb. Might just swap out with a =[0, 0] at some point
    if (point.position.x > this.x_size - point.radius) {
      point.velocity = point.velocity.scale(friction);
      point.position.x = this.x_size - point.radius;
    }
    if (point.position.x < point.radius) {
      point.velocity = point.velocity.scale(friction);
      point.position.x = point.radius;
    }
    if (point.position.y > this.y_size - point.radius) {
      point.velocity = point.velocity.scale(friction);
      point.position.y = this.y_size - point.radius;
    }
    if (point.position.y < point.radius) {
      point.velocity = point.velocity.scale(friction);
      point.position.y = point.radius;
    }
  }
};

World.prototype.apply_drag_to_points = function(delta) {
  for (var i=0; i < this.points.length; i++) {
    var point = this.points[i];
    point.velocity = point.velocity.scale(sim_config.drag_multiplier * delta);
  }
};

World.prototype.update_positions = function(delta) {
  for (var i=0; i < this.points.length; i++) {
    var point = this.points[i];
    point.update_position(delta);
  }
};

World.prototype.apply_gravity_to_points = function(delta) {
  for (var i=0; i < this.points.length; i++) {
    var point = this.points[i];
    point.accelerate(new Vector(0, sim_config.gravity_strength));
  }
}

World.prototype.tick = function(delta) {
  this.update_velocities(delta);
  //if (!(mouse_pressed && shift_pressed)) this.apply_gravity_to_points(delta);
  this.apply_gravity_to_points(delta);
  this.apply_drag_to_points(delta);
  this.update_positions(delta);
  this.bound_points(delta);
  if (mouse_pressed && !shift_pressed) {

    ticks_since_drag_start++;
    var before = context.globalAlpha;
    context.globalAlpha = Math.max(0.0, 1.0 - (0.1 * ticks_since_drag_start));
    context.beginPath();
    context.arc(current_mouse_x, current_mouse_y, sim_config.drag_selection_radius, 0, 2 * Math.PI, false);
    context.lineWidth = 1;
    context.strokeStyle = '#FFF';
    context.stroke();
    context.globalAlpha = before;

    for (var i=0; i < points_to_drag.length; i++) {
      var point = points_to_drag[i];
      point.accelerate((new Vector(current_mouse_x, current_mouse_y).subtract(point.position)).scale(0.01));
    }
  }
};

// Rendering

function get_random_color() {
  var letters = "0123456789ABCDEF".split("");
  var color = "#";
  for (var i = 0; i < 6; i++ ) {
      color += letters[Math.round(Math.random() * 15)];
  }
  return color;
};

function choose_point_color() {
  if (_.string.strip(sim_config.new_point_color) == "random") {
    return get_random_color();
  } else {
    return sim_config.new_point_color;
  }
}

function render_world(world, context) {
  //if (mouse_pressed && shift_pressed) {
  //  context.fillStyle = "rgba(0, 0, 0, " + sim_config.screen_clear_opacity_dragging + ")";
  //} else {
  //  context.fillStyle = "rgba(0, 0, 0, " + sim_config.screen_clear_opacity + ")";
  //}
  context.fillStyle = "rgba(0, 0, 0, " + sim_config.screen_clear_opacity + ")";
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  for (var i=0; i < world.points.length; i++) {
    var point = world.points[i];
    context.fillStyle = point.color;
    context.beginPath();
    context.arc(point.position.x, point.position.y, point.radius, 0, Math.PI*2, true); 
    context.closePath();
    context.fill();
  }

  if (shift_pressed && mouse_pressed) {
    // Draw lines showing point to be thrown
    context.beginPath();
    context.moveTo(drag_origin_x, drag_origin_y);
    context.lineTo(current_mouse_x, current_mouse_y);
    context.closePath();
    context.strokeStyle = "orange";
    context.stroke();
  }
};

var get_offset = function(el) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
};

// Parameters of simulation
var firm_crystal_config_000 = {
  attraction_scalar: 0.0001,
  repulsion_scalar: -0.01, 
  drag_multiplier: 0.95,
  gravity_strength: 0.1,
  interaction_cutoff_in_equilibriums: 2.0,
  new_point_equilibrium_distance: 50.0,
  new_point_radius: 5,
  point_shooting_scalar: 0.3,
  draw_force_lines: false,
  force_lines_color: "#CCC",
  bounce_offending_multiplier: -0.5,
  bounce_non_offending_multiplier: 1.0,
  screen_clear_opacity: 0.5,
  screen_clear_opacity_dragging: 0.5,
  drag_selection_radius: 150
};

var firm_crystal_config_001 = {
  attraction_scalar: 0.0003,
  repulsion_scalar: -0.02, 
  drag_multiplier: 0.95,
  gravity_strength: 0.1,
  interaction_cutoff_in_equilibriums: 2.0,
  new_point_equilibrium_distance: 40.0,
  new_point_radius: 5,
  point_shooting_scalar: 0.3,
  draw_force_lines: false,
  bounce_offending_multiplier: -0.5,
  bounce_non_offending_multiplier: 0.5,
  screen_clear_opacity: 0.5,
  screen_clear_opacity_dragging: 0.5,
  drag_selection_radius: 100
};

var firm_crystal_config_002 = {
  attraction_scalar: 0.0004,
  repulsion_scalar: -0.021, 
  drag_multiplier: 0.95,
  gravity_strength: 0.1,
  interaction_cutoff_in_equilibriums: 2.0,
  new_point_equilibrium_distance: 40.0,
  new_point_radius: 5,
  point_shooting_scalar: 0.3,
  draw_force_lines: false,
  bounce_offending_multiplier: -0.5,
  bounce_non_offending_multiplier: 0.5,
  screen_clear_opacity: 0.5,
  screen_clear_opacity_dragging: 0.5,
  drag_selection_radius: 100
};

var firm_crystal_config_003 = {
  attraction_scalar: 0.0004,
  repulsion_scalar: -0.021, 
  drag_multiplier: 0.95,
  gravity_strength: 0.1,
  interaction_cutoff_in_equilibriums: 2.0,
  draw_force_lines: false,
  force_lines_color: "#CCC",
  bounce_offending_multiplier: -0.5,
  bounce_non_offending_multiplier: 1.0,
  screen_clear_opacity: 0.5,
  point_shooting_scalar: 0.3,
  drag_selection_radius: 80,
  new_point_equilibrium_distance: 40.0,
  new_point_radius: 3,
  new_point_color: "random"
};

var sinister_spheres_config_000 = {
  attraction_scalar: 0.0015,
  repulsion_scalar: -0.001, 
  drag_multiplier: 0.95,
  gravity_strength: 0.1,
  interaction_cutoff_in_equilibriums: 2.0,
  new_point_equilibrium_distance: 50.0,
  new_point_radius: 2,
  point_shooting_scalar: 0.3,
  draw_force_lines: false,
  bounce_offending_multiplier: -0.5,
  bounce_non_offending_multiplier: 1,
  screen_clear_opacity: 0.5,
  screen_clear_opacity_dragging: 0.5,
  drag_selection_radius: 100
};

var polyhedra_config_000 = {
  attraction_scalar: 0.0001,
  repulsion_scalar: -0.0001, 
  drag_multiplier: 0.98,
  gravity_strength: 0.0,
  interaction_cutoff_in_equilibriums: 2.0,
  new_point_equilibrium_distance: 50.0,
  new_point_radius: 5,
  point_shooting_scalar: 0.3,
  draw_force_lines: true,
  bounce_offending_multiplier: -0.5,
  bounce_non_offending_multiplier: 0.9,
  screen_clear_opacity: 0.5,
  screen_clear_opacity_dragging: 0.5,
  drag_selection_radius: 100
};

var billiard_ball_config_000 = {
  attraction_scalar: 0,
  repulsion_scalar: -0.01, 
  drag_multiplier: 0.98,
  gravity_strength: 0.1,
  interaction_cutoff_in_equilibriums: 1,
  new_point_equilibrium_distance: 60,
  new_point_radius: 30,
  point_shooting_scalar: 0.3,
  draw_force_lines: false,
  bounce_offending_multiplier: -0.9,
  bounce_non_offending_multiplier: 0.9,
  screen_clear_opacity: 0.5,
  screen_clear_opacity_dragging: 0.1,
  drag_selection_radius: 100
};

// Define event listeners
var handle_mouse_up = function(event) { 
  if (mouse_pressed) {
    canvas.style.cursor = "crosshair";
    mouse_pressed = false;
    if (shift_pressed) {
      canvas.style.cursor = "crosshair";
      world.add_point(new Point(new Vector(drag_origin_x, drag_origin_y), 
                                (new Vector(event.pageX - x_offset, event.pageY - y_offset)).subtract(new Vector(drag_origin_x, drag_origin_y)).scale(sim_config.point_shooting_scalar), 
                                choose_point_color(), sim_config.new_point_radius, sim_config.new_point_equilibrium_distance));
    }
    //shift_pressed = false; // Reset shift key no matter what if mouse came up
  }
};
var handle_mouse_down = function(event) {
  mouse_pressed = true;
  current_mouse_x = drag_origin_x = event.pageX - x_offset;
  current_mouse_y = drag_origin_y = event.pageY - y_offset;
  points_to_drag = [];
  if (shift_pressed) {
    canvas.style.cursor = "pointer"; 
  } else {
    canvas.style.cursor = "move";
    ticks_since_drag_start = 0;
    for (var i=0; i < world.points.length; i++) {
      var point = world.points[i];
      if (point.position.subtract(new Vector(current_mouse_x, current_mouse_y)).magnitude() < sim_config.drag_selection_radius) points_to_drag.push(point);
    }
  }
  event.preventDefault();
};
var handle_key_down = function(event) {
  if (event.keyCode == 16) {
    shift_pressed = true;
    canvas.style.cursor = "pointer";
  }
};
var handle_key_up = function(event) {
  if (event.keyCode == 16) {
    canvas.style.cursor = "crosshair";
    shift_pressed = false;
  }
};
var handle_mouse_move = function(event) {
  current_mouse_x = event.clientX - x_offset;
  current_mouse_y = event.clientY - y_offset;
};
var handle_mouse_out = function(event) {
  shift_pressed = false;
  mouse_pressed = false;
  canvas.style.cursor = "crosshair";
};
var handle_mouse_over = function(event) {
  //shift_pressed = false;
  //mouse_pressed = false;
  //canvas.style.cursor = "crosshair";
  $(this).focus();
};

var quick_populate = function(n) {
  for (var i=0; i < n; i++) {
    world.add_point(new Point(new Vector(Math.random() * width, Math.random() * height), 
                                new Vector(0, 0), 
                                choose_point_color(), sim_config.new_point_radius, sim_config.new_point_equilibrium_distance));
  }
};

var populate_controls = function(controls_element, sim_config) {

  function prepare_control_name(s) {
    return _.string.capitalize(s.replace(/_/g, " "));
  };

  function animateSubmit(element) {
    var $el = $(element);
    $el.css("backgroundColor", "#0F0");
    $el.animate({
      backgroundColor: "#FFF"
    });
  };

  _.each(sim_config, function(v, k) {

    var controlElement = $(
      "<div class='control-wrapper'>" + 
        "<form>" +
          "<span class='control-name'>" + 
            prepare_control_name(k) +
          "</span> " + 
          "<input type='text' class='control-input-text' value='" + v + "'>" + 
        "</form>" + 
      "</div>"
    );

    controlElement.bind("submit", 
      (function(property_name) {
        return function(e) {
          var value = $(this).find("input").first().val();
          e.preventDefault();
          if (!value) return;
          var type_of = typeof sim_config[property_name];
          animateSubmit(this);
          if (type_of == "string") {
            sim_config[property_name] = value;
          } else if (type_of == "boolean") {
            sim_config[property_name] = (value.toLowerCase() == "true" || value == "1" || value.toLowerCase() == "yes");
          } else if (type_of == "number") {
            sim_config[property_name] = parseFloat(value); 
          }
        };
      })(k)
    );

    controlElement.find("input").bind("blur", 
      (function(property_name) {
        return function(e) {
          var value = $(this).val();
          e.preventDefault();
          if (!value) return;
          var type_of = typeof sim_config[property_name];
          animateSubmit(this);
          if (type_of == "string") {
            sim_config[property_name] = value;
          } else if (type_of == "boolean") {
            sim_config[property_name] = (value.toLowerCase() == "true" || value == "1" || value.toLowerCase() == "yes");
          } else if (type_of == "number") {
            sim_config[property_name] = parseFloat(value); 
          }
        };
      })(k)
    );

    controls_element.append(controlElement);

  });

  controls_element.append(
    $(
      "<div class='control-wrapper'>" + 
        "<form>" + 
          "<span class='control-name control-name-special'>Create particles</span>" + 
          "<input type='text' value='20' class='control-input-text' style='display: inline;'>" + 
          "<input type='submit' class='control-input-button' value='Create' style='display: inline;'>" + 
        "</form>" + 
      "</div>"
    ).submit(function(e) {
      animateSubmit(this);
      var number = parseInt($(this).find(".control-input-text").first().val());
      quick_populate(number);
      e.preventDefault();
    })
  );

  controls_element.append(
    $(
      "<div class='control-wrapper'>" + 
        "<form>" + 
          "<span class='control-name control-name-special'>Destroy all particles</span>" + 
          "<input type='submit' class='control-input-button' value='Reset' style='display: inline;'>" + 
        "</form>" + 
      "</div>"
    ).submit(function(e) {
      animateSubmit(this);
      world.points = [];
      e.preventDefault();
    })
  );

  controls_element.append(
    $(
      "<div class='control-wrapper instructions-cell'>" + 
        "<span>Click and drag to move points. Hold shift and drag to create points. Press enter after editing a field.</span>" + 
      "</div>"
    )
  );

};

var sim_config = firm_crystal_config_003;

populate_controls($("#simulation-controls"), sim_config);

// Calculate handy values based on windows size
var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

// Height of the canvas and world
var width = x * 0.95; // Make sure to keep this synced up with the css
//var height = y * 0.65;
var height = y - $("#simulation-controls").height() - 15;

// Canvas and context
var canvas = document.getElementById("simulation-canvas");
var context = canvas.getContext("2d");

// Give the canvas focus
canvas.focus();

// Offsets based on canvas position in page
var canvas_offset = get_offset(canvas);
var x_offset = canvas_offset.left;
var y_offset = canvas_offset.top;

// Used as temporary variables to hold origin of a drag motion
var current_mouse_x = 0;
var current_mouse_y = 0;

var drag_origin_x = 0;
var drag_origin_y = 0;

// Toggles to hold state of shift and mouse
var shift_pressed = false;
var mouse_pressed = false;

var ticks_since_drag_start = 0;

var points_to_drag = [];

// Initialize canvas object size based on above defined heights
canvas.width = width;
canvas.height = height;

// Create world with above defined heights
var world = new World(width, height);

// Assign event listeners
canvas.addEventListener("mouseup", handle_mouse_up, false);
canvas.addEventListener("mousedown", handle_mouse_down, false);
canvas.addEventListener("keyup", handle_key_up, false);
canvas.addEventListener("keydown", handle_key_down, false);
canvas.addEventListener("mousemove", handle_mouse_move, false);
canvas.addEventListener("mouseout", handle_mouse_out, false);
canvas.addEventListener("mouseover", handle_mouse_over, false);

// Initially fill the screen with a color to prevent trails problem we were experiencing
context.fillStyle = "green";
context.fillRect(0, 0, context.canvas.width, context.canvas.height);

quick_populate(50);

// Start the main game loop
window.setInterval(function() {
  //console.log(i++);
  render_world(world, context);
  world.tick(1.0);
}, 0);


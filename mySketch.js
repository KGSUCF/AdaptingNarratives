// Modified from Daniel Shifman - codingtra.in
// Starter Option One: Particles
//Things to try:
// - Change the words - try phrases for more narrative / poetics!
// - Change the colors - try the background, and the words!
// - Change the font and size of the words
// - Change the particle system - try changing the starting points
// - Change the movement - try playing with the alpha and direction

particles = [];
//Just like with Tracery, put anything you want in the ""s
words = ["down", "plume", "quill", "contour", "semiplume", "filoplume", "bristle", "flight", "covert", "barb", "vane", "wisp"]

// Game state: "title" or "playing"
let gameState = "title";
// Feather intensity control
let rainAmount = 3;
let rainTarget = 3;
let rainTimer = 0;
// Cupid direction tracking
let prevMouseX = 0;
let facingRight = true;

function setup() {
	//This creates a canvas the size of the screen
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
}

function draw() {
  //Replace this with any background color you choose
  //Or you could load an image or try a gradient!
  background("#1D075D");

  if (gameState === "title") {
    drawTitleScreen();
    return;
  }

  // Update feather intensity over time
  updateRainIntensity();

  //This creates the particles - feather amount varies over time
  for (let i = 0; i < round(rainAmount); i++) {
    let p = new Particle();
    particles.push(p);
  }
  //This moves the particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].finished()) {
      // remove this particle
      particles.splice(i, 1);
    }
  }

  // Update facing direction based on horizontal mouse movement
  if (mouseX > prevMouseX + 2) facingRight = true;
  else if (mouseX < prevMouseX - 2) facingRight = false;
  prevMouseX = mouseX;

  // Draw Cupid following the mouse
  drawCupid(mouseX, mouseY);
}

function drawTitleScreen() {
  // Title text
  noStroke();
  fill(255, 255, 180);
  textSize(72);
  text("Breathing", windowWidth / 2, windowHeight / 2 - 30);

  // Subtitle prompt
  fill(255, 255, 255, 150);
  textSize(20);
  text("click to begin", windowWidth / 2, windowHeight / 2 + 40);

  // Small preview on the title screen
  for (let i = 0; i < 1; i++) {
    let p = new Particle();
    particles.push(p);
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].finished()) {
      particles.splice(i, 1);
    }
  }
}

function mousePressed() {
  if (gameState === "title") {
    gameState = "playing";
    particles = [];
  }
}

function updateRainIntensity() {
  // Periodically pick a new target feather amount
  rainTimer--;
  if (rainTimer <= 0) {
    // Sometimes light, sometimes heavy
    rainTarget = random(1, 10);
    // Hold this intensity for 2-8 seconds (at 60fps)
    rainTimer = random(120, 480);
  }
  // Smoothly ease toward the target
  rainAmount += (rainTarget - rainAmount) * 0.02;
}

function drawCupid(cx, cy) {
  push();
  translate(cx, cy);

  // Flip to face the direction of movement
  if (!facingRight) scale(-1, 1);

  // Scale up
  scale(1.5);

  // === WING (on the back — drawn first so body covers the root) ===
  fill(215, 235, 255, 210);
  stroke(190, 215, 255, 160);
  strokeWeight(1);
  beginShape();
  vertex(-8, 2);
  bezierVertex(-26, -44, -68, -20, -50, 14);
  bezierVertex(-32, 36, -10, 16, -8, 2);
  endShape(CLOSE);
  // Wing shimmer
  fill(255, 255, 255, 75);
  noStroke();
  beginShape();
  vertex(-10, 2);
  bezierVertex(-20, -30, -48, -14, -36, 8);
  bezierVertex(-24, 20, -12, 10, -10, 2);
  endShape(CLOSE);

  noStroke();

  // === BODY (side profile — chubby baby torso) ===
  fill(255, 205, 165);
  ellipse(-2, 18, 28, 38);
  // Belly bump (front/right side)
  ellipse(7, 22, 16, 14);

  // === HEAD (side profile, facing right) ===
  fill(255, 210, 170);
  ellipse(5, -14, 33, 31);

  // === HAIR (curly, on top and back of head) ===
  fill(225, 175, 65);
  ellipse(-5, -30, 16, 14);
  ellipse(3, -32, 16, 14);
  ellipse(11, -30, 14, 13);
  ellipse(-13, -20, 13, 12);

  // Ear (small profile ear)
  fill(245, 190, 155);
  ellipse(-4, -13, 8, 9);

  // === FACE FEATURES (profile, blowing expression) ===
  // HUGE puffed cheek — very prominent, blowing hard
  fill(255, 170, 148);
  ellipse(24, -4, 40, 30);

  // Nose bump
  fill(240, 180, 145);
  ellipse(22, -14, 10, 8);

  // Mouth — tight 'O' at the tip of the cheek puff
  fill(200, 85, 90);
  ellipse(25, -1, 10, 9);
  fill(150, 50, 60);
  ellipse(25, -1, 5, 5);

  // Eye (closed from effort of blowing)
  stroke(100, 55, 20);
  strokeWeight(1.5);
  noFill();
  arc(15, -19, 10, 6, PI + 0.2, TWO_PI - 0.2);

  // Eyebrow (raised with effort)
  arc(15, -24, 14, 6, PI + 0.5, TWO_PI - 0.5);
  noStroke();

  // === ARMS ===
  fill(255, 205, 165);
  // Forward arm extending toward bow
  ellipse(13, 4, 12, 20);
  ellipse(21, 2, 10, 16);
  // Back arm (drawing string, near cheek)
  fill(245, 195, 158);
  ellipse(8, -3, 9, 16);

  // === LEGS ===
  fill(255, 205, 165);
  ellipse(-5, 38, 14, 16);
  ellipse(5, 40, 12, 15);

  // === BOW (in FRONT — drawn on top of body) ===
  // D-shape bow: curve faces forward (right), opening faces back (toward Cupid).
  // arc(x, y, w, h, -HALF_PI, HALF_PI) draws the right semicircle.
  // Endpoints: top (32, -24) and bottom (32, 34). Rightmost tip: (51, 5).
  stroke(155, 98, 28);
  strokeWeight(2.5);
  noFill();
  arc(32, 5, 38, 58, -HALF_PI, HALF_PI);

  // Bowstring — connects the two arc endpoints on the left (Cupid's) side
  stroke(225, 205, 160);
  strokeWeight(1);
  line(32, -24, 32, 34);

  // === ARROW (nock near string, tip pointing forward/right) ===
  // Shaft runs from behind the string (nock end) to beyond the bow (tip end).
  stroke(155, 98, 28);
  strokeWeight(1.5);
  line(24, 5, 64, 5);

  // Arrowhead at the tip (rightmost, pointing forward)
  noStroke();
  fill(185, 195, 225);
  triangle(64, 5, 54, 0, 54, 10);

  // Fletching at the nock end (left of string)
  fill(245, 215, 80);
  triangle(24, 5, 14, -1, 23, 4);
  triangle(24, 5, 14, 11, 23, 6);

  // === AIR PUFFS from mouth (blowing forward) ===
  fill(255, 255, 255, 130);
  ellipse(40, -2, 13, 13);
  fill(255, 255, 255, 95);
  ellipse(52, -6, 10, 10);
  fill(255, 255, 255, 62);
  ellipse(62, -10, 8, 8);
  fill(255, 255, 255, 35);
  ellipse(70, -14, 6, 6);

  pop();
}

class Particle {
  constructor() {
		//This sets the x value to anywhere - try using a static value
    this.x = random (0, windowWidth);
		//This keeps the y fixed - try reversing it using windowHeight
    this.y = (0);
		//This sets the range of x movement - try limiting it to + or -
    this.vx = random(-1, 1);
		//This sets the range of y movement - try reversing it
    this.vy = random(5, 1);
		//This sets the range of color - this is what keeps us in yellows
		//Try using it for all three to create a broader range of color
		//Or try changing the scale to use the full 0-255
		this.color = random(100,230);
		//This sets the starting alpha so it starts bright and fades
		//Try reversing it! you can start at 0, add 1, and stop at 255
    this.alpha = 255;
		//This picks a random word for each particle
		this.text = random(words);
		// Starting rotation angle and spin speed — makes feathers twist and turn
		this.angle = random(TWO_PI);
		this.angleVelocity = random(-0.04, 0.04);
  }

  finished() {
		//Change this to 255 if you reverse the fade
    return this.alpha < 0;
  }

  update() {
    // Cupid repulsion - feathers are blown away from Cupid
    let dx = this.x - mouseX;
    let dy = this.y - mouseY;
    let distance = sqrt(dx * dx + dy * dy);
    let radius = 160;
    if (distance < radius && distance > 0) {
      let force = (radius - distance) / radius;
      this.vx += (dx / distance) * force * 4;
      this.vy += (dy / distance) * force * 4;
    }

    this.x += this.vx;
    this.y += this.vy;
		//Change this to +1 if you reverse the fade
    this.alpha -= 1;
		// Spin the feather as it drifts
		this.angle += this.angleVelocity;
  }

  show() {
    noStroke();
		//You can also add the outline
    //stroke(255);
		//This keeps R and G values at 255 to allow for yellows
		//Try changing it!
    fill(255,255,this.color, this.alpha);
		// Rotate each feather word around its own center as it falls
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    text(this.text, 0, 0);
    pop();
  }
}

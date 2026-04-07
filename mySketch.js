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

  // Halo
  noFill();
  stroke(255, 230, 100, 200);
  strokeWeight(3);
  ellipse(0, -46, 30, 10);

  noStroke();

  // Wings (behind body)
  // Left wing
  fill(210, 230, 255, 190);
  beginShape();
  vertex(-2, -5);
  bezierVertex(-30, -48, -80, -28, -58, 14);
  bezierVertex(-38, 38, -8, 18, -2, -5);
  endShape(CLOSE);

  // Right wing
  beginShape();
  vertex(2, -5);
  bezierVertex(30, -48, 80, -28, 58, 14);
  bezierVertex(38, 38, 8, 18, 2, -5);
  endShape(CLOSE);

  // Wing shimmer highlights
  fill(255, 255, 255, 70);
  beginShape();
  vertex(-4, -5);
  bezierVertex(-18, -36, -54, -20, -38, 6);
  bezierVertex(-24, 22, -8, 10, -4, -5);
  endShape(CLOSE);
  beginShape();
  vertex(4, -5);
  bezierVertex(18, -36, 54, -20, 38, 6);
  bezierVertex(24, 22, 8, 10, 4, -5);
  endShape(CLOSE);

  // Body (chubby cherub torso)
  fill(255, 205, 170);
  ellipse(0, 22, 34, 40);

  // Head
  ellipse(0, -10, 36, 36);

  // Curly hair
  fill(225, 175, 70);
  for (let i = -2; i <= 2; i++) {
    ellipse(i * 6, -29, 14, 13);
  }
  ellipse(-19, -16, 11, 11);
  ellipse(19, -16, 11, 11);

  // Eyes closed (blowing expression)
  stroke(80, 40, 20);
  strokeWeight(1.5);
  noFill();
  arc(-9, -12, 9, 6, PI, TWO_PI);
  arc(9, -12, 9, 6, PI, TWO_PI);
  noStroke();

  // Puffed cheeks
  fill(255, 165, 155, 190);
  ellipse(-13, -4, 16, 13);
  ellipse(13, -4, 16, 13);

  // Mouth open in an 'O', blowing
  fill(200, 85, 90);
  ellipse(0, -2, 8, 7);
  // Inner mouth
  fill(140, 50, 60);
  ellipse(0, -2, 4, 4);

  // Air puffs drifting upward from the mouth
  fill(255, 255, 255, 110);
  ellipse(1, -16, 6, 6);
  fill(255, 255, 255, 75);
  ellipse(-2, -24, 5, 5);
  fill(255, 255, 255, 45);
  ellipse(2, -31, 4, 4);

  // Little arms reaching outward
  fill(255, 205, 170);
  // Left arm
  ellipse(-20, 14, 11, 22);
  // Right arm
  ellipse(20, 14, 11, 22);

  // Chubby legs/feet peeking below body
  ellipse(-9, 41, 13, 15);
  ellipse(9, 41, 13, 15);

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
    let radius = 100;
    if (distance < radius && distance > 0) {
      let force = (radius - distance) / radius;
      this.vx += (dx / distance) * force * 2;
      this.vy += (dy / distance) * force * 2;
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

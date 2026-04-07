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
words = ["fall","drop","fly","break","rise","see","hear","move","shift","rotate","wait"]

// Game state: "title" or "playing"
let gameState = "title";
// Rain intensity control
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

  // Update rain intensity over time
  updateRainIntensity();

  //This creates the particles - rain amount varies over time
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

  // Draw umbrella following the mouse
  drawUmbrella(mouseX, mouseY);
}

function drawTitleScreen() {
  // Title text
  noStroke();
  fill(255, 255, 180);
  textSize(72);
  text("Falling", windowWidth / 2, windowHeight / 2 - 30);

  // Subtitle prompt
  fill(255, 255, 255, 150);
  textSize(20);
  text("click to begin", windowWidth / 2, windowHeight / 2 + 40);

  // Small preview rain on the title screen
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
  // Periodically pick a new target rain amount
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

function drawUmbrella(ux, uy) {
  push();
  translate(ux, uy);

  // Umbrella canopy - arc shape
  fill(200, 80, 120);
  noStroke();
  arc(0, -10, 120, 80, PI, TWO_PI);

  // Scalloped edge along the bottom of the canopy
  fill("#1D075D");
  let scallops = 5;
  let sWidth = 120 / scallops;
  for (let i = 0; i < scallops; i++) {
    let sx = -60 + sWidth * i + sWidth / 2;
    arc(sx, -10, sWidth, 20, 0, PI);
  }

  // Handle - straight stick
  stroke(200, 180, 140);
  strokeWeight(3);
  noFill();
  line(0, -10, 0, 40);

  // Handle hook
  arc(8, 40, 16, 16, 0, PI);

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
  }

  finished() {
		//Change this to 255 if you reverse the fade
    return this.alpha < 0;
  }

  update() {
    // Mouse repulsion - particles deflect away from cursor
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
  }

  show() {
    noStroke();
		//You can also add the outline
    //stroke(255);
		//This keeps R and G values at 255 to allow for yellows
		//Try changing it!
    fill(255,255,this.color, this.alpha);
		//This positions the text
    text(this.text, this.x, this.y);
  }
}

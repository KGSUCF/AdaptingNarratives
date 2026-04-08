let simplex;
let simplexB;
let palette;

let xStep = 5; // Smaller step for smoother foam
let xFreq = 0.002;
let yFreq = 0.005;

let xStepB = 11; // Smaller step for smoother foam
let xFreqB = 0.008;
let yFreqB = 0.008;

let amplitude = 60;
let amplitudeB = 20;
let velocity = 0.01;
let velocityB = 0.01;
let waveCount = 3; 

const squareLife = 300;

const fireSquares = [];

function setup() {
    createCanvas(800, 600);
    simplex = new SimplexNoise();
	simplexB = new SimplexNoise();
	palette = ["#1a3657", "#82b0b2", "#346b84"];
  
	fireSquareWidth = width * 0.01;
  fireSquareHeight = height * 0.01;
  fireWidth = width * 0.2;
}

function draw() {
    background(240, 230, 210);
	 drawCloud();
	drawCloud2();
    drawFuji();
	drawBigWave();
	 let seaLevel = height * 0.6; 
    let yStep = (height / 2) / waveCount; 

    for (let y = 0; y < waveCount; y++) { // Changed to index-based loop
        let yOffset = y * yStep;
        push();
        translate(0, seaLevel + yOffset);

        // --- 1. CONSISTENT COLORING ---
        // Pick two colors based on the wave index 'y' so they don't change
        let colorA = palette[y % palette.length];
        let colorB = palette[(y + 1) % palette.length];
		  let colorC = palette[(y + 2) % palette.length];

        let gradient = drawingContext.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, colorA);
        gradient.addColorStop(0.5, colorB);
		  gradient.addColorStop(1, colorC);
        drawingContext.fillStyle = gradient;
        
        stroke(255, 255, 255, 150);
        strokeWeight(8);

        beginShape();
        vertex(0, height); 
        for (let x = 0; x <= width; x += xStep) {
            let n = simplex.noise3D(x * xFreq, yOffset * yFreq, frameCount * velocity);
            vertex(x, n * amplitude);
        }
        vertex(width, height);
        endShape(CLOSE);

        // --- 3. STABLE FOAM ---
        noStroke(); 
        fill(255, 255, 255, 180);
        for (let x = 0; x <= width; x += xStep) {
            let n = simplex.noise3D(x * xFreq, yOffset * yFreq, frameCount * velocity);
            if (n < -0.0) { 
                // Use noise to determine size so it doesn't flicker
                // map(n, min, max, targetMin, targetMax)
                let foamSize = map(n, -1, -0.2, 55, 2); 
                ellipse(x, n * amplitude, foamSize);
            }
        }
        pop();
	}
    // 2. DRAW THE BOAT
    let boatX = width * 0.6;
    // IMPORTANT: The boat needs the exact same noise as the TOP wave (where y=0)
    let boatNoise = simplex.noise3D(boatX * xFreq, 0, frameCount * velocity) * amplitude;
    let boatY = seaLevel + boatNoise;


	 if(random(1) < 0.75){
    // Use randomGaussian() to create a normal distribution, making the fire denser in the center
    const x = randomGaussian(width / 2, fireWidth);
    // Add a new FireSquare object to the array at the base of the fire
    fireSquares.push(new FireSquare(x, height * 0.99));
  }
  
  // Loop through the fireSquares array backwards to safely remove elements
  for(let i = fireSquares.length - 1; i >= 0; i--) {
    const fireSquare = fireSquares[i];
    // Call the draw method for each fire square to update its position and appearance
    fireSquare.draw();
    
    // Check if the fire square has risen off the screen or its "life" has expired
    if(fireSquare.y < fireSquareHeight || fireSquare.life < 0){
      // Remove the fire square from the array
      fireSquares.splice(i, 1);
    }
  }

	
    drawBoat(boatX, boatY);
	
	
}

function drawBoat(x, y) {
    push();
    translate(x, y);
    // Slight rocking motion based on the noise
    rotate(sin(frameCount * 0.05) * 0.1); 
    
    noStroke();
	 fill(150, 80, 20); // Dark wood color
    // Simple boat hull
    arc(0, -5, 180, 50, 0, PI, CHORD); 
    pop();
}

function drawFuji() {
    push();

        noStroke();
	
	fill(63,109,195)
	quad(580, 180, 620, 180, 800, 400, 400, 400);
	
	fill(255,255,255)
	quad(580, 180, 620, 180, 660, 230, 540, 230);
    pop();
	
}

function drawBigWave() {
    push();
	
fill(20, 40, 80);
beginShape();
	for (let x = 0; x <= width; x += xStep) {
		let noise = simplex.noise2D(x * xFreq, frameCount * velocity) * amplitude;
		vertex(x, height / 2 + noise);
	}
	vertex(width, height);
	vertex(0, height);
	endShape(CLOSE);
    pop();
}

function drawCloud() {
    push();
    // 1. Position where the "wobble" happens
    let cloudBaseY = height * 0.35; 
    
    fill(255, 255, 255, 150); // Slightly more solid for a "huge" feel
    noStroke();

    beginShape();
    // Use your preferred noise settings
    let hugeAmplitude = 8; // Increased slightly for more visible "fluff"
    let softFreq = 0.012; 

    // Start by pinning the shape to the top-left corner
    vertex(-100, 0);

    // Draw the wobbly bottom edge
    for (let x = -100; x <= width + 100; x += xStepB) {
        let n = simplexB.noise2D(x * softFreq, frameCount * 0.002);
        let yOffset = n * hugeAmplitude;
        vertex(x, cloudBaseY + yOffset);
    }
    
    // 2. INVERSION: Instead of closing upwards, we close to the top corners
    // This ensures the white fill covers everything from the wobble to the top of the canvas
    vertex(width + 100, 0); 
    vertex(-100, 0);
    endShape(CLOSE);
    pop();
}

function drawCloud2() {
    push();
    // 1. Position where the "wobble" happens
    let cloudBaseY = height * 0.15; 
    
    fill(255, 255, 255, 150); // Slightly more solid for a "huge" feel
    noStroke();

    beginShape();
    // Use your preferred noise settings
    let hugeAmplitude = 8; // Increased slightly for more visible "fluff"
    let softFreq = 0.012; 

    // Start by pinning the shape to the top-left corner
    vertex(-100, 0);

    // Draw the wobbly bottom edge
    for (let x = -100; x <= width + 100; x += xStepB) {
        let n = simplexB.noise2D(x * softFreq, frameCount * 0.002);
        let yOffset = n * hugeAmplitude;
        vertex(x, cloudBaseY + yOffset);
    }
    
    // 2. INVERSION: Instead of closing upwards, we close to the top corners
    // This ensures the white fill covers everything from the wobble to the top of the canvas
    vertex(width + 100, 0); 
    vertex(-100, 0);
    endShape(CLOSE);
    pop();
}

class FireSquare {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    
    // STORM PHYSICS
    this.vx = random(-1, 2);          // Strong horizontal "wind" speed
    this.vy = random(-2, -2);       // Upward lift from the wind
    this.gravity = 0.01;            // Slight gravity to make them arc
    
    this.life = random(100, 200);   // Shorter life for high-energy spray
    this.initialLife = this.life;
    this.size = random(2, 6);       // Tiny droplets
    
    // Turbulent wobble
    this.noiseOffset = random(1000);
  }
  
  draw() {
    // 1. ADD TURBULENCE: Use noise to make them swirl slightly
    let turbulence = (simplex.noise2D(this.x * 0.01, this.y * 0.01) - 0.5) * 2;
    
    // 2. APPLY VELOCITY: Move sideways and slightly up/down
    this.x += this.vx;
    this.y += this.vy + turbulence;
    this.vy += this.gravity; // Gravity eventually pulls the spray back down
    
    this.life--;

    // 3. VISUALS
    const alpha = map(this.life, 0, this.initialLife, 0, 200);
    fill(255, 255, 255, alpha);
    noStroke();
    
    // Draw as tiny droplets
    ellipse(this.x, this.y, this.size);
  }
}

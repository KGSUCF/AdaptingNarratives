// Haiku Duel — a p5.js game
// Grammar ported from hai-kooky by kstrouse

// ── Grammar ──────────────────────────────────────────────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const rules = {
  origin: ["#line1#|#line2#|#line3#"],
  line1: ["#adj2# #color1# #flower2#"],
  line2: ["#verb2# #adv2# #prep1# #article1# #noun1#"],
  line3: ["#adj3# #bird2#"],
  adj2: ["silent","gentle","purple","silver","golden","restless","ancient","fragile","quiet","tender",
         "lonely","hollow","bitter","misty","dusty","amber","frozen","broken","sullen","faded",
         "velvet","mossy","humid","dreaming","sunlit","glowing","heavy","tangled","crimson","somber"],
  color1: ["red","blue","pink","white","black","gold","tan","gray",
           "green","brown","beige","rust","teal","cream","sage","blush","slate","bone","jade","mauve"],
  flower2: ["roses","tulips","lilies","irises","poppies","lotuses","orchids","peonies","daffodils","pansies",
            "asters","foxgloves","thistles","clover","lupins"],
  verb2: ["wander","follow","glisten","flutter","drifting","dance","settle","hover","tremble","rustle",
          "whisper","stumble","shimmer","linger","scatter"],
  adv2: ["slowly","softly","brightly","sweetly","calmly","warmly","boldly","lightly",
         "gently","deeply","wildly","dimly","keenly","freely","sharply"],
  prep1: ["through","past","near","by","from","toward","round"],
  article1: ["a","the"],
  noun1: ["pond","tree","stone","breeze","leaf","path","cloud","field",
          "stream","hill","bridge","moss","wave","door","shore"],
  adj3: ["melodious","mysterious","luminous","delicate","beautiful","radiant","colorful","harmonious",
         "silvery","sorrowful","wandering","thunderous"],
  bird2: ["robin","sparrow","bluejay","heron","falcon","parrot","raven","swallow","thrush","pigeon",
          "starling","warbler","magpie","puffin","osprey","plover","kestrel","curlew","lapwing","ibis"]
};

function flatten(text) {
  return text.replace(/#(\w+)#/g, (_, key) => {
    const val = rules[key];
    if (!val) return '(' + key + ')';
    return flatten(pick(val));
  });
}

function generateHaiku() {
  const raw = flatten(pick(rules.origin));
  return raw.split('|');
}

// ── State ─────────────────────────────────────────────────────────────────────
let gameState = "title";
let leftLines, rightLines;
let winnerSide = null;  // "left" | "right"
let leftWins = 0;
let rightWins = 0;
let round = 0;
const MAX_ROUNDS = 10;

let votedTimer = 0;
const VOTED_DURATION = 100; // frames before next round loads

let particles = [];

// Panel layout — computed in setup/windowResized
let panelW, panelH, panelY, leftX, rightX, vsX;

// ── p5 setup ──────────────────────────────────────────────────────────────────
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  computeLayout();
  leftLines = generateHaiku();
  rightLines = generateHaiku();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  computeLayout();
}

function computeLayout() {
  panelW = min(windowWidth * 0.38, 340);
  panelH = min(windowHeight * 0.45, 280);
  panelY = (windowHeight - panelH) / 2;
  const gap = windowWidth * 0.08;
  leftX  = windowWidth / 2 - gap / 2 - panelW;
  rightX = windowWidth / 2 + gap / 2;
  vsX    = windowWidth / 2;
}

// ── Main draw loop ────────────────────────────────────────────────────────────
function draw() {
  background("#1D075D");

  if (gameState === "title")   { drawTitleScreen(); return; }
  if (gameState === "dueling") { drawDuelingScreen(); }
  if (gameState === "voted")   { drawVotedScreen(); }
  if (gameState === "results") { drawResultsScreen(); }

  // Particles run on top in voted state
  updateParticles();
}

// ── Title screen ──────────────────────────────────────────────────────────────
function drawTitleScreen() {
  noStroke();
  fill(255, 255, 180);
  textSize(72);
  text("HAIKU DUEL", windowWidth / 2, windowHeight / 2 - 40);

  fill(255, 255, 255, 150);
  textSize(18);
  text("two haikus enter. one haiku wins.", windowWidth / 2, windowHeight / 2 + 20);

  fill(255, 255, 255, 100 + 55 * sin(frameCount * 0.05));
  textSize(16);
  text("click to begin", windowWidth / 2, windowHeight / 2 + 60);
}

// ── Dueling screen ────────────────────────────────────────────────────────────
function drawDuelingScreen() {
  // Prompt
  noStroke();
  fill(255, 255, 200, 180);
  textSize(14);
  text("which speaks to your soul?", windowWidth / 2, panelY - 36);

  // Round counter
  fill(255, 255, 255, 120);
  textSize(13);
  text("round " + round + " / " + MAX_ROUNDS, windowWidth / 2, panelY - 14);

  const leftHover  = isInPanel(leftX, panelY, panelW, panelH);
  const rightHover = isInPanel(rightX, panelY, panelW, panelH);

  drawPanel(leftX,  panelY, panelW, panelH, leftLines,  leftHover,  "idle");
  drawPanel(rightX, panelY, panelW, panelH, rightLines, rightHover, "idle");

  // VS label
  noStroke();
  fill(255, 100, 100, 200);
  textSize(20);
  text("VS", vsX, windowHeight / 2);
}

// ── Voted screen ──────────────────────────────────────────────────────────────
function drawVotedScreen() {
  // Round counter
  noStroke();
  fill(255, 255, 255, 120);
  textSize(13);
  text("round " + round + " / " + MAX_ROUNDS, windowWidth / 2, panelY - 14);

  const leftState  = winnerSide === "left"  ? "winner" : "loser";
  const rightState = winnerSide === "right" ? "winner" : "loser";

  drawPanel(leftX,  panelY, panelW, panelH, leftLines,  false, leftState);
  drawPanel(rightX, panelY, panelW, panelH, rightLines, false, rightState);

  // Winner label above winning panel
  const winX = winnerSide === "left" ? leftX + panelW / 2 : rightX + panelW / 2;
  fill(255, 230, 80);
  textSize(16);
  text("winner!", winX, panelY - 14);

  // Count down to next round
  votedTimer--;
  if (votedTimer <= 0) {
    if (round >= MAX_ROUNDS) {
      gameState = "results";
    } else {
      nextRound();
    }
  }
}

// ── Results screen ────────────────────────────────────────────────────────────
function drawResultsScreen() {
  noStroke();
  fill(255, 255, 180);
  textSize(52);
  text("THE DUEL IS DONE", windowWidth / 2, windowHeight / 2 - 80);

  textSize(22);
  fill(200, 200, 255);
  text("Left:  " + leftWins + " win" + (leftWins !== 1 ? "s" : ""), windowWidth / 2, windowHeight / 2);
  text("Right: " + rightWins + " win" + (rightWins !== 1 ? "s" : ""), windowWidth / 2, windowHeight / 2 + 36);

  fill(255, 255, 255, 100 + 55 * sin(frameCount * 0.05));
  textSize(15);
  text("click to duel again", windowWidth / 2, windowHeight / 2 + 100);
}

// ── Panel renderer ────────────────────────────────────────────────────────────
function drawPanel(x, y, w, h, lines, isHover, state) {
  push();

  // Background fill
  let fillAlpha = 20;
  if (state === "winner") fillAlpha = 60;
  else if (state === "loser") fillAlpha = 6;
  else if (isHover) fillAlpha = 45;

  // Stroke / glow
  let strokeAlpha = 120;
  let strokeCol   = [200, 200, 100];
  if (state === "winner") { strokeAlpha = 255; strokeCol = [255, 230, 60]; }
  else if (state === "loser") { strokeAlpha = 40; }
  else if (isHover) { strokeAlpha = 200; }

  fill(255, 255, 200, fillAlpha);
  stroke(strokeCol[0], strokeCol[1], strokeCol[2], strokeAlpha);
  strokeWeight(state === "winner" ? 2.5 : 1.5);
  rect(x, y, w, h, 12);

  // Haiku text
  noStroke();
  let textAlpha = state === "loser" ? 80 : 220;
  const cx = x + w / 2;
  const cy = y + h / 2;

  textSize(18);
  fill(255, 255, 190, textAlpha);
  text(lines[0], cx, cy - 32);

  textSize(15);
  fill(255, 255, 150, textAlpha - 30);
  text(lines[1], cx, cy);

  textSize(18);
  fill(255, 255, 190, textAlpha);
  text(lines[2], cx, cy + 32);

  pop();
}

// ── Game logic ────────────────────────────────────────────────────────────────
function chooseWinner(side) {
  winnerSide = side;
  if (side === "left") leftWins++;
  else rightWins++;
  round++;

  // Spawn particle burst from winning panel center
  const winLines = side === "left" ? leftLines : rightLines;
  const ox = side === "left" ? leftX + panelW / 2 : rightX + panelW / 2;
  const oy = panelY + panelH / 2;
  const words = winLines.join(" ").split(" ");
  for (let i = 0; i < 30; i++) {
    particles.push(new Particle(ox, oy, pick(words)));
  }

  votedTimer = VOTED_DURATION;
  gameState = "voted";
}

function nextRound() {
  leftLines  = generateHaiku();
  rightLines = generateHaiku();
  winnerSide = null;
  particles  = [];
  gameState  = "dueling";
}

function resetGame() {
  leftWins  = 0;
  rightWins = 0;
  round     = 0;
  particles = [];
  winnerSide = null;
  leftLines  = generateHaiku();
  rightLines = generateHaiku();
  gameState  = "title";
}

// ── Input ─────────────────────────────────────────────────────────────────────
function mousePressed() {
  if (gameState === "title") {
    round = 0;
    leftWins = 0;
    rightWins = 0;
    leftLines  = generateHaiku();
    rightLines = generateHaiku();
    gameState  = "dueling";
    return;
  }

  if (gameState === "dueling") {
    if (isInPanel(leftX,  panelY, panelW, panelH)) chooseWinner("left");
    else if (isInPanel(rightX, panelY, panelW, panelH)) chooseWinner("right");
    return;
  }

  if (gameState === "results") {
    resetGame();
    return;
  }
}

function isInPanel(px, py, pw, ph) {
  return mouseX > px && mouseX < px + pw &&
         mouseY > py && mouseY < py + ph;
}

// ── Particles ─────────────────────────────────────────────────────────────────
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].finished()) particles.splice(i, 1);
  }
}

class Particle {
  constructor(ox, oy, word) {
    this.x = ox + random(-20, 20);
    this.y = oy + random(-20, 20);
    this.vx = random(-4, 4);
    this.vy = random(-5, 1);
    this.color = random(100, 230);
    this.alpha = 255;
    this.text = word;
    this.angle = random(TWO_PI);
    this.angleVelocity = random(-0.06, 0.06);
  }

  finished() {
    return this.alpha < 0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.08; // gentle gravity
    this.alpha -= 2;
    this.angle += this.angleVelocity;
  }

  show() {
    noStroke();
    fill(255, 255, this.color, this.alpha);
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    textSize(16);
    text(this.text, 0, 0);
    pop();
  }
}

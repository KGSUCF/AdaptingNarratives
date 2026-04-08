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
let winnerSide = null;
let leftWins = 0;
let rightWins = 0;
let round = 0;
const MAX_ROUNDS = 10;

let votedTimer = 0;
const VOTED_DURATION = 100;

let particles = [];

// Layout — computed in setup/windowResized
let signW, signH, signTopY;
let leftSignX, rightSignX, leftSignCx, rightSignCx;
let leftPoetX, rightPoetX, poetFootY, poetScale;
let vsX, vsY;

// ── p5 setup ──────────────────────────────────────────────────────────────────
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  computeLayout();
  leftLines  = generateHaiku();
  rightLines = generateHaiku();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  computeLayout();
}

function computeLayout() {
  signW    = min(windowWidth * 0.34, 420);
  signH    = min(windowHeight * 0.50, 370);
  signTopY = windowHeight * 0.18;

  leftSignX   = windowWidth * 0.12;
  rightSignX  = windowWidth * 0.88 - signW;
  leftSignCx  = leftSignX  + signW / 2;
  rightSignCx = rightSignX + signW / 2;

  leftPoetX  = windowWidth  * 0.06;
  rightPoetX = windowWidth  * 0.94;
  poetFootY  = windowHeight * 0.92;
  poetScale  = windowHeight / 700;

  vsX = windowWidth / 2;
  vsY = windowHeight / 2;
}

// ── Main draw loop ────────────────────────────────────────────────────────────
function draw() {
  background("#1D075D");

  if (gameState === "title")   { drawTitleScreen(); return; }
  if (gameState === "dueling") { drawDuelingScreen(); }
  if (gameState === "voted")   { drawVotedScreen(); }
  if (gameState === "results") { drawResultsScreen(); }

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
  noStroke();
  fill(255, 255, 200, 180);
  textSize(18);
  text("which speaks to your soul?", vsX, signTopY - 30);

  fill(255, 255, 255, 120);
  textSize(16);
  text("round " + round + " / " + MAX_ROUNDS, vsX, signTopY - 8);

  const leftHover  = isInPanel(leftSignX,  signTopY, signW, signH);
  const rightHover = isInPanel(rightSignX, signTopY, signW, signH);

  drawPoetScene("left",  leftLines,  leftHover,  "idle");
  drawPoetScene("right", rightLines, rightHover, "idle");

  noStroke();
  fill(255, 100, 100, 200);
  textSize(26);
  text("VS", vsX, vsY);
}

// ── Voted screen ──────────────────────────────────────────────────────────────
function drawVotedScreen() {
  noStroke();
  fill(255, 255, 255, 120);
  textSize(16);
  text("round " + round + " / " + MAX_ROUNDS, vsX, signTopY - 8);

  const leftState  = winnerSide === "left"  ? "winner" : "loser";
  const rightState = winnerSide === "right" ? "winner" : "loser";

  drawPoetScene("left",  leftLines,  false, leftState);
  drawPoetScene("right", rightLines, false, rightState);

  const winCx = winnerSide === "left" ? leftSignCx : rightSignCx;
  noStroke();
  fill(255, 230, 80);
  textSize(20);
  text("winner!", winCx, signTopY - 10);

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

// ── Scene: sign + arm + poet ──────────────────────────────────────────────────
function drawPoetScene(side, lines, isHover, state) {
  const isLeft     = side === "left";
  const signX      = isLeft ? leftSignX  : rightSignX;
  const poetX      = isLeft ? leftPoetX  : rightPoetX;
  const outfitR    = isLeft ? 170 : 50;
  const outfitG    = isLeft ? 45  : 75;
  const outfitB    = isLeft ? 45  : 175;
  const alpha      = state === "loser" ? 80 : 255;

  // Post position — inside sign, close to the poet's side
  const postX = isLeft ? signX + signW * 0.18 : signX + signW * 0.82;

  // 1. Wooden post from sign base to feet
  stroke(101, 67, 33, alpha);
  strokeWeight(max(9, 9 * poetScale));
  line(postX, signTopY + signH, postX, poetFootY);

  // 2. Arm: shoulder (world space) → post grip
  const shoulderX = isLeft
    ? poetX  + 32 * poetScale
    : poetX  - 32 * poetScale;
  const shoulderY = poetFootY - 228 * poetScale;
  const gripY     = signTopY  + signH * 0.72;

  stroke(240, 195, 155, alpha);
  strokeWeight(max(12, 13 * poetScale));
  line(shoulderX, shoulderY, postX, gripY);

  // Fist at grip
  noStroke();
  fill(240, 195, 155, alpha);
  ellipse(postX, gripY, max(18, 18 * poetScale), max(16, 16 * poetScale));

  // 3. Sign (drawn over post/arm base)
  drawSign(signX, lines, isHover, state);

  // 4. Poet body (on top of everything on their side)
  const bounceY = state === "winner" ? sin(frameCount * 0.22) * 5 * poetScale : 0;
  drawPoet(poetX, poetFootY + bounceY, isLeft, outfitR, outfitG, outfitB, alpha);
}

// ── Sign renderer ─────────────────────────────────────────────────────────────
function drawSign(signX, lines, isHover, state) {
  push();
  const alpha = state === "loser" ? 70 : 255;

  // Winner: gold glow layers behind sign
  if (state === "winner") {
    noStroke();
    fill(255, 215, 0, 30);
    rect(signX - 18, signTopY - 18, signW + 36, signH + 36, 16);
    fill(255, 215, 0, 18);
    rect(signX - 32, signTopY - 32, signW + 64, signH + 64, 22);
  }

  // Parchment background
  fill(253, 245, 220, alpha);

  // Border style by state
  if (state === "winner") {
    stroke(255, 215, 0, alpha); strokeWeight(6);
  } else if (isHover) {
    stroke(220, 160, 60, alpha); strokeWeight(5);
  } else if (state === "loser") {
    stroke(120, 80, 30, 70);    strokeWeight(3);
  } else {
    stroke(120, 80, 30, alpha); strokeWeight(4);
  }
  rect(signX, signTopY, signW, signH, 8);

  // Inner decorative border
  noFill();
  stroke(160, 110, 50, alpha * 0.5);
  strokeWeight(1.5);
  rect(signX + 9, signTopY + 9, signW - 18, signH - 18, 4);

  // Haiku text — dark ink on parchment
  noStroke();
  fill(40, 20, 10, state === "loser" ? 70 : 235);
  textAlign(CENTER, CENTER);

  const cx  = signX + signW / 2;
  const cy  = signTopY + signH / 2;
  const gap = signH * 0.20;
  const ts1 = max(floor(signW / 13), 22);   // lines 1 & 3
  const ts2 = max(floor(signW / 15), 20);   // line 2 (longer)

  textSize(ts1);
  text(lines[0], cx, cy - gap);
  textSize(ts2);
  text(lines[1], cx, cy);
  textSize(ts1);
  text(lines[2], cx, cy + gap);

  pop();
}

// ── Poet body renderer ────────────────────────────────────────────────────────
function drawPoet(cx, footY, facingRight, oR, oG, oB, alpha) {
  push();
  translate(cx, footY);
  if (!facingRight) scale(-1, 1);
  scale(poetScale);

  const sk  = [240, 195, 155]; // skin
  const skD = [210, 160, 120]; // skin darker (shadows)
  const hr  = [75,  48,  18];  // hair

  // ── SHOES ──
  fill(55, 36, 16, alpha); noStroke();
  rect(-26, -20, 24, 20, 5);   // back shoe
  rect(4,   -20, 24, 20, 5);   // front shoe

  // ── LEGS ──
  fill(oR, oG, oB, alpha);
  rect(-21, -138, 18, 121, 6);  // back leg
  rect(4,   -138, 18, 121, 6);  // front leg

  // ── BODY ──
  fill(oR, oG, oB, alpha);
  ellipse(0, -192, 85, 118);

  // Belt
  fill(max(oR-50,0), max(oG-50,0), max(oB-50,0), alpha);
  rect(-43, -152, 86, 16, 3);
  // Belt buckle
  fill(205, 175, 55, alpha);
  rect(-9, -152, 18, 16, 3);
  fill(160, 130, 30, alpha);
  ellipse(0, -144, 8, 8);

  // ── BACK ARM (raised fist toward opponent) ──
  fill(skD[0], skD[1], skD[2], alpha);
  // Upper arm — sweeps back and up
  push();
  translate(-32, -218);
  rotate(-0.55);
  ellipse(0, 0, 20, 58);
  pop();
  // Forearm — angled further up
  push();
  translate(-44, -258);
  rotate(-1.1);
  ellipse(0, 0, 17, 46);
  pop();
  // Fist
  fill(sk[0], sk[1], sk[2], alpha);
  ellipse(-54, -288, 24, 22);
  // Knuckle lines
  stroke(skD[0], skD[1], skD[2], alpha * 0.9);
  strokeWeight(1.2);
  line(-63, -285, -46, -281);
  line(-63, -290, -46, -286);
  noStroke();

  // ── NECK ──
  fill(sk[0], sk[1], sk[2], alpha);
  ellipse(10, -252, 26, 32);

  // ── HEAD ──
  fill(sk[0], sk[1], sk[2], alpha);
  ellipse(14, -291, 84, 76);

  // Ear
  fill(skD[0], skD[1], skD[2], alpha);
  ellipse(-23, -291, 18, 22);

  // ── HAIR ──
  fill(hr[0], hr[1], hr[2], alpha);
  ellipse(4,   -322, 62, 28);
  ellipse(16,  -326, 44, 24);
  ellipse(-6,  -318, 32, 20);
  ellipse(26,  -320, 30, 20);

  // ── FACE ──

  // Angry eyebrow — thick, sharp downslope toward nose
  stroke(hr[0], hr[1], hr[2], alpha);
  strokeWeight(6);
  line(2, -316, 42, -302);
  noStroke();

  // Eye white
  fill(255, 255, 255, alpha);
  ellipse(32, -296, 22, 15);
  // Iris
  fill(55, 32, 12, alpha);
  ellipse(37, -296, 12, 12);
  // Pupil
  fill(8, 8, 8, alpha);
  ellipse(38, -296, 7, 7);
  // Narrowed upper lid
  stroke(hr[0], hr[1], hr[2], alpha);
  strokeWeight(2.5);
  line(21, -303, 46, -294);
  noStroke();

  // Nose
  fill(skD[0], skD[1], skD[2], alpha);
  ellipse(52, -282, 15, 11);

  // Gritted teeth
  fill(238, 238, 230, alpha);
  rect(29, -276, 32, 13, 3);
  // Tooth dividers
  stroke(160, 130, 110, alpha * 0.8);
  strokeWeight(1.5);
  line(37, -276, 37, -263);
  line(45, -276, 45, -263);
  line(53, -276, 53, -263);
  noStroke();
  // Lower lip
  fill(185, 95, 85, alpha);
  ellipse(45, -261, 25, 8);

  // Anger steam lines above head
  stroke(255, 200, 50, alpha * 0.85);
  strokeWeight(3);
  line(56, -336, 64, -350);
  line(64, -330, 76, -342);
  line(46, -339, 50, -354);
  noStroke();

  pop();
}

// ── Game logic ────────────────────────────────────────────────────────────────
function chooseWinner(side) {
  winnerSide = side;
  if (side === "left") leftWins++;
  else rightWins++;
  round++;

  const ox = side === "left" ? leftSignCx : rightSignCx;
  const oy = signTopY + signH / 2;
  const winLines = side === "left" ? leftLines : rightLines;
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
  leftWins   = 0;
  rightWins  = 0;
  round      = 0;
  particles  = [];
  winnerSide = null;
  leftLines  = generateHaiku();
  rightLines = generateHaiku();
  gameState  = "title";
}

// ── Input ─────────────────────────────────────────────────────────────────────
function mousePressed() {
  if (gameState === "title") {
    round     = 0;
    leftWins  = 0;
    rightWins = 0;
    leftLines  = generateHaiku();
    rightLines = generateHaiku();
    gameState  = "dueling";
    return;
  }

  if (gameState === "dueling") {
    if      (isInPanel(leftSignX,  signTopY, signW, signH)) chooseWinner("left");
    else if (isInPanel(rightSignX, signTopY, signW, signH)) chooseWinner("right");
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

  finished() { return this.alpha < 0; }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.08;
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

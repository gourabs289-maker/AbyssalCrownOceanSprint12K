const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const hud = document.getElementById("hud");
const controls = document.getElementById("controls");
const mobileControls = document.getElementById("mobile-controls");
const fireBtnDesktop = document.getElementById("btn-fire-desktop");
const fireBtnMobile = document.getElementById("btn-fire-mobile");
const bgMusic = document.getElementById("bg-music");
const hitSound = document.getElementById("hit-sound");
const outSound = document.getElementById("out-sound");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let boat,
  enemies = [],
  waves = [],
  particles = [],
  lifelines = [],
  sparkles = [],
  bullets = [],
  plants = [],
  snakes = [],
  crocodiles = [],
  turtles = [],
  rainbows = [],
  dragonFlames = [],
  poisonClouds = [],
  crocBullets = [],
  dragonBoss = null,
  gameActive = false,
  inputMap = {};

let audioCtx,
  engineOsc,
  engineGain,
  livesCount = 3,
  scoreCount = 0,
  nextBonusScore = 10,
  lastShotTime = -9999,
  pendingShot = false,
  lastHitTime = -9999,
  sinking = false,
  sinkStartTime = 0,
  sinkMessage = "";

const GOAL_METERS = 12000;
const GOLD_ZONE_START = 10000;
const RACE_DISTANCE = GOAL_METERS * 10;
const FINAL_ZONE_TRIGGER = 10400;

const SHOT_COOLDOWN = 190;
const HIT_COOLDOWN = 700;
const ENEMIES_PER_TYPE = 42;
const EXTRA_ATTACKERS_PER_TYPE = 18;
const PLANT_COUNT = 360;
const TURTLE_COUNT = 24;
const RAINBOW_COUNT = 22;
const SNAKE_COUNT = 10;
const CROCODILE_COUNT = 8;
const MOBILE_MOVE_SPEED = 6.7;
const MOBILE_ZOOM = 1.28;

const PLANT_COLORS = ["#2ccd65", "#7d5230", "#d94852", "#9c63ff", "#ffd84d"];

const BIOME_CYCLE = [
  { top: "#00d2ff", bottom: "#3a7bd5" },
  { top: "#dfe6e9", bottom: "#636e72" },
  { top: "#ff0000", bottom: "#4b0000" },
  { top: "#ffeaa7", bottom: "#fdcb6e" },
  { top: "#2d3436", bottom: "#000000" },
  { top: "#a29bfe", bottom: "#6c5ce7" },
  { top: "#55efc4", bottom: "#00b894" },
  { top: "#e17055", bottom: "#633124" },
  { top: "#ffffff", bottom: "#b2bec3" },
  { top: "#a29bfe", bottom: "#2d3436" }
];

const ENEMY_TYPES = [
  {
    name: "brown",
    hunter: true,
    skin: { body: "#7a3b12", fin: "#4a2108", eye: "#ffd8c2" },
    pursuit: 0.12,
    maxSpeedMin: 4.6,
    maxSpeedMax: 5.6
  },
  {
    name: "red",
    hunter: false,
    skin: { body: "#ff5252", fin: "#b80000", eye: "#fff6cf" },
    pursuit: 0,
    maxSpeedMin: 1.8,
    maxSpeedMax: 2.4
  },
  {
    name: "orange",
    hunter: false,
    skin: { body: "#ff9b2f", fin: "#c85b00", eye: "#fff6cf" },
    pursuit: 0,
    maxSpeedMin: 1.8,
    maxSpeedMax: 2.4
  },
  {
    name: "blue",
    hunter: false,
    skin: { body: "#42a5ff", fin: "#0e63c8", eye: "#ffffff" },
    pursuit: 0,
    maxSpeedMin: 1.8,
    maxSpeedMax: 2.4
  },
  {
    name: "black",
    hunter: false,
    skin: { body: "#0f1116", fin: "#353a45", eye: "#ff5b5b" },
    pursuit: 0,
    maxSpeedMin: 1.8,
    maxSpeedMax: 2.4
  },
  {
    name: "pink",
    hunter: false,
    skin: { body: "#ff67ba", fin: "#d81b78", eye: "#fff6cf" },
    pursuit: 0,
    maxSpeedMin: 1.8,
    maxSpeedMax: 2.4
  },
  {
    name: "violet",
    hunter: false,
    skin: { body: "#a16bff", fin: "#6630d6", eye: "#fff6cf" },
    pursuit: 0,
    maxSpeedMin: 1.8,
    maxSpeedMax: 2.4
  },
  {
    name: "metallic",
    hunter: false,
    skin: { body: "#a6b0bc", fin: "#687381", eye: "#eaf7ff" },
    pursuit: 0,
    maxSpeedMin: 1.8,
    maxSpeedMax: 2.4
  },
  {
    name: "golden",
    hunter: false,
    skin: { body: "#ffd54a", fin: "#d29a00", eye: "#fff8d9" },
    pursuit: 0,
    maxSpeedMin: 1.8,
    maxSpeedMax: 2.4
  }
];

const EXTRA_ATTACKER_TYPES = [
  {
    name: "green-hunter",
    hunter: true,
    skin: { body: "#27d65d", fin: "#12873a", eye: "#eafff2" },
    pursuit: 0.075,
    maxSpeedMin: 3.2,
    maxSpeedMax: 4.1
  },
  {
    name: "scarlet-hunter",
    hunter: true,
    skin: { body: "#ff3f5e", fin: "#b1002b", eye: "#fff2d8" },
    pursuit: 0.08,
    maxSpeedMin: 3.3,
    maxSpeedMax: 4.2
  },
  {
    name: "cyan-hunter",
    hunter: true,
    skin: { body: "#36d6ff", fin: "#0077a2", eye: "#ffffff" },
    pursuit: 0.078,
    maxSpeedMin: 3.1,
    maxSpeedMax: 4
  },
  {
    name: "amber-hunter",
    hunter: true,
    skin: { body: "#ffb22e", fin: "#b56b00", eye: "#fff6db" },
    pursuit: 0.082,
    maxSpeedMin: 3.2,
    maxSpeedMax: 4.15
  },
  {
    name: "shadow-hunter",
    hunter: true,
    skin: { body: "#20242d", fin: "#464d5c", eye: "#ff7070" },
    pursuit: 0.085,
    maxSpeedMin: 3.4,
    maxSpeedMax: 4.35
  },
  {
    name: "violet-hunter",
    hunter: true,
    skin: { body: "#8a63ff", fin: "#4d21bd", eye: "#f6f0ff" },
    pursuit: 0.076,
    maxSpeedMin: 3.1,
    maxSpeedMax: 4
  }
];

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 900;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeAngle(angle) {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function metersToWorldY(meters) {
  return RACE_DISTANCE - meters * 10;
}

function ensureScoreDisplay() {
  let scoreEl = document.getElementById("score");
  if (!scoreEl) {
    scoreEl = document.createElement("div");
    scoreEl.id = "score";
    hud.appendChild(scoreEl);
  }
  return scoreEl;
}

function updateScoreDisplay() {
  const scoreEl = ensureScoreDisplay();
  scoreEl.innerText = `⭐ Score: ${scoreCount} / ${nextBonusScore}`;
}

function awardPoints(amount) {
  scoreCount += amount;

  while (scoreCount >= nextBonusScore) {
    livesCount++;
    updateLivesDisplay();
    spawnBurst(boat.x, boat.y, "#00ff88");
    nextBonusScore += 10;
  }

  updateScoreDisplay();
}

function startEngine() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  if (engineOsc) {
    try {
      engineOsc.stop();
    } catch (e) {}
  }

  engineOsc = audioCtx.createOscillator();
  engineGain = audioCtx.createGain();
  engineOsc.type = "sawtooth";
  engineGain.gain.value = 0;

  engineOsc.connect(engineGain);
  engineGain.connect(audioCtx.destination);
  engineOsc.start();
}

function stopAllSounds() {
  bgMusic.pause();

  if (engineGain && audioCtx) {
    engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.08);
  }
}

function playShotSound() {
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc1.type = "square";
  osc2.type = "sawtooth";

  osc1.frequency.setValueAtTime(1350, now);
  osc1.frequency.exponentialRampToValueAtTime(220, now + 0.22);

  osc2.frequency.setValueAtTime(1850, now);
  osc2.frequency.exponentialRampToValueAtTime(260, now + 0.18);

  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1850, now);
  filter.Q.value = 1.7;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.36, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.23);
  osc2.stop(now + 0.23);
}

function playSinkSound() {
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc1.type = "triangle";
  osc2.type = "sawtooth";
  lfo.type = "sine";

  osc1.frequency.setValueAtTime(240, now);
  osc1.frequency.exponentialRampToValueAtTime(46, now + 2.0);

  osc2.frequency.setValueAtTime(120, now);
  osc2.frequency.exponentialRampToValueAtTime(28, now + 2.2);

  lfo.frequency.setValueAtTime(5, now);
  lfoGain.gain.setValueAtTime(16, now);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(900, now);
  filter.frequency.exponentialRampToValueAtTime(180, now + 2.1);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

  lfo.connect(lfoGain);
  lfoGain.connect(osc1.frequency);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  lfo.start(now);
  osc1.start(now);
  osc2.start(now);

  lfo.stop(now + 2.2);
  osc1.stop(now + 2.2);
  osc2.stop(now + 2.2);
}

function spawnBurst(x, y, color) {
  for (let i = 0; i < 12; i++) {
    particles.push({
      x,
      y,
      life: 0.9,
      size: 3 + Math.random() * 4,
      type: "burst",
      color,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.5) * 7
    });
  }
}

function spawnBubbles(x, y, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 18,
      y: y + (Math.random() - 0.5) * 12,
      life: 1.2 + Math.random() * 0.6,
      size: 2 + Math.random() * 4,
      type: "bubble",
      color: "#d8f6ff",
      vx: (Math.random() - 0.5) * 1.6,
      vy: -1.8 - Math.random() * 1.8
    });
  }
}

function createBullet() {
  bullets.push({
    x: boat.x + Math.sin(boat.angle) * 28,
    y: boat.y - Math.cos(boat.angle) * 28,
    vx: Math.sin(boat.angle) * 16.5,
    vy: -Math.cos(boat.angle) * 16.5,
    life: 95,
    size: 8
  });

  particles.push({
    x: boat.x + Math.sin(boat.angle) * 18,
    y: boat.y - Math.cos(boat.angle) * 18,
    life: 0.35,
    size: 8,
    type: "muzzle",
    color: "#ffb428"
  });
}

function shootFire() {
  if (!gameActive || !boat || sinking) return false;

  const now = performance.now();
  if (now - lastShotTime < SHOT_COOLDOWN) return false;

  createBullet();
  playShotSound();
  lastShotTime = now;
  pendingShot = false;
  return true;
}

function requestFire() {
  pendingShot = true;
  shootFire();
}

function createEnemy(type) {
  return {
    typeName: type.name,
    hunter: type.hunter,
    skin: type.skin,
    x: Math.random() * canvas.width,
    y: Math.random() * (RACE_DISTANCE - 1200) + 200,
    size: 34 + Math.random() * 16,
    speedX: type.hunter
      ? (Math.random() - 0.5) * 3.2
      : (Math.random() - 0.5) * 1.4,
    speedY: type.hunter
      ? (Math.random() - 0.5) * 1.8
      : (Math.random() - 0.5) * 0.8,
    pursuit: type.pursuit,
    maxSpeed: type.maxSpeedMin + Math.random() * (type.maxSpeedMax - type.maxSpeedMin),
    seed: Math.random() * 1000
  };
}

function createPlant() {
  const height = 34 + Math.random() * 60;
  const width = 10 + Math.random() * 10;
  const ivory = Math.random() < 0.18;
  const cactus = ivory || Math.random() < 0.24;

  return {
    x: Math.random() * canvas.width,
    y: Math.random() * (RACE_DISTANCE - 300) + 160,
    height,
    width,
    color: ivory ? "#f4eed9" : PLANT_COLORS[Math.floor(Math.random() * PLANT_COLORS.length)],
    seed: Math.random() * 1000,
    armLeft: Math.random() > 0.35,
    armRight: Math.random() > 0.25,
    collisionRadius: width * 1.9,
    cactus,
    spikeColor: ivory ? "#d8c59c" : "rgba(255,255,255,0.55)"
  };
}

function createTurtle() {
  return {
    x: 70 + Math.random() * (canvas.width - 140),
    y: Math.random() * (RACE_DISTANCE - 1000) + 350,
    size: 28 + Math.random() * 10,
    points: 4,
    seed: Math.random() * 1000
  };
}

function createRainbow() {
  return {
    x: 130 + Math.random() * Math.max(180, canvas.width - 260),
    y: Math.random() * (RACE_DISTANCE - 1400) + 600,
    radius: 120 + Math.random() * 120,
    thickness: 8 + Math.random() * 3,
    seed: Math.random() * 1000
  };
}

function createSnake(options = {}) {
  const x = options.x ?? (70 + Math.random() * (canvas.width - 140));
  const y = options.y ?? (Math.random() * (RACE_DISTANCE - 1200) + 300);
  const size = options.size ?? (64 + Math.random() * 12);

  return {
    x,
    y,
    homeX: x,
    homeY: y,
    size,
    hp: 2,
    maxHp: 2,
    lastGas: -9999,
    seed: Math.random() * 1000,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 0.6,
    facing: Math.random() > 0.5 ? 1 : -1,
    gasRate: options.gasRate ?? (1300 + Math.random() * 600),
    pursuit: options.pursuit ?? 0.06
  };
}

function createCrocodile(options = {}) {
  const x = options.x ?? (90 + Math.random() * (canvas.width - 180));
  const y = options.y ?? (Math.random() * (RACE_DISTANCE - 1200) + 300);
  const size = options.size ?? (90 + Math.random() * 16);

  return {
    x,
    y,
    homeX: x,
    homeY: y,
    size,
    hp: 2,
    maxHp: 2,
    lastShot: -9999,
    seed: Math.random() * 1000,
    vx: (Math.random() - 0.5) * 0.9,
    vy: (Math.random() - 0.5) * 0.45,
    facing: Math.random() > 0.5 ? 1 : -1,
    fireRate: options.fireRate ?? (950 + Math.random() * 450),
    pursuit: options.pursuit ?? 0.05
  };
}

function createEndZoneThreats() {
  dragonBoss = {
    xRatio: 0.8,
    x: canvas.width * 0.8,
    baseY: metersToWorldY(11530),
    y: metersToWorldY(11530),
    facing: -1,
    width: 280,
    height: 160,
    hp: 20,
    maxHp: 20,
    dead: false,
    lastBurst: -9999,
    breathUntil: 0,
    lastFlame: -9999,
    seed: Math.random() * 1000
  };

  snakes.push(createSnake({ x: canvas.width * 0.16, y: metersToWorldY(10840), size: 72, gasRate: 1000, pursuit: 0.08 }));
  snakes.push(createSnake({ x: canvas.width * 0.84, y: metersToWorldY(11240), size: 74, gasRate: 920, pursuit: 0.085 }));
  snakes.push(createSnake({ x: canvas.width * 0.18, y: metersToWorldY(11720), size: 70, gasRate: 980, pursuit: 0.084 }));

  crocodiles.push(createCrocodile({ x: canvas.width * 0.74, y: metersToWorldY(11060), size: 102, fireRate: 850, pursuit: 0.055 }));
  crocodiles.push(createCrocodile({ x: canvas.width * 0.26, y: metersToWorldY(11810), size: 98, fireRate: 820, pursuit: 0.058 }));
}

function getDragonMouth(dragon) {
  return {
    x: dragon.x + dragon.facing * 188,
    y: dragon.y - 48
  };
}

function getSnakeMouth(snake) {
  return {
    x: snake.x + snake.facing * 44,
    y: snake.y - 10
  };
}

function getCrocMouth(croc) {
  return {
    x: croc.x + croc.facing * 72,
    y: croc.y - 12
  };
}

function damageDragon(hitX, hitY) {
  if (!dragonBoss || dragonBoss.dead) return;

  dragonBoss.hp -= 1;
  spawnBurst(hitX, hitY, "#ff7b39");

  if (dragonBoss.hp <= 0) {
    dragonBoss.dead = true;
    dragonBoss.breathUntil = 0;

    for (let i = 0; i < 6; i++) {
      spawnBurst(
        dragonBoss.x + (Math.random() - 0.5) * 180,
        dragonBoss.y + (Math.random() - 0.5) * 120,
        i % 2 === 0 ? "#ffd54a" : "#ff5a3c"
      );
    }

    awardPoints(6);
  }
}

function damageSnake(index, hitX, hitY) {
  const snake = snakes[index];
  if (!snake) return;

  snake.hp -= 1;
  spawnBurst(hitX, hitY, "#1a1a1a");

  if (snake.hp <= 0) {
    spawnBurst(snake.x, snake.y, "#000000");
    spawnBurst(snake.x + 12, snake.y - 8, "#333333");
    snakes.splice(index, 1);
    awardPoints(2);
  }
}

function damageCrocodile(index, hitX, hitY) {
  const croc = crocodiles[index];
  if (!croc) return;

  croc.hp -= 1;
  spawnBurst(hitX, hitY, "#6d8e2f");

  if (croc.hp <= 0) {
    spawnBurst(croc.x, croc.y, "#8fba41");
    spawnBurst(croc.x - 18, croc.y + 6, "#5f7f2a");
    crocodiles.splice(index, 1);
    awardPoints(2);
  }
}

function refreshControlVisibility() {
  const mobile = isMobileDevice();

  if (!gameActive && !sinking) {
    controls.style.display = "none";
    mobileControls.style.display = "none";
    return;
  }

  if (sinking) {
    controls.style.display = "none";
    mobileControls.style.display = "none";
    return;
  }

  controls.style.display = mobile ? "none" : "flex";
  mobileControls.style.display = mobile ? "flex" : "none";
}

function beginSinking(message) {
  sinking = true;
  gameActive = false;
  pendingShot = false;
  sinkMessage = message;
  sinkStartTime = performance.now();
  stopAllSounds();
  playSinkSound();
  controls.style.display = "none";
  mobileControls.style.display = "none";
}

function initGame() {
  bgMusic.currentTime = 0;
  bgMusic.volume = 0.8;
  bgMusic.play().catch(() => {});
  startEngine();

  livesCount = 3;
  scoreCount = 0;
  nextBonusScore = 10;
  lastShotTime = -9999;
  pendingShot = false;
  lastHitTime = -9999;
  bullets = [];
  particles = [];
  enemies = [];
  plants = [];
  snakes = [];
  crocodiles = [];
  turtles = [];
  rainbows = [];
  dragonFlames = [];
  poisonClouds = [];
  crocBullets = [];
  inputMap = {};
  sinking = false;
  sinkMessage = "";
  dragonBoss = null;

  boat = {
    x: canvas.width / 2,
    y: RACE_DISTANCE - 150,
    angle: 0,
    speed: 0
  };

  waves = Array.from({ length: 130 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    p: Math.random() * Math.PI * 2,
    s: 0.6 + Math.random(),
    w: 60 + Math.random() * 90,
    layer: Math.floor(Math.random() * 4)
  }));

  sparkles = Array.from({ length: 50 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    o: Math.random(),
    s: 0.03 + Math.random() * 0.06
  }));

  lifelines = [];
  for (let i = 0; i < 22; i++) {
    lifelines.push({
      x: Math.random() * canvas.width,
      y: Math.random() * (RACE_DISTANCE - 1200) + 200
    });
  }

  for (let i = 0; i < PLANT_COUNT; i++) {
    plants.push(createPlant());
  }

  for (let i = 0; i < TURTLE_COUNT; i++) {
    turtles.push(createTurtle());
  }

  for (let i = 0; i < RAINBOW_COUNT; i++) {
    rainbows.push(createRainbow());
  }

  for (let i = 0; i < SNAKE_COUNT; i++) {
    snakes.push(createSnake());
  }

  for (let i = 0; i < CROCODILE_COUNT; i++) {
    crocodiles.push(createCrocodile());
  }

  ENEMY_TYPES.forEach((type) => {
    for (let i = 0; i < ENEMIES_PER_TYPE; i++) {
      enemies.push(createEnemy(type));
    }
  });

  EXTRA_ATTACKER_TYPES.forEach((type) => {
    for (let i = 0; i < EXTRA_ATTACKERS_PER_TYPE; i++) {
      enemies.push(createEnemy(type));
    }
  });

  createEndZoneThreats();

  document.getElementById("timer").innerText = `0m / ${GOAL_METERS.toLocaleString()}m`;

  gameActive = true;
  startScreen.style.display = "none";
  hud.style.display = "block";
  refreshControlVisibility();
  updateLivesDisplay();
  updateScoreDisplay();
  requestAnimationFrame(update);
}

function updateSinking() {
  const elapsed = performance.now() - sinkStartTime;

  boat.speed *= 0.96;
  boat.angle += 0.045;
  boat.y += 4 + elapsed * 0.002;
  boat.x += Math.sin(elapsed / 140) * 0.8;

  if (Math.random() < 0.7) {
    spawnBubbles(boat.x, boat.y - 6, 2);
  }

  if (elapsed > 2400) {
    sinking = false;
    outSound.currentTime = 0;
    outSound.play().catch(() => {});
    gameOver(sinkMessage || "THE BOAT SANK!");
  }
}

function updateEndZoneThreats(progress) {
  const now = performance.now();

  if (dragonBoss) {
    dragonBoss.x = canvas.width * dragonBoss.xRatio;
    dragonBoss.y = dragonBoss.baseY + Math.sin(now / 320 + dragonBoss.seed) * 16;

    if (progress >= FINAL_ZONE_TRIGGER && !dragonBoss.dead) {
      if (now - dragonBoss.lastBurst > 3200) {
        dragonBoss.lastBurst = now;
        dragonBoss.breathUntil = now + 1450;
      }

      if (now < dragonBoss.breathUntil && now - dragonBoss.lastFlame > 55) {
        dragonBoss.lastFlame = now;
        const mouth = getDragonMouth(dragonBoss);
        const dx = boat.x - mouth.x + (Math.random() - 0.5) * 150;
        const dy = boat.y - mouth.y + (Math.random() - 0.5) * 90;
        const len = Math.hypot(dx, dy) || 1;
        const speed = 8.6 + Math.random() * 2.6;

        dragonFlames.push({
          x: mouth.x,
          y: mouth.y,
          vx: (dx / len) * speed,
          vy: (dy / len) * speed,
          life: 70 + Math.random() * 18,
          size: 18 + Math.random() * 12
        });
      }

      if (Math.hypot(boat.x - dragonBoss.x, boat.y - dragonBoss.y) < 125) {
        handleCollision("THE DRAGON SMASHED THE BOAT!");
      }
    }
  }

  for (let i = 0; i < snakes.length; i++) {
    const snake = snakes[i];
    const dx = boat.x - snake.x;
    const dy = boat.y - snake.y;
    const dist = Math.hypot(dx, dy) || 1;

    snake.vx += Math.sin(now / 420 + snake.seed) * 0.035;
    snake.vy += Math.cos(now / 540 + snake.seed) * 0.024;
    snake.vx += (snake.homeX - snake.x) * 0.0009;
    snake.vy += (snake.homeY - snake.y) * 0.0006;

    if (dist < 520) {
      snake.vx += (dx / dist) * snake.pursuit;
      snake.vy += (dy / dist) * snake.pursuit * 0.7;
    }

    const snakeSpeed = Math.hypot(snake.vx, snake.vy) || 1;
    if (snakeSpeed > 2.5) {
      snake.vx = (snake.vx / snakeSpeed) * 2.5;
      snake.vy = (snake.vy / snakeSpeed) * 2.5;
    }

    snake.x += snake.vx;
    snake.y += snake.vy;
    snake.vx *= 0.985;
    snake.vy *= 0.985;

    if (snake.x < 40 || snake.x > canvas.width - 40) {
      snake.vx *= -1;
      snake.x = clamp(snake.x, 40, canvas.width - 40);
    }

    if (snake.y < 120 || snake.y > RACE_DISTANCE - 120) {
      snake.vy *= -1;
      snake.y = clamp(snake.y, 120, RACE_DISTANCE - 120);
    }

    if (Math.abs(snake.vx) > 0.04) {
      snake.facing = snake.vx >= 0 ? 1 : -1;
    } else if (Math.abs(dx) > 10) {
      snake.facing = dx >= 0 ? 1 : -1;
    }

    if (Math.abs(boat.y - snake.y) < 2500 && now - snake.lastGas > snake.gasRate) {
      snake.lastGas = now;
      const mouth = getSnakeMouth(snake);

      poisonClouds.push({
        x: mouth.x,
        y: mouth.y,
        vx: snake.facing * (1.6 + Math.random() * 0.8),
        vy: 0.25 + Math.random() * 0.4,
        size: 24 + Math.random() * 8,
        grow: 0.32 + Math.random() * 0.14,
        life: 150 + Math.random() * 30,
        seed: Math.random() * 1000
      });
    }

    if (Math.hypot(boat.x - snake.x, boat.y - snake.y) < snake.size * 0.7) {
      handleCollision("A GIANT SNAKE STRUCK THE BOAT!");
    }
  }

  for (let i = 0; i < crocodiles.length; i++) {
    const croc = crocodiles[i];
    const dx = boat.x - croc.x;
    const dy = boat.y - croc.y;
    const dist = Math.hypot(dx, dy) || 1;

    croc.vx += Math.sin(now / 520 + croc.seed) * 0.03;
    croc.vy += Math.cos(now / 680 + croc.seed) * 0.02;
    croc.vx += (croc.homeX - croc.x) * 0.00075;
    croc.vy += (croc.homeY - croc.y) * 0.00055;

    if (dist < 760) {
      croc.vx += (dx / dist) * croc.pursuit;
      croc.vy += (dy / dist) * croc.pursuit * 0.65;
    }

    const crocSpeed = Math.hypot(croc.vx, croc.vy) || 1;
    if (crocSpeed > 2.2) {
      croc.vx = (croc.vx / crocSpeed) * 2.2;
      croc.vy = (croc.vy / crocSpeed) * 2.2;
    }

    croc.x += croc.vx;
    croc.y += croc.vy;
    croc.vx *= 0.987;
    croc.vy *= 0.987;

    if (croc.x < 50 || croc.x > canvas.width - 50) {
      croc.vx *= -1;
      croc.x = clamp(croc.x, 50, canvas.width - 50);
    }

    if (croc.y < 120 || croc.y > RACE_DISTANCE - 120) {
      croc.vy *= -1;
      croc.y = clamp(croc.y, 120, RACE_DISTANCE - 120);
    }

    if (Math.abs(croc.vx) > 0.03) {
      croc.facing = croc.vx >= 0 ? 1 : -1;
    } else if (Math.abs(dx) > 10) {
      croc.facing = dx >= 0 ? 1 : -1;
    }

    if (Math.abs(boat.y - croc.y) < 2800 && now - croc.lastShot > croc.fireRate) {
      croc.lastShot = now;
      const mouth = getCrocMouth(croc);
      const shotDx = boat.x - mouth.x;
      const shotDy = boat.y - mouth.y;
      const shotLen = Math.hypot(shotDx, shotDy) || 1;
      const speed = 7.8 + Math.random() * 1.8;

      crocBullets.push({
        x: mouth.x,
        y: mouth.y,
        vx: (shotDx / shotLen) * speed,
        vy: (shotDy / shotLen) * speed,
        life: 145,
        size: 8 + Math.random() * 2
      });
    }

    if (Math.hypot(boat.x - croc.x, boat.y - croc.y) < croc.size * 0.62) {
      handleCollision("A CROCODILE CHARGED THE BOAT!");
    }
  }

  for (let i = dragonFlames.length - 1; i >= 0; i--) {
    const flame = dragonFlames[i];
    flame.x += flame.vx;
    flame.y += flame.vy;
    flame.vy += 0.012;
    flame.life--;
    flame.size *= 0.994;

    if (Math.hypot(boat.x - flame.x, boat.y - flame.y) < flame.size + 14) {
      dragonFlames.splice(i, 1);
      handleCollision("THE DRAGON FIRE BURNT THE BOAT!");
      continue;
    }

    if (
      flame.life <= 0 ||
      flame.x < -220 ||
      flame.x > canvas.width + 220 ||
      flame.y < -220 ||
      flame.y > RACE_DISTANCE + 220
    ) {
      dragonFlames.splice(i, 1);
    }
  }

  for (let i = poisonClouds.length - 1; i >= 0; i--) {
    const cloud = poisonClouds[i];
    cloud.x += cloud.vx;
    cloud.y += cloud.vy + Math.sin((now + cloud.seed) / 180) * 0.22;
    cloud.size += cloud.grow;
    cloud.life--;

    if (Math.hypot(boat.x - cloud.x, boat.y - cloud.y) < cloud.size + 10) {
      poisonClouds.splice(i, 1);
      handleCollision("THE BLACK POISON GAS CHOKED THE BOAT!");
      continue;
    }

    if (
      cloud.life <= 0 ||
      cloud.x < -260 ||
      cloud.x > canvas.width + 260 ||
      cloud.y < -260 ||
      cloud.y > RACE_DISTANCE + 260
    ) {
      poisonClouds.splice(i, 1);
    }
  }

  for (let i = crocBullets.length - 1; i >= 0; i--) {
    const shot = crocBullets[i];
    shot.x += shot.vx;
    shot.y += shot.vy;
    shot.life--;

    if (Math.hypot(boat.x - shot.x, boat.y - shot.y) < shot.size + 12) {
      crocBullets.splice(i, 1);
      handleCollision("THE CROCODILE BULLETS HIT THE BOAT!");
      continue;
    }

    if (
      shot.life <= 0 ||
      shot.x < -160 ||
      shot.x > canvas.width + 160 ||
      shot.y < -160 ||
      shot.y > RACE_DISTANCE + 160
    ) {
      crocBullets.splice(i, 1);
    }
  }
}

function update() {
  if (!gameActive && !sinking) return;

  if (sinking) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= p.type === "bubble" ? 0.02 : 0.03;
      p.x += p.vx || 0;
      p.y += p.vy || 0;

      if (p.type === "bubble") {
        p.size *= 0.995;
      } else if (p.type === "gas") {
        p.size += 0.6;
      } else if (p.type === "burst") {
        p.size *= 0.97;
      } else if (p.type === "muzzle") {
        p.size *= 0.92;
      }

      if (p.life <= 0) particles.splice(i, 1);
    }

    updateSinking();
    draw();
    if (sinking) requestAnimationFrame(update);
    return;
  }

  const mobile = isMobileDevice();
  let mobileMoveX = 0;
  let mobileMoveY = 0;

  if (mobile) {
    mobileMoveX = (inputMap["d"] ? 1 : 0) - (inputMap["a"] ? 1 : 0);
    mobileMoveY = (inputMap["s"] ? 1 : 0) - (inputMap["w"] ? 1 : 0);

    if (mobileMoveX !== 0 || mobileMoveY !== 0) {
      const len = Math.hypot(mobileMoveX, mobileMoveY) || 1;
      mobileMoveX /= len;
      mobileMoveY /= len;

      const targetAngle = Math.atan2(mobileMoveX, -mobileMoveY);
      const angleDiff = normalizeAngle(targetAngle - boat.angle);
      boat.angle += angleDiff * 0.24;

      boat.speed = MOBILE_MOVE_SPEED;
      boat.x += mobileMoveX * MOBILE_MOVE_SPEED;
      boat.y += mobileMoveY * MOBILE_MOVE_SPEED;
    } else {
      boat.speed *= 0.88;
    }
  } else {
    if (inputMap["a"]) boat.angle -= 0.055;
    if (inputMap["d"]) boat.angle += 0.055;
    if (inputMap["w"]) boat.speed += 0.22;
    else if (inputMap["s"]) boat.speed -= 0.16;
    else boat.speed *= 0.94;

    boat.speed = Math.max(-1.8, Math.min(boat.speed, 7.4));
    boat.x += Math.sin(boat.angle) * boat.speed;
    boat.y -= Math.cos(boat.angle) * boat.speed;
  }

  if (engineOsc && audioCtx) {
    engineOsc.frequency.setTargetAtTime(
      38 + Math.abs(boat.speed) * 16,
      audioCtx.currentTime,
      0.1
    );
  }

  if (engineGain && audioCtx) {
    engineGain.gain.setTargetAtTime(
      0.03 + Math.abs(boat.speed) / 42,
      audioCtx.currentTime,
      0.12
    );
  }

  if (inputMap["fire"] || pendingShot) {
    shootFire();
  }

  if (Math.abs(boat.speed) > 0.4) {
    particles.push({
      x: boat.x,
      y: boat.y,
      life: 1,
      size: 5,
      type: "water"
    });

    if (mobile ? (mobileMoveX !== 0 || mobileMoveY !== 0) : inputMap["w"]) {
      particles.push({
        x: boat.x - Math.sin(boat.angle) * 15,
        y: boat.y + Math.cos(boat.angle) * 15,
        life: 1.2,
        size: 8,
        type: "gas",
        vx: -Math.sin(boat.angle) * (1 + Math.random() * 3),
        vy: Math.cos(boat.angle) * (1 + Math.random() * 3)
      });
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= p.type === "burst" ? 0.05 : 0.03;
    p.x += p.vx || 0;
    p.y += p.vy || 0;

    if (p.type === "gas") p.size += 0.6;
    if (p.type === "burst") p.size *= 0.97;
    if (p.type === "muzzle") p.size *= 0.92;
    if (p.type === "bubble") p.size *= 0.995;

    if (p.life <= 0) particles.splice(i, 1);
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    b.life--;

    let bulletRemoved = false;

    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      if (Math.hypot(b.x - enemy.x, b.y - enemy.y) < enemy.size * 0.62) {
        hitSound.currentTime = 0;
        hitSound.play().catch(() => {});
        spawnBurst(enemy.x, enemy.y, enemy.skin.body);
        enemies.splice(j, 1);
        bullets.splice(i, 1);
        awardPoints(1);
        bulletRemoved = true;
        break;
      }
    }

    if (bulletRemoved) continue;

    if (dragonBoss && !dragonBoss.dead && Math.hypot(b.x - dragonBoss.x, b.y - dragonBoss.y) < 112) {
      hitSound.currentTime = 0;
      hitSound.play().catch(() => {});
      damageDragon(b.x, b.y);
      bullets.splice(i, 1);
      bulletRemoved = true;
      continue;
    }

    for (let j = snakes.length - 1; j >= 0 && !bulletRemoved; j--) {
      const snake = snakes[j];
      if (Math.hypot(b.x - snake.x, b.y - snake.y) < snake.size * 0.6) {
        hitSound.currentTime = 0;
        hitSound.play().catch(() => {});
        damageSnake(j, b.x, b.y);
        bullets.splice(i, 1);
        bulletRemoved = true;
      }
    }

    for (let j = crocodiles.length - 1; j >= 0 && !bulletRemoved; j--) {
      const croc = crocodiles[j];
      if (Math.hypot(b.x - croc.x, b.y - croc.y) < croc.size * 0.55) {
        hitSound.currentTime = 0;
        hitSound.play().catch(() => {});
        damageCrocodile(j, b.x, b.y);
        bullets.splice(i, 1);
        bulletRemoved = true;
      }
    }

    if (bulletRemoved) continue;

    if (
      b.life <= 0 ||
      b.x < -120 ||
      b.x > canvas.width + 120 ||
      b.y < -120 ||
      b.y > RACE_DISTANCE + 120
    ) {
      bullets.splice(i, 1);
    }
  }

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    const time = performance.now();

    if (enemy.hunter) {
      const dx = boat.x - enemy.x;
      const dy = boat.y - enemy.y;
      const angleToBoat = Math.atan2(dy, dx);

      enemy.speedX += Math.cos(angleToBoat) * enemy.pursuit;
      enemy.speedY += Math.sin(angleToBoat) * enemy.pursuit;
    } else {
      enemy.speedX += Math.cos(enemy.seed + time / 1400) * 0.012;
      enemy.speedY += Math.sin(enemy.seed + time / 1800) * 0.008;
      enemy.speedX *= 0.992;
      enemy.speedY *= 0.992;
    }

    const currentSpeed = Math.hypot(enemy.speedX, enemy.speedY) || 1;
    if (currentSpeed > enemy.maxSpeed) {
      enemy.speedX = (enemy.speedX / currentSpeed) * enemy.maxSpeed;
      enemy.speedY = (enemy.speedY / currentSpeed) * enemy.maxSpeed;
    }

    enemy.x += enemy.speedX;
    enemy.y += enemy.speedY;

    if (enemy.x < 20 || enemy.x > canvas.width - 20) {
      enemy.speedX *= -1;
      enemy.x = clamp(enemy.x, 20, canvas.width - 20);
    }

    if (enemy.y < 120 || enemy.y > RACE_DISTANCE - 120) {
      enemy.speedY *= -1;
      enemy.y = clamp(enemy.y, 120, RACE_DISTANCE - 120);
    }

    if (Math.hypot(boat.x - enemy.x, boat.y - enemy.y) < enemy.size * 0.6 + 12) {
      handleCollision(enemy.hunter ? "AN ATTACKING FISH CAUGHT YOU!" : "YOU HIT AN ENEMY FISH!");
      if (!gameActive && !sinking) return;
    }
  }

  for (let i = 0; i < plants.length; i++) {
    const plant = plants[i];
    const plantCenterY = plant.y - plant.height * 0.45;
    const touchDist = Math.hypot(boat.x - plant.x, boat.y - plantCenterY);
    if (touchDist < plant.collisionRadius + 18) {
      handleCollision(plant.cactus ? "THE BOAT HIT AN IVORY CACTUS PLANT!" : "THE BOAT HIT A SHARP PLANT!");
      if (!gameActive && !sinking) return;
    }
  }

  for (let i = lifelines.length - 1; i >= 0; i--) {
    const gf = lifelines[i];
    if (Math.hypot(boat.x - gf.x, boat.y - gf.y) < 40) {
      livesCount++;
      updateLivesDisplay();
      lifelines.splice(i, 1);
    }
  }

  for (let i = turtles.length - 1; i >= 0; i--) {
    const turtle = turtles[i];
    if (Math.hypot(boat.x - turtle.x, boat.y - turtle.y) < turtle.size + 12) {
      awardPoints(turtle.points);
      spawnBurst(turtle.x, turtle.y, "#4ddf77");
      spawnBurst(turtle.x + 8, turtle.y - 4, "#ffd54a");
      turtles.splice(i, 1);
    }
  }

  const progress = Math.max(0, Math.floor((RACE_DISTANCE - boat.y) / 10));

  updateEndZoneThreats(progress);

  if (sinking) {
    draw();
    requestAnimationFrame(update);
    return;
  }

  if (progress >= GOAL_METERS) {
    winGame();
    return;
  }

  if (boat.x < 0 || boat.x > canvas.width) {
    handleCollision("OUT OF BOUNDS!");
    if (!gameActive && !sinking) return;
  }

  draw();
  if (gameActive || sinking) requestAnimationFrame(update);
}

function handleCollision(message) {
  const now = performance.now();
  if (now - lastHitTime < HIT_COOLDOWN || sinking) return;

  lastHitTime = now;

  if (livesCount > 1) {
    livesCount--;
    updateLivesDisplay();
    hitSound.currentTime = 0;
    hitSound.play().catch(() => {});
    boat.speed = -3;
    boat.y = Math.min(RACE_DISTANCE - 60, boat.y + 180);
    boat.x = Math.max(30, Math.min(canvas.width - 30, boat.x));
    spawnBurst(boat.x, boat.y, "#ffd54a");
  } else {
    livesCount = 0;
    updateLivesDisplay();
    beginSinking(message);
  }
}

function updateLivesDisplay() {
  document.getElementById("lives").innerText = "⚡ Lifelines: " + livesCount;
}

function drawPlant(plant) {
  ctx.save();
  ctx.translate(plant.x, plant.y);

  const trunkW = plant.width;
  const trunkH = plant.height;
  const armW = trunkW * 0.65;
  const armH = trunkH * 0.42;

  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  ctx.fillStyle = plant.color;

  ctx.beginPath();
  ctx.roundRect(-trunkW / 2, -trunkH, trunkW, trunkH, trunkW * 0.45);
  ctx.fill();

  if (plant.armLeft) {
    ctx.beginPath();
    ctx.roundRect(
      -trunkW / 2 - armW,
      -trunkH * 0.62,
      armW,
      trunkW * 0.72,
      trunkW * 0.35
    );
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(
      -trunkW / 2 - armW,
      -trunkH * 0.62 - armH,
      trunkW * 0.62,
      armH,
      trunkW * 0.32
    );
    ctx.fill();
  }

  if (plant.armRight) {
    ctx.beginPath();
    ctx.roundRect(
      trunkW / 2,
      -trunkH * 0.52,
      armW,
      trunkW * 0.72,
      trunkW * 0.35
    );
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(
      trunkW / 2 + armW - trunkW * 0.62,
      -trunkH * 0.52 - armH,
      trunkW * 0.62,
      armH,
      trunkW * 0.32
    );
    ctx.fill();
  }

  if (plant.cactus) {
    ctx.fillStyle = plant.spikeColor;

    for (let i = 0; i < 6; i++) {
      const py = -trunkH + 10 + i * (trunkH / 6.8);
      ctx.beginPath();
      ctx.moveTo(-trunkW / 2 - 2, py);
      ctx.lineTo(-trunkW / 2 - 8, py - 4);
      ctx.lineTo(-trunkW / 2 - 2, py - 1);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(trunkW / 2 + 2, py + 2);
      ctx.lineTo(trunkW / 2 + 8, py - 2);
      ctx.lineTo(trunkW / 2 + 2, py - 1);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.roundRect(-trunkW * 0.2, -trunkH + 6, trunkW * 0.18, trunkH * 0.78, trunkW * 0.08);
  ctx.fill();

  ctx.fillStyle = "rgba(40,20,0,0.18)";
  for (let i = 0; i < 6; i++) {
    const py = -trunkH + 10 + i * (trunkH / 6.5);
    ctx.fillRect(-trunkW * 0.65, py, trunkW * 0.18, 2);
    ctx.fillRect(trunkW * 0.47, py + 4, trunkW * 0.18, 2);
  }

  ctx.restore();
}

function drawFish(enemy, angle, isHunter) {
  const t = performance.now() / 140 + enemy.seed;
  const size = enemy.size;
  const tailSwing = Math.sin(t) * size * 0.18;
  const finSwing = Math.cos(t * 1.4) * size * 0.08;

  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.rotate(angle);

  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = enemy.skin.body;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.55, size * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = enemy.skin.fin;
  ctx.beginPath();
  ctx.moveTo(-size * 0.38, 0);
  ctx.lineTo(-size * 0.82, -size * 0.28 + tailSwing);
  ctx.lineTo(-size * 0.82, size * 0.28 + tailSwing);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-size * 0.05, -size * 0.1);
  ctx.lineTo(size * 0.12, -size * 0.48 + finSwing);
  ctx.lineTo(size * 0.28, -size * 0.08);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, size * 0.08);
  ctx.lineTo(size * 0.18, size * 0.42 - finSwing);
  ctx.lineTo(size * 0.34, size * 0.08);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.ellipse(size * 0.1, -size * 0.08, size * 0.22, size * 0.08, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(size * 0.05, -size * 0.22);
  ctx.quadraticCurveTo(size * 0.18, 0, size * 0.05, size * 0.22);
  ctx.stroke();

  ctx.fillStyle = isHunter ? "#ff3b3b" : enemy.skin.eye;
  ctx.beginPath();
  ctx.arc(size * 0.3, -size * 0.07, size * 0.07, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(size * 0.32, -size * 0.07, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(40,0,0,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(size * 0.42, size * 0.02);
  ctx.quadraticCurveTo(size * 0.5, size * 0.08, size * 0.43, size * 0.14);
  ctx.stroke();

  ctx.restore();
}

function drawDragon(dragon, breathing) {
  ctx.save();
  ctx.translate(dragon.x, dragon.y);
  ctx.scale(dragon.facing, 1);

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(-20, 55, 130, 32, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(33, 60, 30, 0.75)";
  ctx.beginPath();
  ctx.moveTo(-30, -10);
  ctx.quadraticCurveTo(-100, -160, -8, -110);
  ctx.quadraticCurveTo(72, -86, 15, -10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#355f26";
  ctx.beginPath();
  ctx.ellipse(-15, 0, 120, 70, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#487e30";
  ctx.beginPath();
  ctx.moveTo(-95, -8);
  ctx.quadraticCurveTo(-165, -45, -205, -6);
  ctx.quadraticCurveTo(-170, 14, -100, 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#2c4e1c";
  ctx.beginPath();
  ctx.moveTo(42, -22);
  ctx.quadraticCurveTo(95, -80, 132, -75);
  ctx.quadraticCurveTo(180, -72, 188, -38);
  ctx.quadraticCurveTo(150, -20, 98, -4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#4e8b34";
  ctx.beginPath();
  ctx.ellipse(156, -45, 42, 32, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#203814";
  ctx.beginPath();
  ctx.moveTo(124, -35);
  ctx.quadraticCurveTo(160, -6, 188, breathing ? -6 : -16);
  ctx.lineTo(172, breathing ? 4 : -6);
  ctx.quadraticCurveTo(140, -6, 120, -22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#d8d0a6";
  ctx.beginPath();
  ctx.moveTo(174, breathing ? -2 : -10);
  ctx.lineTo(182, breathing ? 6 : -2);
  ctx.lineTo(166, breathing ? 3 : -6);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(160, breathing ? 1 : -8);
  ctx.lineTo(166, breathing ? 8 : -1);
  ctx.lineTo(154, breathing ? 4 : -4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#5ca13f";
  for (let i = -2; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-80 + i * 32, -38 - Math.abs(i) * 2);
    ctx.lineTo(-68 + i * 32, -72 - Math.abs(i) * 3);
    ctx.lineTo(-58 + i * 32, -38 - Math.abs(i) * 2);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "#d0d7df";
  ctx.beginPath();
  ctx.moveTo(148, -77);
  ctx.lineTo(162, -112);
  ctx.lineTo(171, -70);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(128, -70);
  ctx.lineTo(137, -100);
  ctx.lineTo(148, -68);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ff3b30";
  ctx.beginPath();
  ctx.arc(168, -52, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(170, -52, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.scale(dragon.facing, 1);
  ctx.fillStyle = "#ff0000";
  ctx.font = "bold 28px Segoe UI";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 8;
  ctx.fillText(`HP: ${dragon.hp}`, 0, 6);
  ctx.restore();

  ctx.restore();
}

function drawSnake(snake, activeGas) {
  ctx.save();
  ctx.translate(snake.x, snake.y);
  ctx.scale(snake.facing, 1);

  ctx.strokeStyle = "#171717";
  ctx.lineWidth = snake.size * 0.32;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-58, 10);
  ctx.quadraticCurveTo(-28, -18, 2, 4);
  ctx.quadraticCurveTo(18, 18, 34, 0);
  ctx.quadraticCurveTo(46, -14, 62, 0);
  ctx.stroke();

  ctx.strokeStyle = "#2d2d2d";
  ctx.lineWidth = snake.size * 0.14;
  ctx.beginPath();
  ctx.moveTo(-48, 8);
  ctx.quadraticCurveTo(-20, -9, 4, 6);
  ctx.quadraticCurveTo(22, 17, 58, 0);
  ctx.stroke();

  ctx.fillStyle = "#050505";
  ctx.beginPath();
  ctx.ellipse(42, 0, snake.size * 0.42, snake.size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4c4c4c";
  ctx.beginPath();
  ctx.ellipse(52, -2, snake.size * 0.14, snake.size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff3b3b";
  ctx.beginPath();
  ctx.arc(52, -6, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(53, -6, 1.8, 0, Math.PI * 2);
  ctx.fill();

  if (activeGas) {
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(68, 2);
    ctx.lineTo(86, 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCrocodile(croc, firing) {
  ctx.save();
  ctx.translate(croc.x, croc.y);
  ctx.scale(croc.facing, 1);

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(-8, 36, 90, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#587a2b";
  ctx.beginPath();
  ctx.ellipse(-10, 0, croc.size * 0.62, croc.size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#769e3b";
  ctx.beginPath();
  ctx.moveTo(10, -12);
  ctx.lineTo(86, -22);
  ctx.lineTo(92, 4);
  ctx.lineTo(12, 12);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#4f6d28";
  ctx.beginPath();
  ctx.moveTo(-58, -6);
  ctx.lineTo(-100, -22);
  ctx.lineTo(-90, 8);
  ctx.lineTo(-48, 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#dfe6c9";
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(48 + i * 8, 3);
    ctx.lineTo(52 + i * 8, 12);
    ctx.lineTo(56 + i * 8, 3);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "#8cbb49";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-48 + i * 18, -18);
    ctx.lineTo(-40 + i * 18, -34);
    ctx.lineTo(-32 + i * 18, -18);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "#fff6d4";
  ctx.beginPath();
  ctx.arc(42, -12, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(43, -12, 2.2, 0, Math.PI * 2);
  ctx.fill();

  if (firing) {
    ctx.fillStyle = "#ff8f00";
    ctx.beginPath();
    ctx.arc(88, -2, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawTurtle(turtle) {
  const pulse = Math.sin(performance.now() / 280 + turtle.seed) * 2;

  ctx.save();
  ctx.translate(turtle.x, turtle.y);

  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(0, 18, turtle.size * 0.65, turtle.size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#51d36c";
  ctx.beginPath();
  ctx.ellipse(0, 0, turtle.size * 0.55, turtle.size * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2f8743";
  ctx.beginPath();
  ctx.arc(0, 0, turtle.size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#86ef98";
  ctx.beginPath();
  ctx.ellipse(0, 0, turtle.size * 0.18 + pulse * 0.02, turtle.size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#66bb6a";
  ctx.beginPath();
  ctx.ellipse(-turtle.size * 0.48, 2, turtle.size * 0.2, turtle.size * 0.12, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(turtle.size * 0.48, 2, turtle.size * 0.2, turtle.size * 0.12, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-turtle.size * 0.28, turtle.size * 0.38, turtle.size * 0.18, turtle.size * 0.1, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(turtle.size * 0.28, turtle.size * 0.38, turtle.size * 0.18, turtle.size * 0.1, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#77d179";
  ctx.beginPath();
  ctx.arc(0, -turtle.size * 0.45, turtle.size * 0.14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(-4, -turtle.size * 0.47, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(4, -turtle.size * 0.47, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffd54a";
  ctx.font = "bold 14px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText("+4", 0, -turtle.size * 0.95);

  ctx.restore();
}

function drawRainbowArc(rainbow) {
  const colors = ["#ff3b30", "#ff9500", "#ffd60a", "#34c759", "#32ade6", "#5856d6", "#bf5af2"];
  const shimmer = 0.22 + Math.abs(Math.sin(performance.now() / 1300 + rainbow.seed)) * 0.2;
  const lift = Math.sin(performance.now() / 900 + rainbow.seed) * 10;

  ctx.save();
  ctx.globalAlpha = shimmer;

  for (let i = 0; i < colors.length; i++) {
    ctx.strokeStyle = colors[i];
    ctx.lineWidth = rainbow.thickness;
    ctx.beginPath();
    ctx.arc(
      rainbow.x,
      rainbow.y + lift,
      rainbow.radius - i * (rainbow.thickness + 1.5),
      Math.PI * 1.08,
      Math.PI * 1.92
    );
    ctx.stroke();
  }

  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const camY = boat.y - canvas.height * 0.75;
  const progress = Math.max(0, Math.floor((RACE_DISTANCE - boat.y) / 10));
  const biomeIndex = Math.floor((progress % 5000) / 500);
  const biome = BIOME_CYCLE[biomeIndex];
  const inGoldZone = progress >= GOLD_ZONE_START;
  const boatRecentlyHit = performance.now() - lastHitTime < HIT_COOLDOWN;
  const boatBlink = boatRecentlyHit && Math.floor(performance.now() / 80) % 2 === 0;
  const sinkElapsed = sinking ? performance.now() - sinkStartTime : 0;
  const sceneZoom = isMobileDevice() ? MOBILE_ZOOM : 1;
  const now = performance.now();

  ctx.save();
  ctx.translate(0, -camY);

  if (sceneZoom !== 1) {
    const pivotX = canvas.width / 2;
    const pivotY = camY + canvas.height * 0.62;
    ctx.translate(pivotX, pivotY);
    ctx.scale(sceneZoom, sceneZoom);
    ctx.translate(-pivotX, -pivotY);
  }

  const seaGrad = ctx.createLinearGradient(0, camY, 0, camY + canvas.height);
  if (inGoldZone) {
    seaGrad.addColorStop(0, "#fff6b5");
    seaGrad.addColorStop(0.35, "#ffd65a");
    seaGrad.addColorStop(0.7, "#f6b321");
    seaGrad.addColorStop(1, "#b87900");
  } else {
    seaGrad.addColorStop(0, biome.top);
    seaGrad.addColorStop(1, biome.bottom);
  }
  ctx.fillStyle = seaGrad;
  ctx.fillRect(-120, camY - 120, canvas.width + 240, canvas.height + 240);

  sparkles.forEach((s, idx) => {
    s.o += s.s;
    if (s.o > 1 || s.o < 0) s.s *= -1;

    const sy = ((s.y + camY) % canvas.height) + camY;
    const sparkleAlpha = Math.abs(s.o);

    if (inGoldZone) {
      ctx.fillStyle =
        idx % 2 === 0
          ? `rgba(255, 247, 190, ${sparkleAlpha})`
          : `rgba(255, 205, 80, ${sparkleAlpha})`;
      ctx.beginPath();
      ctx.arc(s.x, sy, 3.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = `rgba(255,255,255,${sparkleAlpha})`;
      ctx.beginPath();
      ctx.arc(s.x, sy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  waves.forEach((w, idx) => {
    const time = Date.now() / 1000;
    const finalY =
      ((w.y + camY * 0.15 * w.layer) % (canvas.height + 200)) + camY - 100;

    if (inGoldZone) {
      const shimmer = 0.25 + (Math.sin(time * w.s + w.p + idx) + 1) * 0.18;
      ctx.strokeStyle =
        idx % 2 === 0
          ? `rgba(255, 248, 200, ${shimmer})`
          : `rgba(255, 190, 60, ${shimmer})`;
    } else {
      const isBrightZone = biomeIndex === 1 || biomeIndex === 3 || biomeIndex === 8;
      ctx.strokeStyle = isBrightZone
        ? "rgba(0,0,0,0.2)"
        : `rgba(255,255,255,${0.2 + w.layer * 0.1})`;
    }

    ctx.lineWidth = inGoldZone ? 3 + w.layer : 2 + w.layer;
    ctx.beginPath();
    ctx.moveTo(w.x - w.w / 2, finalY + Math.sin(time * w.s + w.p) * 15);
    ctx.quadraticCurveTo(
      w.x,
      finalY + Math.sin(time * w.s + w.p) * 15 - 20,
      w.x + w.w / 2,
      finalY + Math.sin(time * w.s + w.p) * 15
    );
    ctx.stroke();
  });

  for (let i = 0; i < rainbows.length; i++) {
    const rainbow = rainbows[i];
    if (rainbow.y > camY - 280 && rainbow.y < camY + canvas.height + 280) {
      drawRainbowArc(rainbow);
    }
  }

  for (let i = 0; i < plants.length; i++) {
    const plant = plants[i];
    if (plant.y > camY - 120 && plant.y < camY + canvas.height + 80) {
      drawPlant(plant);
    }
  }

  if (dragonBoss && !dragonBoss.dead && dragonBoss.y > camY - 260 && dragonBoss.y < camY + canvas.height + 260) {
    drawDragon(dragonBoss, now < dragonBoss.breathUntil);
  }

  for (let i = 0; i < snakes.length; i++) {
    const snake = snakes[i];
    if (snake.y > camY - 180 && snake.y < camY + canvas.height + 180) {
      drawSnake(snake, now - snake.lastGas < 650);
    }
  }

  for (let i = 0; i < crocodiles.length; i++) {
    const croc = crocodiles[i];
    if (croc.y > camY - 180 && croc.y < camY + canvas.height + 180) {
      drawCrocodile(croc, now - croc.lastShot < 260);
    }
  }

  for (let i = 0; i < turtles.length; i++) {
    const turtle = turtles[i];
    if (turtle.y > camY - 100 && turtle.y < camY + canvas.height + 100) {
      drawTurtle(turtle);
    }
  }

  particles.forEach((p) => {
    if (p.type === "gas") {
      ctx.fillStyle = `rgba(40,40,40,${p.life * 0.8})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (p.type === "water") {
      ctx.fillStyle = `rgba(255,255,255,${p.life * 0.7})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (p.type === "bubble") {
      ctx.strokeStyle = `rgba(220,245,255,${p.life * 0.85})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }

    ctx.fillStyle = hexToRgba(p.color, Math.max(0.08, p.life));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  dragonFlames.forEach((flame) => {
    const glow = ctx.createRadialGradient(flame.x, flame.y, 3, flame.x, flame.y, flame.size);
    glow.addColorStop(0, "rgba(255, 252, 210, 0.98)");
    glow.addColorStop(0.28, "rgba(255, 214, 70, 0.95)");
    glow.addColorStop(0.62, "rgba(255, 70, 40, 0.82)");
    glow.addColorStop(1, "rgba(54, 156, 255, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(flame.x, flame.y, flame.size, 0, Math.PI * 2);
    ctx.fill();
  });

  poisonClouds.forEach((cloud) => {
    const alpha = Math.max(0, cloud.life / 180);
    const fog = ctx.createRadialGradient(cloud.x, cloud.y, 2, cloud.x, cloud.y, cloud.size);
    fog.addColorStop(0, `rgba(45,45,45,${alpha * 0.96})`);
    fog.addColorStop(0.45, `rgba(18,18,18,${alpha * 0.88})`);
    fog.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fog;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
    ctx.fill();
  });

  crocBullets.forEach((shot) => {
    const glow = ctx.createRadialGradient(shot.x, shot.y, 2, shot.x, shot.y, 15);
    glow.addColorStop(0, "rgba(255,255,210,0.95)");
    glow.addColorStop(0.35, "rgba(255,140,30,0.92)");
    glow.addColorStop(1, "rgba(255,40,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffc44d";
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, shot.size / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  bullets.forEach((b) => {
    const glow = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, 18);
    glow.addColorStop(0, "rgba(255,255,190,0.98)");
    glow.addColorStop(0.35, "rgba(255,140,0,0.95)");
    glow.addColorStop(1, "rgba(255,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffd36b";
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  enemies.forEach((enemy) => {
    const angle = Math.atan2(enemy.speedY || 0, enemy.speedX || 1);
    drawFish(enemy, angle, enemy.hunter);
  });

  lifelines.forEach((gf) => {
    ctx.fillStyle = "#00ff88";
    ctx.beginPath();
    ctx.ellipse(gf.x, gf.y, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(gf.x + 12, gf.y);
    ctx.lineTo(gf.x + 24, gf.y - 10);
    ctx.lineTo(gf.x + 24, gf.y + 10);
    ctx.fill();
  });

  ctx.save();
  ctx.translate(boat.x, boat.y);
  ctx.rotate(boat.angle);

  if (sinking) {
    ctx.globalAlpha = Math.max(0.25, 1 - sinkElapsed / 2600);
    ctx.fillStyle = "#c58e18";
  } else {
    ctx.globalAlpha = boatBlink ? 0.35 : 1;
    ctx.fillStyle = boatBlink ? "#ff8a00" : "#ffde06";
  }

  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.lineTo(18, 22);
  ctx.lineTo(-18, 22);
  ctx.fill();
  ctx.restore();

  if (sinking) {
    ctx.fillStyle = `rgba(0, 35, 70, ${Math.min(0.42, sinkElapsed / 4200)})`;
    ctx.fillRect(-120, camY - 120, canvas.width + 240, canvas.height + 240);
  }

  ctx.restore();

  document.getElementById("timer").innerText =
    `${progress}m / ${GOAL_METERS.toLocaleString()}m`;
}

function winGame() {
  gameActive = false;
  pendingShot = false;
  stopAllSounds();
  controls.style.display = "none";
  mobileControls.style.display = "none";
  startScreen.style.display = "flex";
  startScreen.innerHTML = `<h1 style="color:#ffd54a">12KM GOLD HERO!</h1><p>Final Score: ${scoreCount}</p><button id="win-reset" class="restart-style">RACE AGAIN</button>`;
  document.getElementById("win-reset").onclick = initGame;
}

function gameOver(message) {
  controls.style.display = "none";
  mobileControls.style.display = "none";
  startScreen.style.display = "flex";
  startScreen.innerHTML = `<h1 style="color:#ff4757">PLAYER OUT!</h1><p>${message}</p><p>Final Score: ${scoreCount}</p><button id="re" class="restart-style">RETRY</button>`;
  document.getElementById("re").onclick = initGame;
}

function setupHoldButton(id, key) {
  const el = document.getElementById(id);
  if (!el) return;

  el.onpointerdown = (e) => {
    e.preventDefault();
    inputMap[key] = true;
  };

  el.onpointerup = (e) => {
    e.preventDefault();
    inputMap[key] = false;
  };

  el.onpointerleave = () => {
    inputMap[key] = false;
  };

  el.onpointercancel = () => {
    inputMap[key] = false;
  };
}

function setupFireButton(el) {
  if (!el) return;

  el.onpointerdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    inputMap["fire"] = true;
    requestFire();
  };

  el.onpointerup = (e) => {
    e.preventDefault();
    e.stopPropagation();
    inputMap["fire"] = false;
  };

  el.onpointerleave = () => {
    inputMap["fire"] = false;
  };

  el.onpointercancel = () => {
    inputMap["fire"] = false;
  };
}

setupHoldButton("btn-w", "w");
setupHoldButton("btn-a", "a");
setupHoldButton("btn-s", "s");
setupHoldButton("btn-d", "d");
setupHoldButton("mob-up", "w");
setupHoldButton("mob-left", "a");
setupHoldButton("mob-down", "s");
setupHoldButton("mob-right", "d");
setupFireButton(fireBtnDesktop);
setupFireButton(fireBtnMobile);

window.onkeydown = (e) => {
  const key = e.key.toLowerCase();

  if (key === " ") {
    e.preventDefault();
    inputMap["fire"] = true;
    if (!e.repeat) requestFire();
  } else {
    inputMap[key] = true;
  }
};

window.onkeyup = (e) => {
  const key = e.key.toLowerCase();

  if (key === " ") {
    inputMap["fire"] = false;
  } else {
    inputMap[key] = false;
  }
};

startBtn.onclick = initGame;

window.onresize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  for (let i = 0; i < snakes.length; i++) {
    snakes[i].x = clamp(snakes[i].x, 40, canvas.width - 40);
    snakes[i].homeX = clamp(snakes[i].homeX, 40, canvas.width - 40);
  }

  for (let i = 0; i < crocodiles.length; i++) {
    crocodiles[i].x = clamp(crocodiles[i].x, 50, canvas.width - 50);
    crocodiles[i].homeX = clamp(crocodiles[i].homeX, 50, canvas.width - 50);
  }

  for (let i = 0; i < turtles.length; i++) {
    turtles[i].x = clamp(turtles[i].x, 50, canvas.width - 50);
  }

  for (let i = 0; i < rainbows.length; i++) {
    rainbows[i].x = clamp(rainbows[i].x, 120, canvas.width - 120);
  }

  refreshControlVisibility();
};
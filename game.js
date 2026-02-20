const TILE = 40;
const MAP = [
  "###################",
  "#P....#.....#....E#",
  "#.##.#.###.#.##.#.#",
  "#....#.....#....#.#",
  "#.####.###.####.#.#",
  "#......#.#......#.#",
  "#.####.#.#.####.#.#",
  "#...#......#...#..#",
  "###.#.####.#.#.####",
  "#...#....#...#....#",
  "#.#.####.#.####.#.#",
  "#.#......#......#.#",
  "#.######.#.######.#",
  "#E.................#",
  "###################"
];

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const coffeeLeftEl = document.getElementById("coffeeLeft");
const statusTextEl = document.getElementById("statusText");
const restartBtn = document.getElementById("restartBtn");

const WIDTH = MAP[0].length;
const HEIGHT = MAP.length;
canvas.width = WIDTH * TILE;
canvas.height = HEIGHT * TILE;

const DIRECTIONS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 }
];

let state;

function initState() {
  const cups = new Set();
  const enemies = [];
  let player = { x: 1, y: 1, dirX: 0, dirY: 0, nextDirX: 0, nextDirY: 0 };

  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const cell = MAP[y][x];
      if (cell === ".") cups.add(`${x},${y}`);
      if (cell === "P") player = { ...player, x, y };
      if (cell === "E") enemies.push({ x, y, dirX: 0, dirY: 0, stepTimer: 0 });
    }
  }

  state = {
    player,
    enemies,
    cups,
    collected: 0,
    totalCups: cups.size,
    gameOver: false,
    won: false,
    tick: 0,
    playerStepDelay: 8,
    enemyStepDelay: 12,
    pulse: 0
  };

  updateHud();
}

function isWall(x, y) {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return true;
  return MAP[y][x] === "#";
}

function setDirection(dx, dy) {
  if (!state || state.gameOver) return;
  state.player.nextDirX = dx;
  state.player.nextDirY = dy;
}

function tryMove(entity, dx, dy) {
  const nx = entity.x + dx;
  const ny = entity.y + dy;
  if (isWall(nx, ny)) return false;
  entity.x = nx;
  entity.y = ny;
  return true;
}

function updatePlayer() {
  const p = state.player;

  if ((state.tick % state.playerStepDelay) !== 0) return;

  const canTurn = !isWall(p.x + p.nextDirX, p.y + p.nextDirY);
  if (canTurn) {
    p.dirX = p.nextDirX;
    p.dirY = p.nextDirY;
  }

  if (p.dirX !== 0 || p.dirY !== 0) {
    tryMove(p, p.dirX, p.dirY);
  }

  const key = `${p.x},${p.y}`;
  if (state.cups.has(key)) {
    state.cups.delete(key);
    state.collected += 1;
    if (state.cups.size === 0) {
      state.won = true;
      state.gameOver = true;
    }
  }
}

function distance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function nextEnemyStep(enemy) {
  const player = state.player;
  const possible = [];

  for (const dir of DIRECTIONS) {
    const nx = enemy.x + dir.x;
    const ny = enemy.y + dir.y;
    if (!isWall(nx, ny)) {
      possible.push({ x: dir.x, y: dir.y, score: Math.abs(nx - player.x) + Math.abs(ny - player.y) });
    }
  }

  if (!possible.length) return { x: 0, y: 0 };

  const chase = Math.random() < 0.7;
  if (chase) {
    possible.sort((a, b) => a.score - b.score);
    return { x: possible[0].x, y: possible[0].y };
  }

  const options = possible.filter((opt) => !(opt.x === -enemy.dirX && opt.y === -enemy.dirY));
  const pickFrom = options.length ? options : possible;
  const rnd = pickFrom[Math.floor(Math.random() * pickFrom.length)];
  return { x: rnd.x, y: rnd.y };
}

function updateEnemies() {
  if ((state.tick % state.enemyStepDelay) !== 0) return;

  for (const enemy of state.enemies) {
    const next = nextEnemyStep(enemy);
    enemy.dirX = next.x;
    enemy.dirY = next.y;
    tryMove(enemy, enemy.dirX, enemy.dirY);

    if (enemy.x === state.player.x && enemy.y === state.player.y) {
      state.gameOver = true;
      state.won = false;
    }
  }
}

function updateHud() {
  const left = state ? state.cups.size : 0;
  coffeeLeftEl.textContent = `Стаканчиков кофе осталось: ${left}`;

  if (!state || !state.gameOver) {
    statusTextEl.textContent = "Статус: В игре";
    statusTextEl.style.color = "#ebf1ff";
    return;
  }

  if (state.won) {
    statusTextEl.textContent = "Статус: Победа. Все стаканчики собраны";
    statusTextEl.style.color = "#7effb1";
  } else {
    statusTextEl.textContent = "Статус: Пойман листом статуса";
    statusTextEl.style.color = "#ff8ab0";
  }
}

function drawWall(x, y) {
  const px = x * TILE;
  const py = y * TILE;

  ctx.fillStyle = "#112045";
  ctx.fillRect(px, py, TILE, TILE);

  ctx.strokeStyle = "#2cd6ff";
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
}

function drawCup(x, y) {
  const px = x * TILE;
  const py = y * TILE;
  const bob = Math.sin(state.pulse + x * 0.4 + y * 0.2) * 2;

  const cupX = px + 11;
  const cupY = py + 8 + bob;
  const cupW = 18;
  const cupH = 24;

  ctx.fillStyle = "#f5efe4";
  ctx.fillRect(cupX, cupY + 3, cupW, cupH);

  ctx.fillStyle = "#ece2d3";
  ctx.fillRect(cupX - 1, cupY, cupW + 2, 5);

  ctx.fillStyle = "#2fa56f";
  ctx.fillRect(cupX + 3, cupY + 10, cupW - 6, 7);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.8;
  ctx.strokeRect(cupX, cupY + 3, cupW, cupH);

  ctx.fillStyle = "rgba(47, 165, 111, 0.26)";
  ctx.beginPath();
  ctx.arc(cupX + cupW / 2, cupY + cupH + 8, 9, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer() {
  const p = state.player;
  const px = p.x * TILE;
  const py = p.y * TILE;
  const dirX = p.nextDirX || p.dirX;
  const dirY = p.nextDirY || p.dirY;

  ctx.fillStyle = "rgba(32, 230, 255, 0.2)";
  ctx.beginPath();
  ctx.arc(px + TILE / 2, py + TILE / 2 + 11, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f4d0b4";
  ctx.beginPath();
  ctx.arc(px + TILE / 2, py + 10, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2c2f3f";
  ctx.fillRect(px + 12, py + 16, 16, 14);

  ctx.fillStyle = "#1a233b";
  ctx.fillRect(px + 12, py + 18, 16, 16);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(px + 15, py + 20, 10, 10);

  ctx.fillStyle = "#ff5a89";
  ctx.beginPath();
  ctx.moveTo(px + 20, py + 21);
  ctx.lineTo(px + 17, py + 28);
  ctx.lineTo(px + 20, py + 34);
  ctx.lineTo(px + 23, py + 28);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#1f2f57";
  ctx.fillRect(px + 9, py + 19, 3, 12);
  ctx.fillRect(px + 28, py + 19, 3, 12);

  if (dirX !== 0 || dirY !== 0) {
    const handX = px + 20 + dirX * 10;
    const handY = py + 24 + dirY * 6;
    ctx.fillStyle = "#f4d0b4";
    ctx.beginPath();
    ctx.arc(handX, handY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#3f2f24";
  if (dirX >= 0) {
    ctx.fillRect(px + 27, py + 24, 7, 9);
  } else {
    ctx.fillRect(px + 6, py + 24, 7, 9);
  }

  ctx.fillStyle = "#141824";
  ctx.fillRect(px + 14, py + 34, 5, 6);
  ctx.fillRect(px + 21, py + 34, 5, 6);
}

function drawEnemy(enemy) {
  const px = enemy.x * TILE;
  const py = enemy.y * TILE;

  ctx.fillStyle = "#fffefb";
  ctx.fillRect(px + 7, py + 5, TILE - 14, TILE - 10);

  ctx.strokeStyle = "#ff5a89";
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 7, py + 5, TILE - 14, TILE - 10);

  ctx.fillStyle = "#ff5a89";
  for (let i = 0; i < 3; i += 1) {
    ctx.fillRect(px + 11, py + 12 + i * 8, TILE - 22, 3);
  }
}

function drawOverlay() {
  if (!state.gameOver) return;

  ctx.fillStyle = "rgba(7, 10, 20, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = state.won ? "#7effb1" : "#ff7fa8";
  ctx.font = "bold 54px Avenir Next, Trebuchet MS, sans-serif";
  const title = state.won ? "ПОБЕДА" : "ПОРАЖЕНИЕ";
  const titleWidth = ctx.measureText(title).width;
  ctx.fillText(title, canvas.width / 2 - titleWidth / 2, canvas.height / 2 - 20);

  ctx.fillStyle = "#eaf1ff";
  ctx.font = "24px Avenir Next, Trebuchet MS, sans-serif";
  const subtitle = state.won ? "Ты собрал все стаканчики кофе" : "Статус тебя догнал";
  const subtitleWidth = ctx.measureText(subtitle).width;
  ctx.fillText(subtitle, canvas.width / 2 - subtitleWidth / 2, canvas.height / 2 + 24);

  ctx.font = "20px Avenir Next, Trebuchet MS, sans-serif";
  const hint = "Нажми кнопку 'Начать заново'";
  const hintWidth = ctx.measureText(hint).width;
  ctx.fillText(hint, canvas.width / 2 - hintWidth / 2, canvas.height / 2 + 62);
}

function render() {
  ctx.fillStyle = "#0a0f1e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      if (MAP[y][x] === "#") drawWall(x, y);
    }
  }

  for (const cup of state.cups) {
    const [x, y] = cup.split(",").map(Number);
    drawCup(x, y);
  }

  for (const enemy of state.enemies) drawEnemy(enemy);
  drawPlayer();
  drawOverlay();
}

function tick() {
  state.tick += 1;
  state.pulse += 0.08;

  if (!state.gameOver) {
    updatePlayer();
    updateEnemies();
    updateHud();
  }

  render();
  requestAnimationFrame(tick);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "arrowup" || key === "w") setDirection(0, -1);
  if (key === "arrowdown" || key === "s") setDirection(0, 1);
  if (key === "arrowleft" || key === "a") setDirection(-1, 0);
  if (key === "arrowright" || key === "d") setDirection(1, 0);
});

restartBtn.addEventListener("click", () => {
  initState();
});

initState();
requestAnimationFrame(tick);

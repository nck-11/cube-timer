const timerDisplay = document.querySelector("#timer");
const timerHint = document.querySelector("#timer-hint");
const timerButton = document.querySelector("#timer-button");
const timerFocus = document.querySelector(".timer-focus");
const scrambleDisplay = document.querySelector("#scramble");
const solvesList = document.querySelector("#solves-list");
const ao5Display = document.querySelector("#ao5");
const ao12Display = document.querySelector("#ao12");
const ao50Display = document.querySelector("#ao50");
const ao100Display = document.querySelector("#ao100");
const meanDisplay = document.querySelector("#mean");
const bestDisplay = document.querySelector("#best");
const worstDisplay = document.querySelector("#worst");
const solveCountDisplay = document.querySelector("#solve-count");
const sessionTabs = [...document.querySelectorAll(".timer-side-tab")];
const sessionPanels = [...document.querySelectorAll(".timer-tab-panel")];
const touchInput = window.matchMedia("(pointer: coarse)").matches;
const solvesStorageKey = "cube-timer-solves";
const cubeFaceElements = {
  up: document.querySelector(".cube-up"),
  left: document.querySelector(".cube-left"),
  front: document.querySelector(".cube-front"),
  right: document.querySelector(".cube-right"),
  back: document.querySelector(".cube-back"),
  down: document.querySelector(".cube-down")
};

const faces = ["R", "L", "U", "D", "F", "B"];
const modifiers = ["", "'", "2"];
const cubeMoves = {
  R: { axis: "x", layer: 1, direction: 1 },
  L: { axis: "x", layer: -1, direction: -1 },
  U: { axis: "y", layer: -1, direction: -1 },
  D: { axis: "y", layer: 1, direction: 1 },
  F: { axis: "z", layer: 1, direction: 1 },
  B: { axis: "z", layer: -1, direction: -1 }
};
const cubeFaceDirections = {
  front: [0, 0, 1],
  back: [0, 0, -1],
  right: [1, 0, 0],
  left: [-1, 0, 0],
  up: [0, -1, 0],
  down: [0, 1, 0]
};
const cubeFaceByDirection = {
  "0,0,1": "front",
  "0,0,-1": "back",
  "1,0,0": "right",
  "-1,0,0": "left",
  "0,-1,0": "up",
  "0,1,0": "down"
};
const solves = loadSolves();
let state = "idle";
let startTime = 0;
let touchPointer = null;
let ignoreTouchClick = false;
let currentScramble = "";
let activeScramble = "";
let armTimeout;
let animationFrame;
let spaceButtonTarget = null;

function loadSolves() {
  try {
    const savedSolves = localStorage.getItem(solvesStorageKey);
    if (savedSolves === null) return [];

    const parsedSolves = JSON.parse(savedSolves);
    if (!Array.isArray(parsedSolves)) {
      throw new TypeError("Saved solves must be an array.");
    }

    return parsedSolves.filter(
      (solve) =>
        solve &&
        Number.isFinite(solve.time) &&
        solve.time >= 0 &&
        typeof solve.scramble === "string"
    );
  } catch (error) {
    console.error("Could not load saved solve times.", error);
    return [];
  }
}

function saveSolves() {
  try {
    localStorage.setItem(solvesStorageKey, JSON.stringify(solves));
  } catch (error) {
    console.error("Could not save solve times.", error);
  }
}

function makeScramble() {
  const scramble = [];
  let previousFace = "";

  while (scramble.length < 20) {
    const face = faces[Math.floor(Math.random() * faces.length)];
    if (face === previousFace) continue;

    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(`${face}${modifier}`);
    previousFace = face;
  }

  return scramble.join(" ");
}

function createSolvedCubelets() {
  const cubelets = [];
  for (const x of [-1, 0, 1]) {
    for (const y of [-1, 0, 1]) {
      for (const z of [-1, 0, 1]) {
        if (x === 0 && y === 0 && z === 0) continue;

        const stickers = {};
        if (y === -1) stickers.up = "W";
        if (y === 1) stickers.down = "Y";
        if (x === -1) stickers.left = "o";
        if (x === 1) stickers.right = "r";
        if (z === -1) stickers.back = "b";
        if (z === 1) stickers.front = "g";
        cubelets.push({ x, y, z, stickers });
      }
    }
  }
  return cubelets;
}

function rotateCubeVector(x, y, z, axis, direction) {
  if (axis === "x") return direction > 0 ? [x, -z, y] : [x, z, -y];
  if (axis === "y") return direction > 0 ? [z, y, -x] : [-z, y, x];
  return direction > 0 ? [-y, x, z] : [y, -x, z];
}

function rotateCubelet(cubelet, axis, quarterTurns) {
  const direction = Math.sign(quarterTurns);
  for (let turn = 0; turn < Math.abs(quarterTurns); turn += 1) {
    [cubelet.x, cubelet.y, cubelet.z] = rotateCubeVector(
      cubelet.x,
      cubelet.y,
      cubelet.z,
      axis,
      direction
    );

    const rotatedStickers = {};
    Object.entries(cubelet.stickers).forEach(([face, color]) => {
      const directionVector = rotateCubeVector(...cubeFaceDirections[face], axis, direction);
      rotatedStickers[cubeFaceByDirection[directionVector.join(",")]] = color;
    });
    cubelet.stickers = rotatedStickers;
  }
}

function applyCubeMove(cubelets, notation) {
  const move = cubeMoves[notation[0]];
  const suffix = notation.slice(1);
  const quarterTurns = move.direction * (suffix === "2" ? 2 : suffix === "'" ? -1 : 1);
  cubelets
    .filter((cubelet) => cubelet[move.axis] === move.layer)
    .forEach((cubelet) => rotateCubelet(cubelet, move.axis, quarterTurns));
}

function netCell(face, cubelet) {
  switch (face) {
    case "up":
      return { row: cubelet.z + 1, column: cubelet.x + 1 };
    case "down":
      return { row: 1 - cubelet.z, column: cubelet.x + 1 };
    case "front":
      return { row: cubelet.y + 1, column: cubelet.x + 1 };
    case "back":
      return { row: cubelet.y + 1, column: 1 - cubelet.x };
    case "left":
      return { row: cubelet.y + 1, column: cubelet.z + 1 };
    case "right":
      return { row: cubelet.y + 1, column: 1 - cubelet.z };
    default:
      throw new Error(`Unknown cube face: ${face}`);
  }
}

function renderScrambledCube(scramble) {
  const cubelets = createSolvedCubelets();
  scramble.trim().split(/\s+/).filter(Boolean).forEach((move) => applyCubeMove(cubelets, move));

  const stickersByFace = Object.fromEntries(
    Object.keys(cubeFaceElements).map((face) => [face, Array(9).fill(null)])
  );
  cubelets.forEach((cubelet) => {
    Object.entries(cubelet.stickers).forEach(([face, color]) => {
      const { row, column } = netCell(face, cubelet);
      stickersByFace[face][row * 3 + column] = color;
    });
  });

  Object.entries(stickersByFace).forEach(([face, stickers]) => {
    if (stickers.some((color) => color === null)) {
      throw new Error(`Cube face ${face} is missing stickers after scramble.`);
    }

    cubeFaceElements[face].replaceChildren(
      ...stickers.map((color) => {
        const sticker = document.createElement("span");
        sticker.className = "cube-sticker";
        sticker.dataset.color = color;
        return sticker;
      })
    );
  });
}

function formatTime(milliseconds) {
  return (milliseconds / 1000).toFixed(3);
}

function calculateAverage(count) {
  if (solves.length < count) return null;

  const recentSolves = solves
    .slice(0, count)
    .map((solve) => solve.time)
    .sort((a, b) => a - b);
  const middleSolves = recentSolves.slice(1, -1);
  return middleSolves.reduce((total, time) => total + time, 0) / middleSolves.length;
}

function renderAverages() {
  const ao5 = calculateAverage(5);
  const ao12 = calculateAverage(12);
  const ao50 = calculateAverage(50);
  const ao100 = calculateAverage(100);
  const mean = solves.length
    ? solves.reduce((total, solve) => total + solve.time, 0) / solves.length
    : null;
  const best = solves.reduce(
    (fastest, solve) => Math.min(fastest, solve.time),
    Number.POSITIVE_INFINITY
  );
  const worst = solves.reduce(
    (slowest, solve) => Math.max(slowest, solve.time),
    0
  );

  ao5Display.textContent = ao5 === null ? "--" : formatTime(ao5);
  ao12Display.textContent = ao12 === null ? "--" : formatTime(ao12);
  ao50Display.textContent = ao50 === null ? "--" : formatTime(ao50);
  ao100Display.textContent = ao100 === null ? "--" : formatTime(ao100);
  meanDisplay.textContent = mean === null ? "--" : formatTime(mean);
  bestDisplay.textContent = solves.length ? formatTime(best) : "--";
  worstDisplay.textContent = solves.length ? formatTime(worst) : "--";
  solveCountDisplay.textContent = String(solves.length);
}

function setTimerState(nextState) {
  const previousState = state;
  state = nextState;
  timerDisplay.classList.toggle("is-arming", state === "arming");
  timerDisplay.classList.toggle("is-armed", state === "armed");
  timerButton.textContent = state === "running" ? "Stop timer" : "Start timer";

  if (state === "idle") {
    timerHint.textContent = touchInput
      ? "Tap Start to begin, tap Stop to finish"
      : "Hold space, then release to start";
  }
  if (state === "arming") timerHint.textContent = "Keep holding…";
  if (state === "armed") {
    timerDisplay.textContent = "Ready";
    timerDisplay.setAttribute("aria-label", "Ready to start");
    timerHint.textContent = "Release to start";
  }
  if (state === "running") {
    timerHint.textContent = touchInput ? "Tap Stop to finish" : "Press space or tap to stop";
  }

  if (previousState === "armed" && state !== "armed") {
    timerDisplay.textContent = "0.000";
    timerDisplay.setAttribute("aria-label", "0 seconds");
  }
}

function updateTimer() {
  const elapsed = performance.now() - startTime;
  const time = formatTime(elapsed);
  timerDisplay.textContent = time;
  timerDisplay.setAttribute("aria-label", `${time} seconds`);
  animationFrame = requestAnimationFrame(updateTimer);
}

function renderSolves() {
  solvesList.replaceChildren();
  renderAverages();

  if (solves.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "empty-state";
    emptyState.textContent = "Your solve times will show up here.";
    solvesList.append(emptyState);
    return;
  }

  solves.forEach((solve, index) => {
    const item = document.createElement("li");
    const details = document.createElement("div");
    const heading = document.createElement("div");
    const number = document.createElement("span");
    const scramble = document.createElement("span");
    const actions = document.createElement("div");
    const result = document.createElement("span");
    const deleteButton = document.createElement("button");

    details.className = "solve-details";
    heading.className = "solve-heading";
    number.className = "solve-number";
    number.textContent = `Solve ${solves.length - index}`;
    scramble.className = "solve-scramble";
    scramble.textContent = solve.scramble;
    heading.append(number);
    details.append(heading, scramble);

    actions.className = "solve-actions";
    result.className = "solve-time";
    result.textContent = `${formatTime(solve.time)} s`;
    deleteButton.className = "delete-solve";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete solve ${solves.length - index}`);
    deleteButton.addEventListener("click", () => {
      solves.splice(index, 1);
      saveSolves();
      renderSolves();
    });
    actions.append(result, deleteButton);
    item.append(details, actions);
    solvesList.append(item);
  });
}

function selectSessionTab(tab) {
  const panelId = tab.getAttribute("aria-controls");
  sessionTabs.forEach((item) => {
    const selected = item === tab;
    item.classList.toggle("is-selected", selected);
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  sessionPanels.forEach((panel) => {
    panel.hidden = panel.id !== panelId;
  });
}

sessionTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectSessionTab(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % sessionTabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + sessionTabs.length) % sessionTabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = sessionTabs.length - 1;
    else return;

    event.preventDefault();
    sessionTabs[nextIndex].focus();
    selectSessionTab(sessionTabs[nextIndex]);
  });
});

function startTimer(time = performance.now()) {
  startTime = time;
  activeScramble = currentScramble;
  setTimerState("running");
  updateTimer();
}

function stopTimer(time = performance.now()) {
  if (state !== "running") return;

  const elapsed = time - startTime;
  cancelAnimationFrame(animationFrame);
  timerDisplay.textContent = formatTime(elapsed);
  timerDisplay.setAttribute("aria-label", `${formatTime(elapsed)} seconds`);
  solves.unshift({ time: elapsed, scramble: activeScramble });
  saveSolves();
  setTimerState("idle");
  renderSolves();
}

function handleSpaceDown(event) {
  if (event.code !== "Space") return;

  if (event.target instanceof HTMLButtonElement) {
    if (event.target !== timerButton) return;
    event.preventDefault();
    if (event.repeat) return;
    spaceButtonTarget = event.target;
    return;
  }

  event.preventDefault();
  if (event.repeat) return;

  if (state === "running") {
    stopTimer();
    return;
  }

  if (state !== "idle") return;

  setTimerState("arming");
  armTimeout = window.setTimeout(() => setTimerState("armed"), 300);
}

function handleSpaceUp(event) {
  if (event.code !== "Space") return;

  if (spaceButtonTarget) {
    event.preventDefault();
    spaceButtonTarget.click();
    spaceButtonTarget = null;
    return;
  }

  if (event.target instanceof HTMLButtonElement) return;
  event.preventDefault();
  window.clearTimeout(armTimeout);

  if (state === "armed") startTimer();
  else if (state === "arming") setTimerState("idle");
}

document.addEventListener("keydown", handleSpaceDown);
document.addEventListener("keyup", handleSpaceUp);
window.addEventListener("blur", () => {
  window.clearTimeout(armTimeout);
  spaceButtonTarget = null;
  if (state === "arming" || state === "armed") setTimerState("idle");
});

timerFocus.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "touch" || !event.isPrimary) {
    ignoreTouchClick = false;
    return;
  }

  ignoreTouchClick = false;
  touchPointer = {
    id: event.pointerId,
    action: state === "running" ? "stop" : state === "idle" ? "start" : null,
    buttonTarget: timerButton.contains(event.target)
  };

  if (touchPointer.action === "stop") {
    stopTimer();
    ignoreTouchClick = touchPointer.buttonTarget;
  }
});

timerFocus.addEventListener("pointerup", (event) => {
  if (!touchPointer || touchPointer.id !== event.pointerId) return;

  if (touchPointer.action === "start" && state === "idle") startTimer();
  ignoreTouchClick = touchPointer.buttonTarget;
  touchPointer = null;
});

window.addEventListener("pointerup", (event) => {
  if (!touchPointer || touchPointer.id !== event.pointerId) return;

  touchPointer = null;
  ignoreTouchClick = false;
});

window.addEventListener("pointercancel", (event) => {
  if (!touchPointer || touchPointer.id !== event.pointerId) return;

  touchPointer = null;
  ignoreTouchClick = false;
});

timerButton.addEventListener("click", (event) => {
  if (ignoreTouchClick && event.detail > 0) {
    ignoreTouchClick = false;
    return;
  }

  if (state === "running") stopTimer();
  else if (state === "idle") startTimer();
});

document.querySelector("#new-scramble").addEventListener("click", () => {
  currentScramble = makeScramble();
  scrambleDisplay.textContent = currentScramble;
  renderScrambledCube(currentScramble);
});

currentScramble = makeScramble();
setTimerState("idle");
scrambleDisplay.textContent = currentScramble;
renderScrambledCube(currentScramble);
renderSolves();

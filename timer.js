const timerDisplay = document.querySelector("#timer");
const timerHint = document.querySelector("#timer-hint");
const timerButton = document.querySelector("#timer-button");
const scrambleDisplay = document.querySelector("#scramble");
const solvesList = document.querySelector("#solves-list");
const ao5Display = document.querySelector("#ao5");
const ao12Display = document.querySelector("#ao12");

const faces = ["R", "L", "U", "D", "F", "B"];
const modifiers = ["", "'", "2"];
const solves = [];
let state = "idle";
let startTime = 0;
let currentScramble = "";
let activeScramble = "";
let armTimeout;
let animationFrame;

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

function formatTime(milliseconds) {
  return (milliseconds / 1000).toFixed(2);
}

function formatAverage(milliseconds) {
  const centiseconds = Math.floor(milliseconds / 10);
  return (centiseconds / 100).toFixed(2);
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
  ao5Display.textContent = ao5 === null ? "--" : `${formatAverage(ao5)} s`;
  ao12Display.textContent = ao12 === null ? "--" : `${formatAverage(ao12)} s`;
}

function setTimerState(nextState) {
  const previousState = state;
  state = nextState;
  timerDisplay.classList.toggle("is-arming", state === "arming");
  timerDisplay.classList.toggle("is-armed", state === "armed");
  timerButton.textContent = state === "running" ? "Stop timer" : "Start timer";

  if (state === "idle") timerHint.textContent = "Hold space, then release to start";
  if (state === "arming") timerHint.textContent = "Keep holding…";
  if (state === "armed") {
    timerDisplay.textContent = "Ready";
    timerDisplay.setAttribute("aria-label", "Ready to start");
    timerHint.textContent = "Release to start";
  }
  if (state === "running") timerHint.textContent = "Press space or tap to stop";

  if (previousState === "armed" && state !== "armed") {
    timerDisplay.textContent = "0.00";
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
      renderSolves();
    });
    actions.append(result, deleteButton);
    item.append(details, actions);
    solvesList.append(item);
  });
}

function startTimer() {
  startTime = performance.now();
  activeScramble = currentScramble;
  setTimerState("running");
  updateTimer();
}

function stopTimer() {
  if (state !== "running") return;

  const elapsed = performance.now() - startTime;
  cancelAnimationFrame(animationFrame);
  timerDisplay.textContent = formatTime(elapsed);
  timerDisplay.setAttribute("aria-label", `${formatTime(elapsed)} seconds`);
  solves.unshift({ time: elapsed, scramble: activeScramble });
  setTimerState("idle");
  renderSolves();
}

function handleSpaceDown(event) {
  if (event.code !== "Space" || event.repeat || event.target instanceof HTMLButtonElement) return;
  event.preventDefault();

  if (state === "running") {
    stopTimer();
    return;
  }

  if (state !== "idle") return;

  setTimerState("arming");
  armTimeout = window.setTimeout(() => setTimerState("armed"), 300);
}

function handleSpaceUp(event) {
  if (event.code !== "Space" || event.target instanceof HTMLButtonElement) return;
  event.preventDefault();
  window.clearTimeout(armTimeout);

  if (state === "armed") startTimer();
  else if (state === "arming") setTimerState("idle");
}

document.addEventListener("keydown", handleSpaceDown);
document.addEventListener("keyup", handleSpaceUp);
window.addEventListener("blur", () => {
  window.clearTimeout(armTimeout);
  if (state === "arming" || state === "armed") setTimerState("idle");
});

timerButton.addEventListener("click", () => {
  if (state === "running") stopTimer();
  else if (state === "idle") startTimer();
});

document.querySelector("#new-scramble").addEventListener("click", () => {
  currentScramble = makeScramble();
  scrambleDisplay.textContent = currentScramble;
});

currentScramble = makeScramble();
scrambleDisplay.textContent = currentScramble;
renderSolves();

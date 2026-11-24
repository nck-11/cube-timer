import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { supabaseConfig } from "./supabase-config.js";

const notice = document.querySelector("#duel-notice");
const setupNote = document.querySelector(".duel-setup-note");
const lobby = document.querySelector("#duel-lobby");
const room = document.querySelector("#duel-room");
const createForm = document.querySelector("#create-duel-form");
const joinForm = document.querySelector("#join-duel-form");
const joinCodeInput = document.querySelector("#duel-code-input");
const roomCodeDisplay = document.querySelector("#duel-room-code");
const matchStatus = document.querySelector("#duel-match-status");
const roundLabel = document.querySelector("#duel-round-label");
const scrambleDisplay = document.querySelector("#duel-scramble");
const timerDisplay = document.querySelector("#duel-timer");
const timerHint = document.querySelector("#duel-timer-hint");
const timerButton = document.querySelector("#duel-timer-button");
const resultsBody = document.querySelector("#duel-results-body");
const playerOneHeading = document.querySelector("#duel-player-one-heading");
const playerTwoHeading = document.querySelector("#duel-player-two-heading");
const playerOneAverage = document.querySelector("#duel-player-one-average");
const playerTwoAverage = document.querySelector("#duel-player-two-average");
const winnerDisplay = document.querySelector("#duel-winner");
const copyCodeButton = document.querySelector("#copy-duel-code");

const participantStoragePrefix = "cube-duel-participant:";
const faces = ["R", "L", "U", "D", "F", "B"];
const modifiers = ["", "'", "2"];
const touchInput = window.matchMedia("(pointer: coarse)").matches;
const supabase =
  supabaseConfig.url && supabaseConfig.publishableKey
    ? createClient(supabaseConfig.url, supabaseConfig.publishableKey)
    : null;

setupNote.hidden = Boolean(supabase);

let participant = null;
let duelState = null;
let pollTimer = null;
let timerStart = 0;
let timerFrame = 0;
let timerState = "idle";
let isSubmitting = false;
let pendingTime = null;
let spaceArmingTimer = 0;
let spaceButtonTarget = null;

function setNotice(message, isError = false) {
  notice.textContent = message;
  notice.classList.toggle("is-error", isError);
}

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Online duels are not configured yet. Add your Supabase project URL and publishable key to supabase-config.js."
    );
  }
}

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ");
}

function makeScrambles() {
  return Array.from({ length: 5 }, () => {
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
  });
}

function createSecret() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashSecret(secret) {
  const bytes = new TextEncoder().encode(secret);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function storeParticipant(code, nextParticipant) {
  localStorage.setItem(
    `${participantStoragePrefix}${code}`,
    JSON.stringify(nextParticipant)
  );
}

function loadParticipant(code) {
  const storedParticipant = localStorage.getItem(
    `${participantStoragePrefix}${code}`
  );
  if (!storedParticipant) return null;

  const parsedParticipant = JSON.parse(storedParticipant);
  if (
    typeof parsedParticipant.name !== "string" ||
    typeof parsedParticipant.secret !== "string" ||
    ![1, 2].includes(parsedParticipant.playerNumber)
  ) {
    throw new TypeError("Saved duel participant details are invalid.");
  }
  return parsedParticipant;
}

function getResultTime(round, playerNumber) {
  return duelState.results.find(
    (result) => result.round === round && result.player === playerNumber
  )?.timeMs;
}

function canSolve() {
  return (
    duelState?.status === "active" &&
    duelState.activePlayer === participant?.playerNumber
  );
}

function formatTime(milliseconds) {
  return `${(milliseconds / 1000).toFixed(3)} s`;
}

function calculateAo5(playerNumber) {
  const times = duelState.results
    .filter((result) => result.player === playerNumber)
    .map((result) => result.timeMs);
  if (times.length !== 5) return null;

  times.sort((first, second) => first - second);
  return times.slice(1, 4).reduce((total, time) => total + time, 0) / 3;
}

function renderResults() {
  const names = [duelState.player1Name, duelState.player2Name || "Waiting…"];
  playerOneHeading.textContent = names[0];
  playerTwoHeading.textContent = names[1];
  resultsBody.replaceChildren();

  for (let round = 1; round <= 5; round += 1) {
    const row = document.createElement("tr");
    const roundCell = document.createElement("th");
    const playerOneCell = document.createElement("td");
    const playerTwoCell = document.createElement("td");
    roundCell.scope = "row";
    roundCell.textContent = `Scramble ${round}`;
    playerOneCell.textContent = getResultTime(round, 1)
      ? formatTime(getResultTime(round, 1))
      : "--";
    playerTwoCell.textContent = getResultTime(round, 2)
      ? formatTime(getResultTime(round, 2))
      : "--";
    row.append(roundCell, playerOneCell, playerTwoCell);
    resultsBody.append(row);
  }

  const firstAverage = calculateAo5(1);
  const secondAverage = calculateAo5(2);
  playerOneAverage.textContent =
    firstAverage === null ? "--" : formatTime(firstAverage);
  playerTwoAverage.textContent =
    secondAverage === null ? "--" : formatTime(secondAverage);

  if (duelState.status !== "finished") {
    winnerDisplay.textContent = "";
    return;
  }

  if (firstAverage === secondAverage) {
    winnerDisplay.textContent = "It's a tie!";
  } else {
    const winnerName =
      firstAverage < secondAverage ? names[0] : names[1];
    winnerDisplay.textContent = `${winnerName} wins!`;
  }
}

function renderTimerControls() {
  const isMyTurn = canSolve();
  const timerAvailable = duelState?.status === "active" && isMyTurn;
  const playerName =
    duelState?.activePlayer === 1
      ? duelState.player1Name
      : duelState?.player2Name;

  timerDisplay.hidden = !timerAvailable;
  timerButton.hidden = !timerAvailable;
  timerButton.disabled = !timerAvailable || isSubmitting;
  timerDisplay.classList.toggle("is-arming", timerState === "arming");
  timerDisplay.classList.toggle("is-armed", timerState === "armed");

  if (!duelState || duelState.status === "waiting") {
    timerHint.textContent = "Share the room code with your opponent.";
  } else if (duelState.status === "finished") {
    timerHint.textContent = "The final result is saved in this room.";
  } else if (isSubmitting) {
    timerHint.textContent = "Submitting your time to the duel.";
  } else if (pendingTime !== null) {
    timerHint.textContent = "Your solve is ready to retry.";
  } else if (timerState === "arming") {
    timerHint.textContent = "Keep holding…";
  } else if (timerState === "armed") {
    timerHint.textContent = "Release to start";
  } else if (timerState === "running") {
    timerHint.textContent = touchInput
      ? "Tap Stop to finish"
      : "Press Space or tap to stop";
  } else if (isMyTurn) {
    timerHint.textContent = touchInput
      ? "Tap Start to begin, tap Stop to finish"
      : "Hold Space, then release to start";
  } else {
    timerHint.textContent = `Waiting for ${playerName} to solve.`;
  }

  timerButton.textContent = isSubmitting
    ? "Saving solve…"
    : pendingTime !== null
      ? "Retry submit"
      : timerState === "running"
        ? "Stop solve"
        : timerState === "arming"
          ? "Keep holding…"
          : timerState === "armed"
            ? "Release to start"
        : "Start solve";
}

function renderDuel() {
  if (!duelState || !participant) return;

  const code = duelState.code;
  const currentRound = duelState.roundNumber;
  const isMyTurn = canSolve();

  if (
    (duelState.status !== "active" || !isMyTurn) &&
    (timerState === "arming" || timerState === "armed")
  ) {
    window.clearTimeout(spaceArmingTimer);
    spaceArmingTimer = 0;
    setTimerState("idle");
  }

  lobby.hidden = true;
  room.hidden = false;
  roomCodeDisplay.textContent = code;
  renderResults();

  if (duelState.status === "waiting") {
    matchStatus.textContent = "Waiting for a second player to join.";
    roundLabel.textContent = "Ready when both players have joined";
    scrambleDisplay.textContent = "The shared scrambles will appear when the duel starts.";
    renderTimerControls();
    return;
  }

  if (duelState.status === "finished") {
    matchStatus.textContent = "Duel complete.";
    roundLabel.textContent = "All five scrambles are done";
    scrambleDisplay.textContent = "Compare your trimmed Ao5 averages below.";
    renderTimerControls();
    return;
  }

  const playerName =
    duelState.activePlayer === 1
      ? duelState.player1Name
      : duelState.player2Name;
  const nextScramble = duelState.scrambles[currentRound - 1];
  const firstPlayerThisRound = currentRound % 2 === 1 ? 1 : 2;
  const firstName =
    firstPlayerThisRound === 1
      ? duelState.player1Name
      : duelState.player2Name;

  matchStatus.textContent = isMyTurn
    ? "It’s your turn. Solve the scramble shown below."
    : `Waiting for ${playerName} to solve.`;
  roundLabel.textContent = `Scramble ${currentRound} of 5 · ${firstName} goes first`;
  scrambleDisplay.textContent = nextScramble;
  renderTimerControls();
}

async function refreshDuel() {
  if (!participant || !supabase) return;

  const { data, error } = await supabase.rpc("duel_get_state", {
    p_code: participant.code,
    p_secret_hash: await hashSecret(participant.secret)
  });
  if (error) throw error;

  duelState = data;
  renderDuel();
}

function startPolling() {
  window.clearInterval(pollTimer);
  pollTimer = window.setInterval(() => {
    refreshDuel().catch((error) => {
      setNotice(error.message || "Could not refresh the duel.", true);
    });
  }, 1500);
}

function showParticipant(nextParticipant) {
  participant = nextParticipant;
  setNotice("");
  refreshDuel()
    .then(startPolling)
    .catch((error) => setNotice(error.message || "Could not open the duel.", true));
}

function setTimerState(nextState) {
  const previousState = timerState;
  timerState = nextState;
  timerDisplay.classList.toggle("is-arming", timerState === "arming");
  timerDisplay.classList.toggle("is-armed", timerState === "armed");

  if (timerState === "armed") {
    timerDisplay.textContent = "Ready";
    timerDisplay.setAttribute("aria-label", "Ready to start");
  } else if (previousState === "armed") {
    timerDisplay.textContent = "0.000";
    timerDisplay.setAttribute("aria-label", "0 seconds");
  }

  renderTimerControls();
}

function updateTimer() {
  if (timerState !== "running") return;
  const elapsed = performance.now() - timerStart;
  timerDisplay.textContent = (elapsed / 1000).toFixed(3);
  timerDisplay.setAttribute("aria-label", `${timerDisplay.textContent} seconds`);
  timerFrame = requestAnimationFrame(updateTimer);
}

async function stopTimer() {
  if (timerState !== "running" || !participant) return;

  cancelAnimationFrame(timerFrame);
  pendingTime = Math.max(1, Math.round(performance.now() - timerStart));
  timerDisplay.textContent = (pendingTime / 1000).toFixed(3);
  timerDisplay.setAttribute("aria-label", `${timerDisplay.textContent} seconds`);
  setTimerState("idle");
  await submitPendingTime();
}

async function submitPendingTime() {
  if (!participant || pendingTime === null) return;

  isSubmitting = true;
  renderTimerControls();

  try {
    const { data, error } = await supabase.rpc("duel_submit_time", {
      p_code: participant.code,
      p_secret_hash: await hashSecret(participant.secret),
      p_time_ms: pendingTime
    });
    if (error) throw error;

    pendingTime = null;
    isSubmitting = false;
    timerDisplay.textContent = "0.000";
    timerDisplay.setAttribute("aria-label", "0 seconds");
    duelState = data;
    renderDuel();
  } catch (error) {
    isSubmitting = false;
    renderDuel();
    throw error;
  }
}

function toggleTimer() {
  if (!canSolve() || isSubmitting) return;

  if (pendingTime !== null) {
    submitPendingTime().catch((error) => {
      setNotice(error.message || "Could not save your solve.", true);
    });
    return;
  }

  if (timerState === "running") {
    stopTimer().catch((error) => {
      setNotice(error.message || "Could not save your solve.", true);
    });
    return;
  }

  if (timerState !== "idle") return;

  timerStart = performance.now();
  setTimerState("running");
  updateTimer();
}

async function createDuel(event) {
  event.preventDefault();
  try {
    requireSupabase();
    const name = normalizeName(new FormData(createForm).get("username"));
    const secret = createSecret();
    const { data: code, error } = await supabase.rpc("duel_create", {
      p_player_name: name,
      p_scrambles: makeScrambles(),
      p_secret_hash: await hashSecret(secret)
    });
    if (error) throw error;

    const nextParticipant = { code, name, secret, playerNumber: 1 };
    storeParticipant(code, nextParticipant);
    const url = new URL(window.location.href);
    url.searchParams.set("code", code);
    window.history.replaceState(null, "", url);
    showParticipant(nextParticipant);
  } catch (error) {
    setNotice(error.message || "Could not create the duel.", true);
  }
}

async function joinDuel(event) {
  event.preventDefault();
  try {
    requireSupabase();
    const formData = new FormData(joinForm);
    const name = normalizeName(formData.get("username"));
    const code = String(formData.get("code")).trim().toUpperCase();
    const secret = createSecret();
    const { error } = await supabase.rpc("duel_join", {
      p_code: code,
      p_player_name: name,
      p_secret_hash: await hashSecret(secret)
    });
    if (error) throw error;

    const nextParticipant = { code, name, secret, playerNumber: 2 };
    storeParticipant(code, nextParticipant);
    const url = new URL(window.location.href);
    url.searchParams.set("code", code);
    window.history.replaceState(null, "", url);
    showParticipant(nextParticipant);
  } catch (error) {
    setNotice(error.message || "Could not join the duel.", true);
  }
}

function handleSpaceDown(event) {
  if (event.code !== "Space") return;
  const target = event.target;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable
  ) {
    return;
  }

  if (target instanceof HTMLButtonElement) {
    if (target !== timerButton) return;
    event.preventDefault();
    if (event.repeat) return;
    spaceButtonTarget = target;
  }

  event.preventDefault();
  if (event.repeat || !canSolve() || pendingTime !== null) return;

  if (timerState === "running") {
    toggleTimer();
    return;
  }

  if (timerState !== "idle") return;

  setTimerState("arming");
  spaceArmingTimer = window.setTimeout(() => {
    spaceArmingTimer = 0;
    if (!canSolve() || timerState !== "arming") return;
    setTimerState("armed");
  }, 300);
}

function handleSpaceUp(event) {
  if (event.code !== "Space") return;

  if (spaceButtonTarget) {
    event.preventDefault();
    spaceButtonTarget = null;
    window.clearTimeout(spaceArmingTimer);
    spaceArmingTimer = 0;
    if (timerState === "armed") {
      timerStart = performance.now();
      setTimerState("running");
      updateTimer();
    } else if (timerState === "arming") {
      setTimerState("idle");
    }
    return;
  }

  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement ||
    event.target instanceof HTMLButtonElement ||
    event.target.isContentEditable
  ) {
    return;
  }

  event.preventDefault();
  window.clearTimeout(spaceArmingTimer);
  spaceArmingTimer = 0;
  if (timerState === "armed") {
    timerStart = performance.now();
    setTimerState("running");
    updateTimer();
  } else if (timerState === "arming") {
    setTimerState("idle");
  }
}

createForm.addEventListener("submit", createDuel);
joinForm.addEventListener("submit", joinDuel);
timerButton.addEventListener("click", toggleTimer);
document.addEventListener("keydown", handleSpaceDown);
document.addEventListener("keyup", handleSpaceUp);
window.addEventListener("blur", () => {
  window.clearTimeout(spaceArmingTimer);
  spaceArmingTimer = 0;
  spaceButtonTarget = null;
  if (timerState === "arming" || timerState === "armed") {
    setTimerState("idle");
  }
});

copyCodeButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(duelState.code);
    setNotice("Room code copied.");
  } catch (error) {
    setNotice("Could not copy the room code. Select and copy it instead.", true);
  }
});

const codeFromUrl = new URLSearchParams(window.location.search)
  .get("code")
  ?.trim()
  .toUpperCase();

if (codeFromUrl) {
  joinCodeInput.value = codeFromUrl;
  try {
    const savedParticipant = loadParticipant(codeFromUrl);
    if (savedParticipant) {
      savedParticipant.code = codeFromUrl;
      showParticipant(savedParticipant);
    }
  } catch (error) {
    setNotice(error.message || "Could not restore the duel.", true);
  }
}

if (!supabase) {
  setNotice(
    "Set up Supabase first: run supabase-setup.sql, then add your project URL and publishable key to supabase-config.js.",
    true
  );
}

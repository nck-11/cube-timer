import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { supabaseConfig } from "./supabase-config.js";

const notice = document.querySelector("#duel-notice");
const setupNote = document.querySelector(".duel-setup-note");
const lobby = document.querySelector("#duel-lobby");
const room = document.querySelector("#duel-room");
const createForm = document.querySelector("#create-duel-form");
const publicCreateForm = document.querySelector("#create-public-duel-form");
const publicPlayerNameInput = document.querySelector("#public-player-name");
const publicRoomList = document.querySelector("#public-room-list");
const refreshPublicRoomsButton = document.querySelector("#refresh-public-rooms");
const joinForm = document.querySelector("#join-duel-form");
const joinCodeInput = document.querySelector("#duel-code-input");
const roomCodeDisplay = document.querySelector("#duel-room-code");
const roomVisibilityDisplay = document.querySelector("#duel-room-visibility");
const matchStatus = document.querySelector("#duel-match-status");
const roundLabel = document.querySelector("#duel-round-label");
const scrambleDisplay = document.querySelector("#duel-scramble");
const timerDisplay = document.querySelector("#duel-timer");
const timerFocus = document.querySelector(".duel-screen .timer-focus");
const cubePreview = document.querySelector("#duel-cube-preview");
const cubeFaceElements = {
  up: document.querySelector(".duel-cube-preview .cube-up"),
  left: document.querySelector(".duel-cube-preview .cube-left"),
  front: document.querySelector(".duel-cube-preview .cube-front"),
  right: document.querySelector(".duel-cube-preview .cube-right"),
  back: document.querySelector(".duel-cube-preview .cube-back"),
  down: document.querySelector(".duel-cube-preview .cube-down")
};
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
let renderedCubeScramble = "";
let isJoiningPublicRoom = false;
let spaceArmingTimer = 0;
let spaceButtonTarget = null;
let touchPointer = null;
let ignoreTouchClick = false;

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

function storeParticipant(roomKey, nextParticipant) {
  localStorage.setItem(
    `${participantStoragePrefix}${roomKey}`,
    JSON.stringify(nextParticipant)
  );
}

function loadParticipant(roomKey) {
  const storedParticipant = localStorage.getItem(
    `${participantStoragePrefix}${roomKey}`
  );
  if (!storedParticipant) return null;

  const parsedParticipant = JSON.parse(storedParticipant);
  if (
    typeof parsedParticipant.name !== "string" ||
    typeof parsedParticipant.secret !== "string" ||
    ![1, 2].includes(parsedParticipant.playerNumber) ||
    (parsedParticipant.isPublic === true &&
      (typeof parsedParticipant.publicRoomId !== "string" ||
        typeof parsedParticipant.code !== "string"))
  ) {
    throw new TypeError("Saved duel participant details are invalid.");
  }
  return { ...parsedParticipant, isPublic: parsedParticipant.isPublic === true };
}

function renderPublicRooms(rooms) {
  publicRoomList.replaceChildren();

  if (!Array.isArray(rooms)) {
    throw new TypeError("The public room list response is invalid.");
  }

  if (rooms.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "duel-public-empty";
    emptyMessage.textContent = "No open public rooms. Create one to get started.";
    publicRoomList.append(emptyMessage);
    return;
  }

  rooms.forEach((roomInfo) => {
    if (
      typeof roomInfo.id !== "string" ||
      typeof roomInfo.player1Name !== "string"
    ) {
      throw new TypeError("A public room entry is invalid.");
    }

    const roomItem = document.createElement("div");
    const roomDetails = document.createElement("div");
    const ownerName = document.createElement("strong");
    const roomState = document.createElement("span");
    const joinButton = document.createElement("button");

    roomItem.className = "duel-public-room";
    roomItem.setAttribute("role", "listitem");
    roomDetails.className = "duel-public-room-details";
    ownerName.className = "duel-public-room-owner";
    ownerName.textContent = roomInfo.player1Name;
    roomState.className = "duel-public-room-state";
    roomState.textContent = "Waiting for an opponent";
    joinButton.className = "duel-secondary-button";
    joinButton.type = "button";
    joinButton.dataset.roomId = roomInfo.id;
    joinButton.textContent = "Join";

    roomDetails.append(ownerName, roomState);
    roomItem.append(roomDetails, joinButton);
    publicRoomList.append(roomItem);
  });
}

async function refreshPublicRooms() {
  if (!supabase || lobby.hidden) return;

  try {
    const { data, error } = await supabase.rpc("duel_list_public_rooms");
    if (error) throw error;
    renderPublicRooms(data);
  } catch (error) {
    const errorMessage = document.createElement("p");
    errorMessage.className = "duel-public-empty is-error";
    errorMessage.textContent =
      error.message || "Could not load public rooms. Try refreshing.";
    publicRoomList.replaceChildren(errorMessage);
  }
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
    timerHint.textContent =
      participant?.isPublic === true
        ? "Your public room is open for another player to join."
        : "Share the private room code with your opponent.";
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
      ? "Hold to get ready, release to start"
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
    touchPointer = null;
    setTimerState("idle");
  }

  lobby.hidden = true;
  room.hidden = false;
  roomCodeDisplay.textContent = code;
  const isPublicRoom = participant.isPublic === true;
  roomVisibilityDisplay.textContent = isPublicRoom ? "PUBLIC ROOM" : "PRIVATE ROOM";
  roomCodeDisplay.hidden = isPublicRoom;
  copyCodeButton.hidden = isPublicRoom;
  renderResults();

  if (duelState.status === "waiting") {
    cubePreview.hidden = true;
    matchStatus.textContent = "Waiting for a second player to join.";
    roundLabel.textContent = "Ready when both players have joined";
    scrambleDisplay.textContent = "The shared scrambles will appear when the duel starts.";
    renderTimerControls();
    return;
  }

  if (duelState.status === "finished") {
    cubePreview.hidden = true;
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
  cubePreview.hidden = false;
  if (renderedCubeScramble !== nextScramble) {
    window.CubePreview.render(nextScramble, cubeFaceElements);
    renderedCubeScramble = nextScramble;
  }
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

async function createDuel(event, isPublic = false) {
  event.preventDefault();
  try {
    requireSupabase();
    const activeForm = isPublic ? publicCreateForm : createForm;
    const name = normalizeName(new FormData(activeForm).get("username"));
    const secret = createSecret();
    const rpcName = isPublic ? "duel_create_public" : "duel_create";
    const { data, error } = await supabase.rpc(rpcName, {
      p_player_name: name,
      p_scrambles: makeScrambles(),
      p_secret_hash: await hashSecret(secret)
    });
    if (error) throw error;

    const code = isPublic ? data?.code : data;
    const publicRoomId = isPublic ? data?.id : null;
    if (
      typeof code !== "string" ||
      (isPublic && typeof publicRoomId !== "string")
    ) {
      throw new TypeError("The duel creation response is invalid.");
    }

    const nextParticipant = {
      code,
      name,
      secret,
      playerNumber: 1,
      isPublic,
      publicRoomId
    };
    storeParticipant(isPublic ? publicRoomId : code, nextParticipant);
    const url = new URL(window.location.href);
    url.searchParams.delete("code");
    url.searchParams.delete("public");
    url.searchParams.set(
      isPublic ? "public" : "code",
      isPublic ? publicRoomId : code
    );
    window.history.replaceState(null, "", url);
    showParticipant(nextParticipant);
  } catch (error) {
    setNotice(error.message || "Could not create the duel.", true);
  }
}

async function joinPublicDuel(roomId, joinButton) {
  if (isJoiningPublicRoom) return;
  if (!publicPlayerNameInput.reportValidity()) return;

  isJoiningPublicRoom = true;
  joinButton.disabled = true;
  try {
    requireSupabase();
    const name = normalizeName(publicPlayerNameInput.value);
    const secret = createSecret();
    const { data: code, error } = await supabase.rpc("duel_join_public", {
      p_room_id: roomId,
      p_player_name: name,
      p_secret_hash: await hashSecret(secret)
    });
    if (error) throw error;
    if (typeof code !== "string") {
      throw new TypeError("The public room join response is invalid.");
    }

    const nextParticipant = {
      code,
      name,
      secret,
      playerNumber: 2,
      isPublic: true,
      publicRoomId: roomId
    };
    storeParticipant(roomId, nextParticipant);
    const url = new URL(window.location.href);
    url.searchParams.delete("code");
    url.searchParams.delete("public");
    url.searchParams.set("public", roomId);
    window.history.replaceState(null, "", url);
    showParticipant(nextParticipant);
  } catch (error) {
    setNotice(error.message || "Could not join the public room.", true);
    joinButton.disabled = false;
  } finally {
    isJoiningPublicRoom = false;
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

    const nextParticipant = {
      code,
      name,
      secret,
      playerNumber: 2,
      isPublic: false,
      publicRoomId: null
    };
    storeParticipant(code, nextParticipant);
    const url = new URL(window.location.href);
    url.searchParams.delete("public");
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

timerFocus.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "touch" || !event.isPrimary) {
    ignoreTouchClick = false;
    return;
  }
  if (!canSolve() || isSubmitting || pendingTime !== null) return;

  ignoreTouchClick = false;
  touchPointer = {
    id: event.pointerId,
    action: timerState === "running" ? "stop" : timerState === "idle" ? "start" : null,
    buttonTarget: timerButton.contains(event.target)
  };

  if (touchPointer.action === "stop") {
    stopTimer().catch((error) => {
      setNotice(error.message || "Could not save your solve.", true);
    });
    ignoreTouchClick = touchPointer.buttonTarget;
  } else if (touchPointer.action === "start") {
    setTimerState("arming");
    spaceArmingTimer = window.setTimeout(() => {
      spaceArmingTimer = 0;
      if (!canSolve() || timerState !== "arming") return;
      setTimerState("armed");
    }, 300);
  }
});

window.addEventListener("pointerup", (event) => {
  if (!touchPointer || touchPointer.id !== event.pointerId) return;

  if (touchPointer.action === "start") {
    window.clearTimeout(spaceArmingTimer);
    spaceArmingTimer = 0;
    if (timerState === "armed" && canSolve() && !isSubmitting) {
      timerStart = performance.now();
      setTimerState("running");
      updateTimer();
    } else if (timerState === "arming") {
      setTimerState("idle");
    }
  }

  ignoreTouchClick = touchPointer.buttonTarget;
  touchPointer = null;
});

window.addEventListener("pointercancel", (event) => {
  if (!touchPointer || touchPointer.id !== event.pointerId) return;

  window.clearTimeout(spaceArmingTimer);
  spaceArmingTimer = 0;
  if (timerState === "arming" || timerState === "armed") {
    setTimerState("idle");
  }
  touchPointer = null;
  ignoreTouchClick = false;
});

createForm.addEventListener("submit", createDuel);
publicCreateForm.addEventListener("submit", (event) => createDuel(event, true));
joinForm.addEventListener("submit", joinDuel);
refreshPublicRoomsButton.addEventListener("click", refreshPublicRooms);
publicRoomList.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const joinButton = event.target.closest("button[data-room-id]");
  if (!joinButton || !publicRoomList.contains(joinButton)) return;
  joinPublicDuel(joinButton.dataset.roomId, joinButton);
});
timerButton.addEventListener("click", (event) => {
  if (ignoreTouchClick && event.detail > 0) {
    ignoreTouchClick = false;
    return;
  }
  toggleTimer();
});
document.addEventListener("keydown", handleSpaceDown);
document.addEventListener("keyup", handleSpaceUp);
window.addEventListener("blur", () => {
  window.clearTimeout(spaceArmingTimer);
  spaceArmingTimer = 0;
  spaceButtonTarget = null;
  touchPointer = null;
  ignoreTouchClick = false;
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
const publicRoomIdFromUrl = new URLSearchParams(window.location.search)
  .get("public")
  ?.trim();

if (publicRoomIdFromUrl) {
  try {
    const savedParticipant = loadParticipant(publicRoomIdFromUrl);
    if (
      savedParticipant?.isPublic &&
      savedParticipant.publicRoomId === publicRoomIdFromUrl
    ) {
      showParticipant(savedParticipant);
    }
  } catch (error) {
    setNotice(error.message || "Could not restore the public duel.", true);
  }
} else if (codeFromUrl) {
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

if (supabase) {
  refreshPublicRooms();
  window.setInterval(refreshPublicRooms, 5000);
} else {
  const setupMessage = document.createElement("p");
  setupMessage.className = "duel-public-empty";
  setupMessage.textContent = "Configure Supabase to browse public rooms.";
  publicRoomList.replaceChildren(setupMessage);
  setNotice(
    "Set up Supabase first: run supabase-setup.sql, then add your project URL and publishable key to supabase-config.js.",
    true
  );
}

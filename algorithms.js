const algorithmSets = {
  OLL: [
    { group: "Crosses", algorithms: [
      "(R' U2 R) U (R' U R)",
      "(R U2 R') U' (R U' R')",
      "F' (r U R' U') (r' F R)",
      "(r U R' U') (r' F R F')",
      "R U2 (R2' U' R2 U') (R2' U2 R)",
      "(R U R') U (R U' R') U (R U2 R')",
      "R2 D (R' U2 R) D' (R' U2 R')"
    ] },
    { group: "Dots", algorithms: [
      "(R U2 R') (R' F R F') U2 (R' F R F')",
      "F (R U R' U') F' f (R U R' U') f'",
      "f (R U R' U') f' U F (R U R' U') F'",
      "f (R U R' U') f' U' F (R U R' U') F'",
      "M U (R U R' U') M' (R' F R F')",
      "F (R U R' U) y' R' U2 (R' F R F')",
      "(R U R' U) (R' F R F') U2 (R' F R F')",
      "M U (R U R' U') M2 (U R U' r')"
    ] },
    { group: "Corners", algorithms: [
      "(R U R' U') M' (U R U' r')",
      "M' U' M U2' M' U' M"
    ] },
    { group: "Lines", algorithms: [
      "R U2 R2 (U' R U' R') U2 (F R F')",
      "(R U R' U) R d' R U' R' F'",
      "f (R U R' U') (R U R' U') f'",
      "F (R U R' U') R F' (r U R' U') r'"
    ] },
    { group: "Ts", algorithms: [
      "F (R U R' U') F'",
      "(R U R' U') (R' F R F')"
    ] },
    { group: "Zs", algorithms: [
      "R' F (R U R' U') F' U R",
      "L F' (L' U' L U) F U' L'"
    ] },
    { group: "Big Ls", algorithms: [
      "(R' F R) U (R' F' R) y' (R U' R')",
      "F (U R U' R2) F' (R U R U' R')",
      "r U r' (R U R' U') r U' r'",
      "l' U' l (L' U' L U) l' U l"
    ] },
    { group: "Cs", algorithms: [
      "R' U' (R' F R F') U R",
      "(R U R' U') x D' R' U R U' D x'"
    ] },
    { group: "Ws", algorithms: [
      "(R U R' U) (R U' R' U') (R' F R F')",
      "(L' U' L U') (L' U L U) (L F' L' F)"
    ] },
    { group: "Ps", algorithms: [
      "f (R U R' U') f'",
      "f' (L' U' L U) f",
      "R' U' F U R U' R' F' R",
      "F U R U' F' r U R' U' r'"
    ] },
    { group: "Squares", algorithms: [
      "(R U2 R') (R' F R F') (R U2 R')",
      "F R' F' R U R U' R'",
      "r' U2 (R U R' U) r",
      "r U2 R' U' R U' r'"
    ] },
    { group: "Small Ls", algorithms: [
      "F (R U R' U') (R U R' U') F'",
      "F' (L' U' L U) (L' U' L U) F",
      "R' F R2 B' R2' F' R2 B R'",
      "(R' F R' F') R2 U2 y (R' F R F')",
      "(l' U' L U') (L' U L U') L' U2 l",
      "(r U R' U) (R U' R' U) R U2' r'"
    ] },
    { group: "Awkward patterns", algorithms: [
      "F' (L' U' L U) F y F (R U R' U') F'",
      "F (R U R' U') F' U F (R U R' U') F'",
      "(r U R' U) R U2 r'",
      "r' U' R U' R' U2 r",
      "(R U R' U) (R' F R F') R U2 R'",
      "(R U R' U') R' F R2 U R' U' F'",
      "(R U R' U') R U' R' F' U' (F R U R')",
      "(R' F R F') (R' F R F') (R U R' U') (R U R')",
      "(R U R' U) R U2 R' F (R U R' U') F'",
      "(L F' L' F) L' U2 L d (R U R')"
    ] }
  ],
  PLL: [
    { group: "Edges only", algorithms: [
      "(M2 U M2) U2 (M2 U M2)",
      "R' U' R2 U (R U R' U') R U R U' R U' R' U2",
      "R2 U' (R' U' R) U R U (R U' R)",
      "(R' U R' U') R' U' (R' U R) U R2"
    ] },
    { group: "Corners only", algorithms: [
      "x z' R2 U2 (R' D' R) U2 (R' D R') z x'",
      "x R2 D2 (R U R') D2 (R U' R) x'",
      "R2 U R' U' y (R U R' U') (R U R' U') (R U R') y' (R U' R2')"
    ] },
    { group: "Edges and corners", algorithms: [
      "(R U R' U') R' F R2 U' R' U' R U R' F'",
      "(F R U' R') U' (R U R' F') (R U R' U') (R' F R F')",
      "U' (R' U R U') R2 (F' U' F U) x (R U R' U') R2 x'",
      "(R' U R' U') y (R' D R' D') R2 y' (R' B' R B R)",
      "L' U' L F (L' U' L U) L F' L2 U L U",
      "R U R' F' (R U R' U') R' F R2 U' R' U'",
      "(L U2 L') U2 L F' (L' U' L U) L F L2 U",
      "(R' U2 R) U2 R' F (R U R' U') R' F' R2 U'",
      "(R U R' U) (R U R' F') (R U R' U') R' F R2 U' R' U2 (R U' R')",
      "(R' U R U') R' (F' U' F) (R U R' F) R' F' (R U' R)",
      "y R2' u (R' U R' U') (R u' R2) y' (R' U R)",
      "(R' U' R) y R2 u (R' U R U') (R u' R2)",
      "y R2' u' R U' (R U R' u) R2 y (R U' R')",
      "y2 (R U R') y' (R2 u' R) U' (R' U R') u R2"
    ] }
  ],
  F2L: [
    { group: "Right slot", algorithms: [
      {
        name: "Right insertion",
        algorithm: "R U R'",
        description: "A familiar right-hand trigger used while pairing or inserting pieces into the front-right slot."
      },
      {
        name: "Right trigger with U setup",
        algorithm: "U R U' R'",
        description: "Adds a U-layer alignment before working the front-right slot."
      },
      {
        name: "Right trigger with U' setup",
        algorithm: "U' R U R'",
        description: "An alternate U-layer alignment before working the front-right slot."
      },
      {
        name: "Right trigger with U2 setup",
        algorithm: "U2 R U R'",
        description: "Uses a half-turn alignment before the right-hand trigger."
      }
    ] },
    { group: "Left slot", algorithms: [
      {
        name: "Left insertion",
        algorithm: "L' U' L",
        description: "A familiar left-hand trigger used while pairing or inserting pieces into the front-left slot."
      },
      {
        name: "Left trigger with U' setup",
        algorithm: "U' L' U L",
        description: "Adds a U-layer alignment before working the front-left slot."
      },
      {
        name: "Left trigger with U setup",
        algorithm: "U L' U' L",
        description: "An alternate U-layer alignment before working the front-left slot."
      },
      {
        name: "Left trigger with U2 setup",
        algorithm: "U2 L' U' L",
        description: "Uses a half-turn alignment before the left-hand trigger."
      }
    ] },
    { group: "Front and back triggers", algorithms: [
      {
        name: "Front trigger, left",
        algorithm: "F' U' F",
        description: "A front-face trigger for working with pieces near the front-left side."
      },
      {
        name: "Front trigger, right",
        algorithm: "F U F'",
        description: "The reverse front-face trigger for repositioning a pair near the front."
      },
      {
        name: "Back trigger, right",
        algorithm: "B U B'",
        description: "A back-face trigger for working with pieces near the back-right side."
      },
      {
        name: "Back trigger, left",
        algorithm: "B' U' B",
        description: "The reverse back-face trigger for repositioning a pair near the back."
      }
    ] }
  ]
};

const casePatterns = {
  OLL: {
    Crosses: [
      "+ynn>nNYNy>nYYYn>yNYYn>+nnn",
      "+nnn>yNYYn>nYYYn>nNYNy>+ynn",
      "+nnn>yNYYn>nYYYn>nYYNn>+nny",
      "+ynn>nNYYn>nYYYn>nNYYn>+ynn",
      "+nny>yNYNn>nYYYn>yNYNn>+nny",
      "+nnn>yNYNy>nYYYn>yNYNy>+nnn",
      "+nnn>nYYYn>nYYYn>nNYNn>+yny"
    ],
    Dots: [
      "+nyn>yNNNy>yNYNy>yNNNy>+nyn",
      "+nyy>yNNNn>yNYNy>yNNNn>+nyn",
      "+nyn>yNNYn>yNYNy>nNNNy>+yyn",
      "+yyn>nNNNy>yNYNy>yNNYn>+nyn",
      "+nyn>nYNYn>yNYNy>yNNNy>+nyn",
      "+yyy>nNNNn>yNYNy>nYNYn>+nyn",
      "+nyy>nYNNn>yNYNy>yNNYn>+nyn",
      "+nyn>nYNYn>yNYNy>nYNYn>+nyn"
    ],
    Corners: [
      "+nyn>nYNYn>nYYYn>nYNYn>+nyn",
      "+nyn>nYNYn>nYYNy>nYYYn>+nnn"
    ],
    Lines: [
      "+nnn>yNYNy>yNYNy>yNYNy>+nnn",
      "+ynn>nNYNy>yNYNy>nNYNy>+ynn",
      "+nyy>yNNNn>nYYYn>yNNNn>+nyy",
      "+nyn>yNNNy>nYYYn>yNNNy>+nyn"
    ],
    Ts: [
      "+nyn>yNNYn>nYYYn>yNNYn>+nyn",
      "+yyn>nNNYn>nYYYn>nNNYn>+yyn"
    ],
    Zs: [
      "+nyy>nYNNn>nYYYn>yNNYn>+yny",
      "+yyn>nNNYn>nYYYn>nYNNn>+yny"
    ],
    "Big Ls": [
      "+nyy>yNNNn>nYYYn>nNNYn>+yyn",
      "+yyn>nNNNy>nYYYn>nYNNn>+nyy",
      "+nyn>yNNYn>nYYYn>nNNNy>+yyn",
      "+nyn>nYNNy>nYYYn>yNNNn>+nyy"
    ],
    Cs: [
      "+nnn>nYYNy>yNYNy>nYYNy>+nnn",
      "+nyn>yNNNy>nYYYn>nYNYn>+nyn"
    ],
    Ws: [
      "+ynn>nNYYn>nYYNy>nYNNy>+nyn",
      "+nny>nYYNn>yNYYn>yNNYn>+nyn"
    ],
    Ps: [
      "+nyn>yNNYn>yNYYn>yNYYn>+nnn",
      "+nyn>nYNNy>nYYNy>nYYNy>+nnn",
      "+ynn>nNYYn>yNYYn>nNNYn>+yyn",
      "+nny>nYYNn>nYYNy>nYNNn>+nyy"
    ],
    Squares: [
      "+nyn>nYNNy>yNYYn>nNYYn>+ynn",
      "+nnn>nYYNy>nYYNy>nNNYn>+yyn",
      "+yyn>nNNNy>yNYYn>yNYYn>+nnn",
      "+nnn>yNYYn>yNYYn>nNNNy>+yyn"
    ],
    "Small Ls": [
      "+nny>yNYNn>nYYNy>yNNNn>+nyy",
      "+ynn>nNYNy>yNYYn>nNNNy>+yyn",
      "+ynn>nNYNy>nYYNy>nNNNy>+yyn",
      "+nny>yNYNn>yNYYn>yNNNn>+nyy",
      "+nnn>yNYNy>nYYNy>yNNNy>+nyn",
      "+nnn>yNYNy>yNYYn>yNNNy>+nyn"
    ],
    "Awkward patterns": [
      "+nyn>nYNNy>nYYNy>yNYNn>+nny",
      "+nyn>yNNYn>yNYYn>nNYNy>+ynn",
      "+ynn>nNYNy>nYYNy>nYNNn>+nyy",
      "+nyy>nYNNn>nYYNy>nNYNy>+ynn",
      "+yyn>nNNYn>nYYNy>yNYNn>+nny",
      "+nny>yNYNn>nYYNy>nNNYn>+yyn",
      "+ynn>nNYYn>nYYNy>nNNYn>+yyn",
      "+nnn>yNYYn>nYYNy>yNNYn>+nyn",
      "+yny>nNYNn>nYYNy>nYNYn>+nyn",
      "+nnn>yNYNy>nYYNy>nYNYn>+nyn"
    ]
  },
  PLL: {
    "Edges only": [
      "+gbg>oYYYr>rYYYo>oYYYr>+bgb",
      "+gog>oYYYr>gYYYb>oYYYr>+brb",
      "+gog>oYYYr>rYYYg>oYYYr>+bbb",
      "+grg>oYYYr>gYYYo>oYYYr>+bbb"
    ],
    "Corners only": [
      "+rgr>gYYYb>oYYYr>oYYYo>+bbg",
      "+bgo>rYYYg>oYYYr>oYYYg>+bbr",
      "+rgo>gYYYg>oYYYr>bYYYb>+rbo"
    ],
    "Edges and corners": [
      "+ggr>oYYYb>rYYYo>oYYYg>+bbr",
      "+bog>rYYYr>gYYYr>oYYYo>+bbg",
      "+rbg>oYYYb>oYYYr>oYYYg>+bgr",
      "+brg>rYYYr>oYYYg>oYYYo>+bbg",
      "+ogg>bYYYr>bYYYr>gYYYr>+oob",
      "+ggr>oYYYb>oYYYb>oYYYg>+brr",
      "+rgo>gYYYg>bYYYr>oYYYr>+bob",
      "+rgo>gYYYg>oYYYb>oYYYr>+brb",
      "+ggb>oYYYo>rYYYo>rYYYr>+gbb",
      "+bgg>rYYYr>rYYYo>oYYYo>+bbg",
      "+bog>rYYYr>bYYYr>gYYYb>+ogo",
      "+gor>oYYYb>rYYYb>oYYYg>+bgr",
      "+bog>rYYYr>rYYYg>gYYYb>+obo",
      "+rob>gYYYo>gYYYr>bYYYo>+rbg"
    ]
  }
};
const solvedF2LPattern = "+ggg>oYYYr>oYYYr>oYYYr>+bbb";

const algorithmTabs = [...document.querySelectorAll(".algorithm-tab")];
const algorithmSearch = document.querySelector("#algorithm-search");
const algorithmGroup = document.querySelector("#algorithm-group");
const algorithmCount = document.querySelector("#algorithm-count");
const algorithmPanel = document.querySelector("#algorithm-panel");
const algorithmPlayer = document.querySelector("#algorithm-player");
const algorithmPlayerTitle = document.querySelector("#algorithm-player-title");
const algorithmPlayerCategory = document.querySelector("#algorithm-player-category");
const algorithmPlayerCube = document.querySelector("#algorithm-player-cube");
const algorithmPlayerSequence = document.querySelector("#algorithm-player-sequence");
const previousAlgorithmStep = document.querySelector("#algorithm-previous-step");
const nextAlgorithmStep = document.querySelector("#algorithm-next-step");
const algorithmPlayerStatus = document.querySelector("#algorithm-player-status");
const algorithmPlayerAction = document.querySelector("#algorithm-player-action");
const algorithmPlayerClose = document.querySelector("#algorithm-player-close");
const playbackSpeedButtons = [...document.querySelectorAll(".algorithm-speed-option")];
const playbackSpeeds = { moderate: 350, slow: 700 };
let activeSet = "F2L";
let playbackSpeed = "moderate";
let selectedAlgorithm = null;
let activeAlgorithmPlayback = null;
let playbackRotation = { x: -12, y: -20 };
let playbackStepIndex = 0;
let cubeDrag = null;
const pllCaseNames = [
  "H-Perm", "Z-Perm", "Ua-Perm", "Ub-Perm", "Aa-Perm", "Ab-Perm", "E-Perm",
  "T-Perm", "Y-Perm", "F-Perm", "V-Perm", "Ja-Perm", "Jb-Perm", "Ra-Perm",
  "Rb-Perm", "Na-Perm", "Nb-Perm", "Ga-Perm", "Gb-Perm", "Gc-Perm", "Gd-Perm"
];

function formatAlgorithmTitle(setName, caseNumber, caseName) {
  const title = `${setName} ${String(caseNumber).padStart(2, "0")}`;
  return caseName ? `${title} (${caseName})` : title;
}

function getAlgorithms() {
  let caseNumber = 0;
  return algorithmSets[activeSet].flatMap(({ group, algorithms }) =>
    algorithms.map((entry, groupIndex) => {
      const currentCaseNumber = ++caseNumber;
      const isF2L = activeSet === "F2L";
      const algorithm = isF2L ? entry.algorithm : entry;
      return {
        algorithm,
        caseNumber: currentCaseNumber,
        caseName: activeSet === "PLL"
          ? pllCaseNames[currentCaseNumber - 1]
          : isF2L
            ? entry.name
            : "",
        description: isF2L ? entry.description : "",
        group,
        groupCase: groupIndex + 1,
        pattern: isF2L ? solvedF2LPattern : casePatterns[activeSet][group][groupIndex],
        setupMoves: isF2L ? parseAlgorithmMoves(invertAlgorithm(algorithm)) : []
      };
    })
  );
}

function invertAlgorithm(algorithm) {
  return algorithm.trim().split(/\s+/).reverse().map((move) => {
    if (/2'?$/u.test(move)) return move.replace(/2'?$/u, "2");
    if (move.endsWith("'")) return move.slice(0, -1);
    return `${move}'`;
  }).join(" ");
}

function renderCaseCube(pattern, caseNumber, setupMoves = []) {
  if (activeSet === "F2L") {
    const cube = document.createElement("div");
    cube.className = "case-cube case-cube--playback";
    cube.setAttribute("role", "img");
    cube.setAttribute("aria-label", `F2L trigger ${caseNumber} starting cube`);
    cube.append(createPlaybackCube(pattern, setupMoves).model);
    return cube;
  }

  const rows = pattern.split(">").map((line) => [...line.replace(/\+/g, "")]);
  const frontTop = rows[4];
  const rightTop = rows.slice(1, 4).map((row) => row[4]);
  const frontBase = activeSet === "PLL" ? frontTop[0] : "g";
  const rightBase = activeSet === "PLL" ? rightTop[0] : "r";
  const faces = [
    { name: "top", colors: rows.slice(1, 4).flatMap((row) => row.slice(1, 4)) },
    { name: "front", colors: [...frontTop, ...Array(6).fill(frontBase)] },
    { name: "right", colors: [...rightTop, ...Array(6).fill(rightBase)] }
  ];
  const cube = document.createElement("div");
  cube.className = "case-cube";
  cube.setAttribute("role", "img");
  cube.setAttribute("aria-label", `${activeSet} case ${caseNumber} 3D color pattern`);

  const scene = document.createElement("div");
  scene.className = "case-cube-scene";
  faces.forEach(({ name, colors }) => {
    const face = document.createElement("div");
    face.className = `case-cube-face case-cube-face--${name}`;
    colors.forEach((color) => {
      const sticker = document.createElement("span");
      sticker.className = "case-cube-sticker";
      sticker.dataset.color = color;
      face.append(sticker);
    });
    scene.append(face);
  });
  cube.append(scene);

  return cube;
}

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
const algorithmMoves = {
  R: { axis: "x", layers: [1], direction: 1 },
  L: { axis: "x", layers: [-1], direction: -1 },
  U: { axis: "y", layers: [-1], direction: -1 },
  D: { axis: "y", layers: [1], direction: 1 },
  F: { axis: "z", layers: [1], direction: 1 },
  B: { axis: "z", layers: [-1], direction: -1 },
  M: { axis: "x", layers: [0], direction: -1 },
  E: { axis: "y", layers: [0], direction: 1 },
  S: { axis: "z", layers: [0], direction: 1 },
  r: { axis: "x", layers: [0, 1], direction: 1 },
  l: { axis: "x", layers: [-1, 0], direction: -1 },
  u: { axis: "y", layers: [-1, 0], direction: -1 },
  d: { axis: "y", layers: [0, 1], direction: 1 },
  f: { axis: "z", layers: [0, 1], direction: 1 },
  b: { axis: "z", layers: [-1, 0], direction: -1 },
  x: { axis: "x", layers: [-1, 0, 1], direction: 1 },
  y: { axis: "y", layers: [-1, 0, 1], direction: -1 },
  z: { axis: "z", layers: [-1, 0, 1], direction: 1 }
};
const cubeFaceTransforms = {
  front: "translateZ(7.5px)",
  back: "rotateY(180deg) translateZ(7.5px)",
  right: "rotateY(90deg) translateZ(7.5px)",
  left: "rotateY(-90deg) translateZ(7.5px)",
  up: "rotateX(90deg) translateZ(7.5px)",
  down: "rotateX(-90deg) translateZ(7.5px)"
};

function parseAlgorithmMoves(algorithm) {
  const parsedMoves = [];
  const pattern = /([RLUDFBrludfbMESxyz])(w)?(2'?|')?/g;
  let match;

  while ((match = pattern.exec(algorithm)) !== null) {
    const [, face, wide, suffix] = match;
    const move = algorithmMoves[face];
    if (wide && !/[RLUDFB]/.test(face)) {
      throw new Error(`Unsupported wide move: ${match[0]}`);
    }

    parsedMoves.push({
      axis: move.axis,
      layers: wide ? [...new Set([...move.layers, 0])] : move.layers,
      quarterTurns: move.direction * (suffix && suffix.startsWith("2") ? 2 : suffix === "'" ? -1 : 1)
    });
  }

  const unsupported = algorithm
    .replace(/[RLUDFBrludfbMESxyz]w?(?:2'?|')?/g, "")
    .replace(/[\s()]/g, "");
  if (unsupported) throw new Error(`Unsupported algorithm notation: ${unsupported}`);

  return parsedMoves;
}

function createPlaybackCube(pattern, setupMoves = []) {
  const rows = pattern.split(">").map((line) => [...line.replace(/\+/g, "")]);
  const cubelets = [];
  const cubeletByPosition = new Map();
  const positionKey = (x, y, z) => `${x},${y},${z}`;
  const baseColors = { front: "b", back: "g", right: "r", left: "o" };

  for (const x of [-1, 0, 1]) {
    for (const y of [-1, 0, 1]) {
      for (const z of [-1, 0, 1]) {
        if (x === 0 && y === 0 && z === 0) continue;

        const stickers = {};
        if (y === -1) stickers.up = "Y";
        if (y === 1) stickers.down = "W";
        if (x === -1) stickers.left = baseColors.left;
        if (x === 1) stickers.right = baseColors.right;
        if (z === -1) stickers.back = baseColors.back;
        if (z === 1) stickers.front = baseColors.front;

        const cubelet = { x, y, z, stickers, faceElements: {} };
        cubelets.push(cubelet);
        cubeletByPosition.set(positionKey(x, y, z), cubelet);
      }
    }
  }

  const setSticker = (x, y, z, face, color) => {
    cubeletByPosition.get(positionKey(x, y, z)).stickers[face] = color;
  };
  const topRows = rows.slice(1, 4);
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      setSticker(column - 1, -1, row - 1, "up", topRows[row][column + 1]);
    }

    setSticker(row - 1, -1, 1, "front", rows[4][row]);
    setSticker(row - 1, -1, -1, "back", rows[0][row]);
    setSticker(-1, -1, row - 1, "left", topRows[row][0]);
    setSticker(1, -1, row - 1, "right", topRows[row][4]);
  }

  setupMoves.forEach((move) => {
    const axisPosition = { x: "x", y: "y", z: "z" }[move.axis];
    cubelets
      .filter((cubelet) => move.layers.includes(cubelet[axisPosition]))
      .forEach((cubelet) => rotateCubelet(cubelet, move.axis, move.quarterTurns));
  });

  const model = document.createElement("div");
  model.className = "case-cube-model";
  cubelets.forEach((cubelet) => {
    cubelet.initialX = cubelet.x;
    cubelet.initialY = cubelet.y;
    cubelet.initialZ = cubelet.z;
    cubelet.initialStickers = { ...cubelet.stickers };

    const element = document.createElement("div");
    element.className = "cubelet";
    cubelet.element = element;
    Object.keys(cubeFaceDirections).forEach((faceName) => {
      const face = document.createElement("div");
      face.className = `cubelet-face cubelet-face--${faceName}`;
      face.style.transform = cubeFaceTransforms[faceName];
      cubelet.faceElements[faceName] = face;
      element.append(face);
    });
    updateCubeletFaces(cubelet);
    setCubeletPosition(cubelet);
    model.append(element);
  });

  return { model, cubelets };
}

function updateCubeletFaces(cubelet) {
  Object.entries(cubelet.faceElements).forEach(([faceName, element]) => {
    const color = cubelet.stickers[faceName];
    if (color) {
      element.dataset.color = color;
      element.classList.add("case-cube-sticker");
    } else {
      delete element.dataset.color;
      element.classList.remove("case-cube-sticker");
    }
  });
}

function setCubeletPosition(cubelet) {
  cubelet.element.style.transform =
    `translate3d(${cubelet.x * 15}px, ${cubelet.y * 15}px, ${cubelet.z * 15}px)`;
}

function rotateVector(x, y, z, axis, direction) {
  if (axis === "x") return direction > 0 ? [x, -z, y] : [x, z, -y];
  if (axis === "y") return direction > 0 ? [z, y, -x] : [-z, y, x];
  return direction > 0 ? [-y, x, z] : [y, -x, z];
}

function rotateCubelet(cubelet, axis, quarterTurns) {
  const direction = Math.sign(quarterTurns);
  for (let turn = 0; turn < Math.abs(quarterTurns); turn += 1) {
    [cubelet.x, cubelet.y, cubelet.z] = rotateVector(
      cubelet.x,
      cubelet.y,
      cubelet.z,
      axis,
      direction
    );

    const rotatedStickers = {};
    Object.entries(cubelet.stickers).forEach(([faceName, color]) => {
      const [x, y, z] = rotateVector(...cubeFaceDirections[faceName], axis, direction);
      rotatedStickers[cubeFaceByDirection[`${x},${y},${z}`]] = color;
    });
    cubelet.stickers = rotatedStickers;
  }
}

function resetPlaybackCube(cube) {
  cube.cubelets.forEach((cubelet) => {
    cubelet.x = cubelet.initialX;
    cubelet.y = cubelet.initialY;
    cubelet.z = cubelet.initialZ;
    cubelet.stickers = { ...cubelet.initialStickers };
    updateCubeletFaces(cubelet);
    setCubeletPosition(cubelet);
    cube.model.append(cubelet.element);
  });
}

function waitForTurn(layer, duration) {
  return new Promise((resolve) => {
    const finish = () => {
      window.clearTimeout(timeout);
      layer.removeEventListener("transitionend", finish);
      resolve();
    };
    const timeout = window.setTimeout(finish, duration + 80);
    layer.addEventListener("transitionend", finish);
  });
}

async function animateCubeMove(cube, move, duration) {
  const axisPosition = { x: "x", y: "y", z: "z" }[move.axis];
  const layer = document.createElement("div");
  layer.className = "cube-turn-layer";
  cube.model.append(layer);

  const movingCubelets = cube.cubelets.filter((cubelet) => move.layers.includes(cubelet[axisPosition]));
  movingCubelets.forEach((cubelet) => layer.append(cubelet.element));

  const turnDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
  if (turnDuration > 0) {
    void layer.offsetWidth;
    layer.style.transition = `transform ${turnDuration}ms ease-in-out`;
    layer.style.transform = `rotate${move.axis.toUpperCase()}(${move.quarterTurns * 90}deg)`;
    await waitForTurn(layer, turnDuration);
  }

  movingCubelets.forEach((cubelet) => {
    rotateCubelet(cubelet, move.axis, move.quarterTurns);
    updateCubeletFaces(cubelet);
    setCubeletPosition(cubelet);
    cube.model.append(cubelet.element);
  });
  layer.remove();
}

function setPlaybackControlsDisabled(disabled) {
  algorithmTabs.forEach((tab) => {
    tab.disabled = disabled;
  });
  algorithmSearch.disabled = disabled;
  algorithmGroup.disabled = disabled;
  algorithmPanel.querySelectorAll(".algorithm-play-button").forEach((button) => {
    button.disabled = disabled;
  });
}

function updatePlaybackRotation() {
  algorithmPlayerCube.style.setProperty("--playback-rotation-x", `${playbackRotation.x}deg`);
  algorithmPlayerCube.style.setProperty("--playback-rotation-y", `${playbackRotation.y}deg`);
}

function updateAlgorithmStepButtons() {
  const canStep = Boolean(selectedAlgorithm) && !activeAlgorithmPlayback;
  previousAlgorithmStep.disabled = !canStep || playbackStepIndex <= 0;
  nextAlgorithmStep.disabled =
    !canStep || playbackStepIndex >= selectedAlgorithm.moves.length;
}

async function playAlgorithm(cube, moves, button, setName, caseNumber, caseName) {
  if (activeAlgorithmPlayback || !selectedAlgorithm) return;

  const playback = { cancelled: false };
  activeAlgorithmPlayback = playback;
  resetPlaybackCube(cube);
  playbackStepIndex = 0;
  updateAlgorithmStepButtons();
  setPlaybackControlsDisabled(true);
  algorithmPlayerAction.disabled = true;
  algorithmPlayerAction.textContent = "Playing…";
  button.textContent = "Playing…";

  let completed = false;
  try {
    for (let index = 0; index < moves.length; index += 1) {
      if (playback.cancelled) break;
      const move = moves[index];
      await animateCubeMove(cube, move, playbackSpeeds[playbackSpeed]);
      playbackStepIndex = index + 1;
    }
    completed = !playback.cancelled;
  } finally {
    const label = completed ? "Replay" : "Play";
    if (activeAlgorithmPlayback === playback) activeAlgorithmPlayback = null;
    algorithmPlayerAction.disabled = false;
    algorithmPlayerAction.textContent = label;
    button.textContent = label;
    button.setAttribute("aria-label", `${label} ${formatAlgorithmTitle(setName, caseNumber, caseName)}`);
    algorithmPlayerStatus.textContent = completed
      ? "Algorithm complete. Replay to watch again."
      : "Playback stopped.";
    updateAlgorithmStepButtons();
    setPlaybackControlsDisabled(false);
  }
}

async function stepAlgorithm(direction) {
  const selection = selectedAlgorithm;
  if (!selection || activeAlgorithmPlayback) return;

  const targetIndex = playbackStepIndex + direction;
  if (targetIndex < 0 || targetIndex > selection.moves.length) return;

  const move = direction > 0
    ? selection.moves[playbackStepIndex]
    : { ...selection.moves[playbackStepIndex - 1], quarterTurns: -selection.moves[playbackStepIndex - 1].quarterTurns };
  const playback = { cancelled: false };
  activeAlgorithmPlayback = playback;
  algorithmPlayerAction.disabled = true;
  algorithmPlayerAction.textContent = "Stepping…";
  updateAlgorithmStepButtons();

  try {
    await animateCubeMove(selection.cube, move, playbackSpeeds[playbackSpeed]);
    playbackStepIndex = targetIndex;
    algorithmPlayerStatus.textContent = playbackStepIndex === selection.moves.length
      ? "Algorithm complete. Replay to watch again."
      : playbackStepIndex === 0
        ? "At the start of the algorithm."
        : `Move ${playbackStepIndex} of ${selection.moves.length}.`;
  } finally {
    if (activeAlgorithmPlayback === playback) activeAlgorithmPlayback = null;
    algorithmPlayerAction.disabled = false;
    algorithmPlayerAction.textContent = "Replay";
    selection.button.textContent = "Replay";
    updateAlgorithmStepButtons();
  }
}

function openAlgorithmPlayer({ pattern, setupMoves = [], algorithm, moves, setName, caseNumber, caseName, group, groupCase, button }) {
  const cube = createPlaybackCube(pattern, setupMoves);
  algorithmPlayerCube.replaceChildren(cube.model);
  algorithmPlayerCube.setAttribute(
    "aria-label",
    `${setName} ${String(caseNumber).padStart(2, "0")} interactive cube. Drag or use the arrow keys to rotate.`
  );
  updatePlaybackRotation();
  algorithmPlayerTitle.textContent = formatAlgorithmTitle(setName, caseNumber, caseName);
  algorithmPlayerCategory.textContent = `${group} · ${groupCase}`;
  algorithmPlayerSequence.textContent = algorithm.replace(/2'/g, "2");
  algorithmPlayerAction.textContent = "Play";
  algorithmPlayerAction.disabled = false;
  algorithmPlayerStatus.textContent = `${playbackSpeed === "slow" ? "Slow" : "Moderate"} speed selected.`;

  selectedAlgorithm = { cube, moves, button, setName, caseNumber, caseName };
  playbackStepIndex = 0;
  updateAlgorithmStepButtons();
  if (!algorithmPlayer.open) algorithmPlayer.showModal();
  void playAlgorithm(cube, moves, button, setName, caseNumber, caseName);
}

algorithmPlayerCube.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
  cubeDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    rotationX: playbackRotation.x,
    rotationY: playbackRotation.y
  };
  algorithmPlayerCube.setPointerCapture(event.pointerId);
  algorithmPlayerCube.classList.add("is-dragging");
  event.preventDefault();
});
algorithmPlayerCube.addEventListener("pointermove", (event) => {
  if (!cubeDrag || cubeDrag.pointerId !== event.pointerId) return;
  playbackRotation.x = cubeDrag.rotationX - (event.clientY - cubeDrag.startY) * 0.6;
  playbackRotation.y = cubeDrag.rotationY + (event.clientX - cubeDrag.startX) * 0.6;
  updatePlaybackRotation();
});
const finishCubeDrag = (event) => {
  if (!cubeDrag || cubeDrag.pointerId !== event.pointerId) return;
  cubeDrag = null;
  algorithmPlayerCube.classList.remove("is-dragging");
  if (algorithmPlayerCube.hasPointerCapture(event.pointerId)) {
    algorithmPlayerCube.releasePointerCapture(event.pointerId);
  }
};
algorithmPlayerCube.addEventListener("pointerup", finishCubeDrag);
algorithmPlayerCube.addEventListener("pointercancel", finishCubeDrag);
algorithmPlayerCube.addEventListener("keydown", (event) => {
  const rotationStep = event.shiftKey ? 20 : 10;
  if (event.key === "ArrowLeft") playbackRotation.y -= rotationStep;
  else if (event.key === "ArrowRight") playbackRotation.y += rotationStep;
  else if (event.key === "ArrowUp") playbackRotation.x -= rotationStep;
  else if (event.key === "ArrowDown") playbackRotation.x += rotationStep;
  else return;
  event.preventDefault();
  updatePlaybackRotation();
});

playbackSpeedButtons.forEach((button) => {
  button.addEventListener("click", () => {
    playbackSpeed = button.dataset.playbackSpeed;
    playbackSpeedButtons.forEach((option) => {
      const selected = option === button;
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
    const speedLabel = playbackSpeed === "slow" ? "Slow" : "Moderate";
    algorithmPlayerStatus.textContent = activeAlgorithmPlayback
      ? `${speedLabel} speed selected; it takes effect after the current turn.`
      : `${speedLabel} speed selected.`;
  });
});

algorithmPlayerAction.addEventListener("click", () => {
  if (!selectedAlgorithm) return;
  void playAlgorithm(
    selectedAlgorithm.cube,
    selectedAlgorithm.moves,
    selectedAlgorithm.button,
    selectedAlgorithm.setName,
    selectedAlgorithm.caseNumber,
    selectedAlgorithm.caseName
  );
});
previousAlgorithmStep.addEventListener("click", () => {
  void stepAlgorithm(-1);
});
nextAlgorithmStep.addEventListener("click", () => {
  void stepAlgorithm(1);
});
algorithmPlayerClose.addEventListener("click", () => algorithmPlayer.close());
algorithmPlayer.addEventListener("close", () => {
  if (activeAlgorithmPlayback) activeAlgorithmPlayback.cancelled = true;
  selectedAlgorithm = null;
  updateAlgorithmStepButtons();
});
algorithmPlayer.addEventListener("click", (event) => {
  if (event.target === algorithmPlayer) algorithmPlayer.close();
});

function updateGroups() {
  algorithmGroup.replaceChildren(new Option("All groups", ""));
  algorithmSets[activeSet].forEach(({ group }) => {
    algorithmGroup.add(new Option(group, group));
  });
  algorithmPanel.setAttribute("aria-labelledby", `${activeSet.toLowerCase()}-tab`);
}

function renderAlgorithms() {
  const query = algorithmSearch.value.trim().toLowerCase();
  const selectedGroup = algorithmGroup.value;
  const algorithms = getAlgorithms().filter((item) => {
    const text = `${activeSet} ${item.caseNumber} ${item.caseName} ${item.group} ${item.groupCase} ${item.algorithm}`.toLowerCase();
    return (!selectedGroup || item.group === selectedGroup) && text.includes(query);
  });

  algorithmPanel.replaceChildren();
  algorithms.forEach(({ algorithm, caseNumber, caseName, description, group, groupCase, pattern, setupMoves }) => {
    const card = document.createElement("article");
    const heading = document.createElement("div");
    const title = document.createElement("strong");
    const category = document.createElement("span");
    const moves = document.createElement("code");

    heading.className = "algorithm-case-heading";
    title.textContent = formatAlgorithmTitle(activeSet, caseNumber, caseName);
    category.className = "algorithm-category";
    category.textContent = `${group} · ${groupCase}`;
    moves.textContent = algorithm.replace(/2'/g, "2");
    heading.append(title, category);

    const cube = renderCaseCube(pattern, caseNumber, setupMoves);
    const playButton = document.createElement("button");
    const parsedMoves = parseAlgorithmMoves(algorithm);
    const setName = activeSet;

    card.className = activeSet === "F2L" ? "algorithm-case f2l-drill" : "algorithm-case";
    playButton.className = "algorithm-play-button";
    playButton.type = "button";
    playButton.textContent = "Play";
    playButton.setAttribute(
      "aria-label",
      `Play ${formatAlgorithmTitle(setName, caseNumber, caseName)}`
    );
    playButton.addEventListener("click", () => {
      openAlgorithmPlayer({
        pattern,
        setupMoves,
        algorithm,
        moves: parsedMoves,
        setName,
        caseNumber,
        caseName,
        group,
        groupCase,
        button: playButton
      });
    });
    card.append(heading, cube, moves, playButton);

    if (activeSet === "F2L") {
      const descriptionText = document.createElement("p");
      descriptionText.className = "f2l-drill-description";
      descriptionText.textContent = description;
      card.append(descriptionText);
    }

    algorithmPanel.append(card);
  });

  const entryType = activeSet === "F2L" ? "F2L triggers" : `${activeSet} algorithms`;
  algorithmCount.textContent = `${algorithms.length} of ${getAlgorithms().length} ${entryType}`;
  if (algorithms.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "algorithm-empty";
    emptyState.textContent = "No matching algorithms. Try a different search or group.";
    algorithmPanel.append(emptyState);
  }
}

algorithmTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeSet = tab.dataset.set;
    algorithmTabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    algorithmSearch.value = "";
    updateGroups();
    renderAlgorithms();
  });
});

algorithmSearch.addEventListener("input", renderAlgorithms);
algorithmGroup.addEventListener("change", renderAlgorithms);
updateGroups();
renderAlgorithms();

(() => {
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
        const directionVector = rotateCubeVector(
          ...cubeFaceDirections[face],
          axis,
          direction
        );
        rotatedStickers[cubeFaceByDirection[directionVector.join(",")]] = color;
      });
      cubelet.stickers = rotatedStickers;
    }
  }

  function applyCubeMove(cubelets, notation) {
    const move = cubeMoves[notation[0]];
    const suffix = notation.slice(1);
    const quarterTurns =
      move.direction * (suffix === "2" ? 2 : suffix === "'" ? -1 : 1);
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

  function renderScrambledCube(scramble, cubeFaceElements) {
    const cubelets = createSolvedCubelets();
    scramble
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .forEach((move) => applyCubeMove(cubelets, move));

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

  window.CubePreview = Object.freeze({ render: renderScrambledCube });
})();

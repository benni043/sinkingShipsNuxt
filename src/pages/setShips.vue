<script lang="ts" setup>
import {onMounted, ref, type Ref} from 'vue';
import {socket} from "~/socket";
import type {Cell, Names} from "~/utils/Types";
import {useMyGridStore} from "~/stores/myGrid";

socket.connect();

// for logging purposes only
socket.on("connect", () => {
  console.log("logged in: " + socket.id)
});

function startGame() {
  socket.emit("postField", JSON.stringify(grid.value), "lobby", useCookie("username").value);
}

socket.on("postFieldSucceeded", () => {
  useMyGridStore().setGrid(grid.value);
})

socket.on("starting", (names: Names) => {
  useMyGridStore().setMyUserName(names.me);
  useMyGridStore().setOpponentUserName(names.opponent);
  useMyGridStore().setCurrentPlayer(names.currentPlayer);

  return navigateTo("/game");
})

socket.on("lobbyIsFull", () => {
  alert("Diese Runde ist bereits voll!");
})

socket.on("playerAlreadyExists", () => {
  alert("Du bist bereits in dieser Lobby!");
})

// canvas

const canvasWidth = 400;
const canvasHeight = 400;
const gridSize = 10;
const cellSize = canvasHeight / gridSize;

const canvas: Ref<HTMLCanvasElement | null> = ref(null);
let ctx: Ref<CanvasRenderingContext2D | null> = ref(null);

let grid: Ref<Cell[][]> = ref([]);

let currentCell: Cell | undefined;
let mouseDownX: number | undefined;
let mouseDownY: number | undefined;

function initGrid() {
  for (let x = 0; x < gridSize; x++) {
    grid.value[x] = [];

    for (let y = 0; y < gridSize; y++) {
      grid.value[x][y] = {
        type: {
          fieldType: FieldType.WATER,
          isHit: false
        },
        id: undefined,
        color: "white",
        x: x,
        y: y,
        originX: x,
        originY: y,
      }
    }
  }
}

function initShips() {
  grid.value[0][0].id = 0;
  grid.value[0][0].color = "green";
  grid.value[0][0].type = {
    fieldType: FieldType.SHIP,
    isHit: false
  }

  grid.value[0][1].id = 1;
  grid.value[0][1].color = "green";
  grid.value[0][1].type = {
    fieldType: FieldType.SHIP,
    isHit: false
  }

  grid.value[1][1].id = 1;
  grid.value[1][1].color = "green";
  grid.value[1][1].type = {
    fieldType: FieldType.SHIP,
    isHit: false
  }

  grid.value[1][2].id = 1;
  grid.value[1][2].color = "green";
  grid.value[1][2].type = {
    fieldType: FieldType.SHIP,
    isHit: false
  }

  grid.value[2][2].id = 1;
  grid.value[2][2].color = "green";
  grid.value[2][2].type = {
    fieldType: FieldType.SHIP,
    isHit: false
  }

  grid.value[6][6].id = 2;
  grid.value[6][6].color = "green";
  grid.value[6][6].type = {
    fieldType: FieldType.SHIP,
    isHit: false
  }

  grid.value[5][7].id = 2;
  grid.value[5][7].color = "green";
  grid.value[5][7].type = {
    fieldType: FieldType.SHIP,
    isHit: false
  }

  grid.value[6][7].id = 2;
  grid.value[6][7].color = "green";
  grid.value[6][7].type = {
    fieldType: FieldType.SHIP,
    isHit: false
  }

  grid.value[6][8].id = 2;
  grid.value[6][8].color = "green";
  grid.value[6][8].type = {
    fieldType: FieldType.SHIP,
    isHit: false
  }

  grid.value[7][7].id = 2;
  grid.value[7][7].color = "green";
  grid.value[7][7].type = {
    fieldType: FieldType.SHIP,
    isHit: false
  }

  grid.value[0][9].id = 3;
  grid.value[0][9].color = "green";
  grid.value[0][9].type = {
    fieldType: FieldType.SHIP,
    isHit: false
  }

  grid.value[1][9].id = 3;
  grid.value[1][9].color = "green";
  grid.value[1][9].type = {
    fieldType: FieldType.SHIP,
    isHit: false
  }
}

function drawGrid() {
  ctx.value!.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw the grid
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      ctx.value!.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  // Draw all ships except the one being moved
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (grid.value[x][y] !== currentCell) {
        ctx.value!.fillStyle = grid.value[x][y].color;
        drawShip(x, y, grid.value[x][y].x, grid.value[x][y].y);
      }
    }
  }

  // Draw the currently moved ship last
  if (currentCell) {
    ctx.value!.fillStyle = currentCell.color;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        if (grid.value[x][y].id === currentCell.id) {
          drawShip(x, y, grid.value[x][y].x, grid.value[x][y].y);
        }
      }
    }
  }
}

function drawShip(idxX: number, idxY: number, x: number, y: number) {
  const rows = grid.value.length;
  const cols = grid.value[0].length;

  const id = grid.value[idxX][idxY].id;

  if (id === undefined) return;

  const hasTopNeighbor = idxY > 0 && grid.value[idxX][idxY - 1].id === id;
  const hasBottomNeighbor = idxY < rows - 1 && grid.value[idxX][idxY + 1].id === id;
  const hasLeftNeighbor = idxX > 0 && grid.value[idxX - 1][idxY].id === id;
  const hasRightNeighbor = idxX < cols - 1 && grid.value[idxX + 1][idxY].id === id;

  let leftX = hasLeftNeighbor ? 0 : 5;
  let rightX = hasRightNeighbor ? 0 : 5;
  let topY = hasTopNeighbor ? 0 : 5;
  let bottomY = hasBottomNeighbor ? 0 : 5;

  ctx.value!.fillRect(x * cellSize + leftX, y * cellSize + topY, cellSize - leftX - rightX, cellSize - topY - bottomY);
}

initGrid();
initShips();

onMounted(() => {
  ctx.value = canvas.value!.getContext('2d');

  drawGrid();

  canvas.value!.addEventListener("mousedown", (event) => {
    //todo does not work

    currentCell = undefined;
    mouseDownX = undefined;
    mouseDownY = undefined;

    drawGrid();

    let rect = canvas.value!.getBoundingClientRect();
    let calcX = event.clientX - rect.left;
    let calcY = event.clientY - rect.top;

    let x = Math.floor(calcX / cellSize);
    let y = Math.floor(calcY / cellSize);

    mouseDownX = x;
    mouseDownY = y;

    if (grid.value[x][y].id === undefined) return;

    currentCell = grid.value[x][y];
  })

  canvas.value!.addEventListener("mousemove", (event) => {
    if (currentCell === undefined) return;

    let rect = canvas.value!.getBoundingClientRect();
    let calcX = event.clientX - rect.left;
    let calcY = event.clientY - rect.top;

    let diffX = (calcX / cellSize - mouseDownX!) - 0.5;
    let diffY = (calcY / cellSize - mouseDownY!) - 0.5;

    for (let x1 = 0; x1 < gridSize; x1++) {
      for (let y1 = 0; y1 < gridSize; y1++) {
        if (grid.value[x1][y1].id !== currentCell.id) continue;

        grid.value[x1][y1].x = grid.value[x1][y1].originX + diffX!;
        grid.value[x1][y1].y = grid.value[x1][y1].originY + diffY!;
      }
    }

    drawGrid();
  })

  canvas.value!.addEventListener("mouseup", () => {
    if (currentCell === undefined) return;

    let newPositions: { x: number, y: number }[] = [];
    let isValidMove = true;

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        if (grid.value[x][y].id === currentCell.id) {
          let newX = Math.floor(grid.value[x][y].x + 0.5);
          let newY = Math.floor(grid.value[x][y].y + 0.5);

          // Check if the new position is within bounds and not occupied by another ship
          if (
              newX < 0 || newX >= gridSize ||
              newY < 0 || newY >= gridSize ||
              (grid.value[newX][newY].id !== undefined && grid.value[newX][newY].id !== currentCell.id)
          ) {
            isValidMove = false;
            break;
          }

          newPositions.push({x: newX, y: newY});
        }
      }
      if (!isValidMove) break;
    }

    if (isValidMove) {
      // Clear old positions
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          if (grid.value[x][y].id === currentCell.id) {
            grid.value[x][y] = {
              type: {
                fieldType: FieldType.WATER,
                isHit: false
              },
              id: undefined,
              color: "white",
              x: x,
              y: y,
              originX: x,
              originY: y,
            };
          }
        }
      }

      // Assign new positions
      for (let pos of newPositions) {
        grid.value[pos.x][pos.y] = {
          ...currentCell,
          x: pos.x,
          y: pos.y,
          originX: pos.x,
          originY: pos.y,
        };
      }
    } else {
      // If move is invalid, reset to original positions
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          if (grid.value[x][y].id === currentCell.id) {
            grid.value[x][y].x = grid.value[x][y].originX;
            grid.value[x][y].y = grid.value[x][y].originY;
          }
        }
      }
    }

    currentCell = undefined;
    mouseDownX = undefined;
    mouseDownY = undefined;

    drawGrid();
  });
})

</script>

<template>
  <div>
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" style="border:1px solid #d3d3d3;"></canvas>
  </div>

  <button @click="startGame">startGame</button>
</template>
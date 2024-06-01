<script setup>
import {socket} from "./socket";
import {onMounted} from "vue";

socket.on("connect", () => {
  socket.emit("login", {id: "socket.id"});
});

socket.on("loggedin", (id) => {
  console.log("Hello: " + id);
})

let canvas = ref(null);

onMounted(() => {
  canvas.value.focus();
})

let ctx = canvas.getContext("2d");

let gridSize = 10;
let cellSize = canvas.height / gridSize;
let dragObject = null;

let gridCopy = null;

const SteinTyp = {
  ONE_X_ONE: 0,
  ONE_X_TWO: 1,
  ONE_X_THREE: 2,
  ONE_X_FOUR: 3,
  ONE_X_FIVE: 4
};

function createShips(type, count) {
  let newShips = [];

  for (let i = 0; i < count; i++) {
    let newShip = {
      id: objects.length + newShips.length,
      x: cellSize * gridSize + cellSize,
      y: 0,
      w: 0,
      h: 0,
      color: "",
      originX: cellSize * gridSize + cellSize,
      originY: 0,
      gridPosX: null,
      gridPosY: null,
      isInGrid: false
    };

    switch (type) {
      case SteinTyp.ONE_X_ONE:
        newShip.y = cellSize / 2;
        newShip.originY = cellSize / 2;
        newShip.w = cellSize;
        newShip.h = cellSize;
        newShip.color = "gray";
        break;
      case SteinTyp.ONE_X_TWO:
        newShip.y = cellSize * 2 + (cellSize / 2);
        newShip.originY = cellSize * 2 + (cellSize / 2);
        newShip.w = cellSize * 2;
        newShip.h = cellSize;
        newShip.color = "green";
        break;
      case SteinTyp.ONE_X_THREE:
        newShip.y = (cellSize * 3) + (cellSize * 2) - (cellSize / 2);
        newShip.originY = (cellSize * 3) + (cellSize * 2) - (cellSize / 2);
        newShip.w = cellSize * 3;
        newShip.h = cellSize;
        newShip.color = "red";
        break;
      case SteinTyp.ONE_X_FOUR:
        newShip.y = cellSize * 4 + cellSize * 3 - (cellSize / 2);
        newShip.originY = cellSize * 4 + cellSize * 3 - (cellSize / 2);
        newShip.w = cellSize * 4;
        newShip.h = cellSize;
        newShip.color = "blue";
        break;
      case SteinTyp.ONE_X_FIVE:
        newShip.y = cellSize * 5 + cellSize * 4 - (cellSize / 2);
        newShip.originY = cellSize * 5 + cellSize * 4 - (cellSize / 2);
        newShip.w = cellSize * 5;
        newShip.h = cellSize;
        newShip.color = "yellow";
        break;
      default:
        console.error("invalid ship type");
        return;
    }

    newShips.push(newShip);
  }

  for (let i = 1; i < newShips.length; i++) {
    newShips[i].x += cellSize * (newShips[i].w / cellSize * i) + (cellSize * i);
    newShips[i].originX += cellSize * (newShips[i].w / cellSize * i) + (cellSize * i);
  }

  objects.push(...newShips);
  redraw();
}

let objects = [];

let grid = Array(gridSize).fill(undefined).map(() => Array(gridSize).fill({
  color: "white",
  originX: null,
  originY: null,
  id: null,
  w: null,
  h: null
}));

function drawGrid() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (dragObject && dragObject.isInGrid && i * cellSize === dragObject.x && j * cellSize === dragObject.y) {
        continue;
      }
      ctx.fillStyle = grid[i][j].color;

      ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
}

function drawObjects() {
  objects.forEach(obj => {
    ctx.fillStyle = obj.color;
    roundRect(ctx, obj.x, obj.y, obj.w, obj.h, 10);
    ctx.fill();
    ctx.stroke();
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawObjects();

  if (dragObject) {
    ctx.fillStyle = dragObject.color;
    roundRect(ctx, dragObject.x, dragObject.y, dragObject.w, dragObject.h, 10);
    ctx.fill();
    ctx.stroke();
  }
}

createShips(SteinTyp.ONE_X_ONE, 4);
createShips(SteinTyp.ONE_X_TWO, 3);
createShips(SteinTyp.ONE_X_THREE, 2);
createShips(SteinTyp.ONE_X_FOUR, 1);
createShips(SteinTyp.ONE_X_FIVE, 1);

redraw();

canvas.addEventListener("mousedown", function (event) {
  reset();

  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;

  let i = Math.floor(x / cellSize);
  let j = Math.floor(y / cellSize);

  if (i < gridSize && j < gridSize && grid[i][j].id !== null) {
    dragObject = {
      id: grid[i][j].id,
      x: i * cellSize,
      y: j * cellSize,
      w: grid[i][j].w,
      h: grid[i][j].h,
      color: grid[i][j].color,
      originX: grid[i][j].originX,
      originY: grid[i][j].originY,
      gridPosX: i,
      gridPosY: j,
      isInGrid: true
    };

    gridCopy = JSON.parse(JSON.stringify(grid));

    for (let di = 0; di < grid.length; di++) {
      for (let dj = 0; dj < grid[di].length; dj++) {
        if (grid[di][dj].id === dragObject.id) {
          grid[di][dj] = {color: "white", originX: null, originY: null, id: null, w: null, h: null};
        }
      }
    }
  } else {
    dragObject = objects.find(obj => x > obj.x && x < obj.x + obj.w && y > obj.y && y < obj.y + obj.h);
  }
});

canvas.addEventListener("mousemove", function (event) {
  if (dragObject) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    dragObject.x = x - dragObject.w / 2;
    dragObject.y = y - dragObject.h / 2;

    redraw();
  }
});

canvas.addEventListener("mouseup", function (event) {
  if (dragObject) {
    let x = (event.clientX - dragObject.w / 2) + (cellSize / 2);
    let y = (event.clientY - dragObject.h / 2) + (cellSize / 2);

    let i = Math.floor(x / cellSize);
    let j = Math.floor(y / cellSize);

    if (i < gridSize && j < gridSize && i >= 0 && j >= 0) {
      let canMoveToGrid = true;
      for (let di = 0; di < dragObject.w / cellSize; di++) {
        for (let dj = 0; dj < dragObject.h / cellSize; dj++) {
          if (i + di >= gridSize || j + dj >= gridSize || grid[i + di][j + dj].id !== null) {
            canMoveToGrid = false;
            break;
          }
        }
        if (!canMoveToGrid) {
          break;
        }
      }

      if (canMoveToGrid) {
        for (let di = 0; di < dragObject.w / cellSize; di++) {
          for (let dj = 0; dj < dragObject.h / cellSize; dj++) {
            grid[i + di][j + dj] = {
              color: dragObject.color,
              originX: dragObject.originX,
              originY: dragObject.originY,
              id: dragObject.id,
              w: dragObject.w,
              h: dragObject.h
            };
          }
        }
        objects = objects.filter(obj => obj !== dragObject);
      } else {
        if (!dragObject.isInGrid) {
          objects = objects.filter(obj => obj !== dragObject);

          objects.push({
            id: dragObject.id,
            x: dragObject.originX,
            y: dragObject.originY,
            w: dragObject.w,
            h: dragObject.h,
            color: dragObject.color,
            originX: dragObject.originX,
            originY: dragObject.originY,
            gridPosX: null,
            gridPosY: null,
            isInGrid: false
          });
        } else if (dragObject.isInGrid) {
          grid = gridCopy;
        }
      }
    } else {
      objects = objects.filter(obj => obj !== dragObject);

      objects.push({
        id: dragObject.id,
        x: dragObject.originX,
        y: dragObject.originY,
        w: dragObject.w,
        h: dragObject.h,
        color: dragObject.color,
        originX: dragObject.originX,
        originY: dragObject.originY,
        gridPosY: null,
        gridPosX: null,
        isInGrid: false
      });
    }

    dragObject = null;
    redraw();
  }
});

function reset() {
  if (dragObject) {
    if (!dragObject.isInGrid) {
      objects = objects.filter(obj => obj !== dragObject);

      objects.push({
        id: dragObject.id,
        x: dragObject.originX,
        y: dragObject.originY,
        w: dragObject.w,
        h: dragObject.h,
        color: dragObject.color,
        originX: dragObject.originX,
        originY: dragObject.originY,
        gridPosX: null,
        gridPosY: null,
        isInGrid: false
      });
    } else if (dragObject.isInGrid) {
      grid = gridCopy;
    }

    dragObject = null;
    redraw();
  }
}

</script>

<template>
  <canvas id="myCanvas" ref="canvas" width="800" height="400" style="border:1px solid #d3d3d3;">
  </canvas>
</template>

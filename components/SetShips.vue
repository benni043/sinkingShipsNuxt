<template>
  <div>
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" style="border:1px solid #d3d3d3;"></canvas>
  </div>

  <!-- todo  :disabled="objects.length !== 0"-->
  <button @click="startGame">startGame</button>
</template>

<script lang="ts" setup>
import {onMounted, ref, type Ref} from 'vue';
import {FieldType, type Grid, HitType, type Ship, ShipType} from "~/utils/SinkingShipTypes";
import {socket} from "~/components/socket";

socket.on("connect", () => {
  socket.emit("login", {id: socket.id});
});

socket.on("loggedin", (id) => {
  console.log("Hello: " + id);
})

function startGame() {
  socket.emit("startGame", JSON.stringify(grid.value));
  emit("startGame")
}

const emit = defineEmits(["startGame"]);

const canvasWidth = 800;
const canvasHeight = 400;
const gridSize = 10;
const cellSize = canvasHeight / gridSize;
const canvas: Ref<HTMLCanvasElement | null> = ref(null);

let ctx: Ref<CanvasRenderingContext2D | null> = ref(null);
let dragObject: Ref<Ship | null> = ref(null);
let gridCopy: Ref<Grid[][] | null> = ref(null);

const objects: Ref<Ship[]> = ref([]);

let grid: Ref<Grid[][]> = ref(Array(gridSize)
    .fill(undefined)
    .map(() => Array(gridSize)
        .fill({
          color: "white",
          hitType: HitType.NULL,
          type: HitType.WATER,
          originX: null,
          originY: null,
          id: null,
          w: null,
          h: null
        })));

function createShip(type: ShipType, count: number) {
  let newShips = [];

  for (let i = 0; i < count; i++) {
    let newShip: Ship = {
      id: objects.value.length + newShips.length,
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
      case ShipType.ONE:
        newShip.y = cellSize / 2;
        newShip.originY = cellSize / 2;
        newShip.w = cellSize;
        newShip.h = cellSize;
        newShip.color = "gray";
        break;
      case ShipType.TWO:
        newShip.y = cellSize * 2 + (cellSize / 2);
        newShip.originY = cellSize * 2 + (cellSize / 2);
        newShip.w = cellSize * 2;
        newShip.h = cellSize;
        newShip.color = "green";
        break;
      case ShipType.THREE:
        newShip.y = (cellSize * 3) + (cellSize * 2) - (cellSize / 2);
        newShip.originY = (cellSize * 3) + (cellSize * 2) - (cellSize / 2);
        newShip.w = cellSize * 3;
        newShip.h = cellSize;
        newShip.color = "red";
        break;
      case ShipType.FOUR:
        newShip.y = cellSize * 4 + cellSize * 3 - (cellSize / 2);
        newShip.originY = cellSize * 4 + cellSize * 3 - (cellSize / 2);
        newShip.w = cellSize * 4;
        newShip.h = cellSize;
        newShip.color = "blue";
        break;
      case ShipType.FIVE:
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

  objects.value.push(...newShips);
  redraw();
}

function drawGrid() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (dragObject.value && dragObject.value!.isInGrid && i * cellSize === dragObject.value!.x && j * cellSize === dragObject.value!.y) {
        continue;
      }
      ctx.value!.fillStyle = grid.value[i][j].color;
      ctx.value!.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      ctx.value!.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
}

function drawObjects() {
  objects.value.forEach(obj => {
    ctx.value!.fillStyle = obj.color;
    roundRect(ctx.value!, obj.x, obj.y, obj.w, obj.h, 10);
    ctx.value!.fill();
    ctx.value!.stroke();
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx!.beginPath();
  ctx!.moveTo(x + radius, y);
  ctx!.arcTo(x + width, y, x + width, y + height, radius);
  ctx!.arcTo(x + width, y + height, x, y + height, radius);
  ctx!.arcTo(x, y + height, x, y, radius);
  ctx!.arcTo(x, y, x + width, y, radius);
  ctx!.closePath();
}

function redraw() {
  ctx.value!.clearRect(0, 0, canvasWidth, canvasHeight);

  drawGrid();
  drawObjects();

  if (dragObject.value) {
    ctx.value!.fillStyle = dragObject.value!.color;
    roundRect(ctx.value!, dragObject.value!.x, dragObject.value!.y, dragObject.value!.w, dragObject.value!.h, 10);
    ctx.value!.fill();
    ctx.value!.stroke();
  }
}

function removeFromGrid(ship: Ship) {
  for (let ship1 of objects.value) {
    if (ship.id === ship1.id) {
      objects.value.splice(objects.value.indexOf(ship1), 1);
    }
  }
}

function reset() {
  if (dragObject.value) {
    if (!dragObject.value!.isInGrid) {
      removeFromGrid(dragObject.value)

      objects.value.push({
        id: dragObject.value!.id,
        x: dragObject.value!.originX,
        y: dragObject.value!.originY,
        w: dragObject.value!.w,
        h: dragObject.value!.h,
        color: dragObject.value!.color,
        originX: dragObject.value!.originX,
        originY: dragObject.value!.originY,
        gridPosX: null,
        gridPosY: null,
        isInGrid: false
      });
    } else if (dragObject.value!.isInGrid) {
      grid.value = gridCopy.value!;
    }

    dragObject.value = null;

    redraw();
  }
}

onMounted(() => {
  ctx.value = canvas.value!.getContext('2d');

  createShip(ShipType.ONE, 4);
  createShip(ShipType.TWO, 3);
  createShip(ShipType.THREE, 2);
  createShip(ShipType.FOUR, 1);
  createShip(ShipType.FIVE, 1);

  redraw();

  canvas.value!.addEventListener("mousedown", (event) => {
    reset();

    let rect = canvas.value!.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    let i = Math.floor(x / cellSize);
    let j = Math.floor(y / cellSize);

    if (i < gridSize && j < gridSize && grid.value[i][j].id !== null) {
      dragObject.value = {
        id: grid.value[i][j].id!,
        x: i * cellSize,
        y: j * cellSize,
        w: grid.value[i][j].w!,
        h: grid.value[i][j].h!,
        color: grid.value[i][j].color,
        originX: grid.value[i][j].originX!,
        originY: grid.value[i][j].originY!,
        gridPosX: i,
        gridPosY: j,
        isInGrid: true
      };

      gridCopy.value = JSON.parse(JSON.stringify(grid.value));

      for (let di = 0; di < grid.value.length; di++) {
        for (let dj = 0; dj < grid.value[di].length; dj++) {
          if (grid.value[di][dj].id === dragObject.value!.id) {
            grid.value[di][dj] = {
              color: "white",
              hitType: HitType.NULL,
              type: FieldType.WATER,
              originX: null,
              originY: null,
              id: null,
              w: null,
              h: null
            };
          }
        }
      }
    } else {
      dragObject.value = objects.value.find(obj => x > obj.x && x < obj.x + obj.w && y > obj.y && y < obj.y + obj.h)!;
    }
  });

  canvas.value!.addEventListener("mousemove", (event) => {
    if (dragObject.value) {
      let rect = canvas.value!.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;

      dragObject.value!.x = x - dragObject.value!.w / 2;
      dragObject.value!.y = y - dragObject.value!.h / 2;

      redraw();
    }
  });

  canvas.value!.addEventListener("mouseup", (event) => {
    if (!dragObject.value) return;

    let x = (event.clientX - dragObject.value!.w / 2) + (cellSize / 2);
    let y = (event.clientY - dragObject.value!.h / 2) + (cellSize / 2);

    let i = Math.floor(x / cellSize);
    let j = Math.floor(y / cellSize);

    if (i < gridSize && j < gridSize && i >= 0 && j >= 0) {
      let canMoveToGrid = true;
      for (let di = 0; di < dragObject.value!.w / cellSize; di++) {
        for (let dj = 0; dj < dragObject.value!.h / cellSize; dj++) {
          if (i + di >= gridSize || j + dj >= gridSize || grid.value[i + di][j + dj].id !== null) {
            canMoveToGrid = false;
            break;
          }
        }
        if (!canMoveToGrid) {
          break;
        }
      }

      if (canMoveToGrid) {
        for (let di = 0; di < dragObject.value!.w / cellSize; di++) {
          for (let dj = 0; dj < dragObject.value!.h / cellSize; dj++) {
            grid.value[i + di][j + dj] = {
              color: dragObject.value!.color,
              hitType: HitType.NULL,
              type: FieldType.SHIP,
              originX: dragObject.value!.originX,
              originY: dragObject.value!.originY,
              id: dragObject.value!.id,
              w: dragObject.value!.w,
              h: dragObject.value!.h
            };
          }
        }
        removeFromGrid(dragObject.value)
      } else {
        if (!dragObject.value!.isInGrid) {
          removeFromGrid(dragObject.value)

          objects.value.push({
            id: dragObject.value!.id,
            x: dragObject.value!.originX,
            y: dragObject.value!.originY,
            w: dragObject.value!.w,
            h: dragObject.value!.h,
            color: dragObject.value!.color,
            originX: dragObject.value!.originX,
            originY: dragObject.value!.originY,
            gridPosX: null,
            gridPosY: null,
            isInGrid: false
          });
        } else if (dragObject.value!.isInGrid) {
          grid.value = gridCopy.value!;
        }
      }
    } else {
      removeFromGrid(dragObject.value)

      objects.value.push({
        id: dragObject.value!.id,
        x: dragObject.value!.originX,
        y: dragObject.value!.originY,
        w: dragObject.value!.w,
        h: dragObject.value!.h,
        color: dragObject.value!.color,
        originX: dragObject.value!.originX,
        originY: dragObject.value!.originY,
        gridPosX: null,
        gridPosY: null,
        isInGrid: false
      });
    }

    dragObject.value = null;
    redraw();
  });
});
</script>
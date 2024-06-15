<script setup lang="ts">
import {onMounted, ref, type Ref} from "vue";
import {type Cord, FieldType, type Grid, type HitResponse, type Player, SHIP, WATER} from "~/utils/SinkingShipTypes";
import {socket} from "~/components/socket";

const props = defineProps<{
  opponentsGrid: boolean;
  grid: Grid[][] | undefined;
  lobbyName: string;
}>()

const emit = defineEmits(["endGame"]);

const canvasWidth = 400;
const canvasHeight = 400;
const gridSize = 10;
const cellSize = canvasHeight / gridSize;
const canvas: Ref<HTMLCanvasElement | null> = ref(null);

let ctx: Ref<CanvasRenderingContext2D | null> = ref(null);

let grid: Ref<Grid[][]> = ref(Array.from({length: gridSize}, () =>
    Array.from({length: gridSize}, () => ({
      color: "white",
      type: {fieldType: FieldType.WATER, isHit: false},
      originX: null,
      originY: null,
      id: null,
      w: null,
      h: null
    }))
));

function drawGrid() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      ctx.value!.fillStyle = grid.value[i][j].color;
      ctx.value!.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      ctx.value!.fillStyle = grid.value[i][j].color;
      drawShips(i, j);
    }
  }
}

function drawShips(x: number, y: number) {
  const rows = grid.value.length;
  const cols = grid.value[0].length;

  const id = grid.value[x][y].id;

  if (id === null) return;

  const hasTopNeighbor = y > 0 && grid.value[x][y - 1].id === id;
  const hasBottomNeighbor = y < rows - 1 && grid.value[x][y + 1].id === id;
  const hasLeftNeighbor = x > 0 && grid.value[x - 1][y].id === id;
  const hasRightNeighbor = x < cols - 1 && grid.value[x + 1][y].id === id;

  let leftX = hasLeftNeighbor ? 0 : 5;
  let rightX = hasRightNeighbor ? 0 : 5;
  let topY = hasTopNeighbor ? 0 : 5;
  let bottomY = hasBottomNeighbor ? 0 : 5;

  ctx.value!.fillRect(x * cellSize + leftX, y * cellSize + topY, cellSize - leftX - rightX, cellSize - topY - bottomY);
}

function click(event: MouseEvent) {
  let rect = canvas.value!.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;

  let i = Math.floor(x / cellSize);
  let j = Math.floor(y / cellSize);

  socket.emit("hit", {cord: {x: i, y: j} as Cord, lobbyName: props.lobbyName});
}

onMounted(() => {
  if (props.grid) grid.value = props.grid;

  ctx.value = canvas.value!.getContext('2d');

  drawGrid();

  if (!props.opponentsGrid) return

  canvas.value!.addEventListener("mousedown", click);
})

socket.on("hitResponse", (hitResponse: HitResponse) => {
  if ((props.opponentsGrid && hitResponse.opponentsField) || (!props.opponentsGrid && !hitResponse.opponentsField)) {

    grid.value[hitResponse.cord.x][hitResponse.cord.y].type.fieldType = hitResponse.fieldType;
    grid.value[hitResponse.cord.x][hitResponse.cord.y].type.isHit = true;

    if (hitResponse.fieldType === FieldType.SHIP) {
      grid.value[hitResponse.cord.x][hitResponse.cord.y].color = SHIP
    } else {
      grid.value[hitResponse.cord.x][hitResponse.cord.y].color = WATER
    }

    drawGrid();
  }
})

socket.on("finished", (player: Player) => {
  // canvas.value!.removeEventListener("mousedown", click);

  emit("endGame", player)
})

socket.on("alreadyHit", () => {
  console.log("already hit")
})

onBeforeUnmount(() => {
  socket.emit("user-disconnect", ({id: socket.id, lobbyName: "lobby"}))
});

</script>

<template>
  <div>
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" style="border:1px solid #d3d3d3;"></canvas>
  </div>
</template>

<style scoped>

</style>
<script setup lang="ts">
import {onMounted, ref, type Ref} from "vue";
import {
  type Cord,
  FieldType,
  type HitResponse,
  SHIP,
  WATER,
  TypeOfHit
} from "~/utils/SinkingShipTypes";
import {socket} from "~/components/socket";

const props = defineProps<{
  opponentsGrid: boolean;
}>()

const canvasWidth = 400;
const canvasHeight = 400;
const gridSize = 10;
const cellSize = canvasHeight / gridSize;
const canvas: Ref<HTMLCanvasElement | null> = ref(null);

let ctx: Ref<CanvasRenderingContext2D | null> = ref(null);

let grid = ref(Array.from({length: gridSize}, () =>
    Array.from({length: gridSize}, () => ({
      color: "white",
      typeOfHit: TypeOfHit.NULL,
      fieldType: FieldType.WATER,
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
      ctx.value!.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      ctx.value!.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
}

onMounted(() => {
  ctx.value = canvas.value!.getContext('2d');

  drawGrid();

  if (!props.opponentsGrid) return

  canvas.value!.addEventListener("mousedown", (event) => {
    let rect = canvas.value!.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    let i = Math.floor(x / cellSize);
    let j = Math.floor(y / cellSize);

    console.log("x: " + i + ", y: " + j);

    socket.emit("hit", {cord: {x: i, y: j} as Cord, lobbyName: "lobby"});
  });
})

socket.on("hitResponse", (hitResponse: HitResponse) => {
  if ((props.opponentsGrid && hitResponse.opponentsField) || (!props.opponentsGrid && !hitResponse.opponentsField)) {

    grid.value[hitResponse.cord.x][hitResponse.cord.y].fieldType = hitResponse.fieldType;
    grid.value[hitResponse.cord.x][hitResponse.cord.y].color = hitResponse.fieldType === FieldType.WATER ? WATER : SHIP;

    drawGrid();
  }
})

onBeforeUnmount(() => {
  socket.emit("user-disconnect", ({id: socket.id, lobbyName: "lobby"}))

  // if (socket) socket.disconnect();
});

</script>

<template>
  <div>
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" style="border:1px solid #d3d3d3;"></canvas>
  </div>
</template>

<style scoped>

</style>
<script setup lang="ts">
import type {Ref} from "vue";
import type {Grid} from "~/utils/SinkingShipTypes";

let gameStarted: Ref<boolean> = ref(false);
let grid: Grid[][] | undefined = undefined;

function startGame(parsedGrid: Grid[][]) {
  gameStarted.value = true;
  grid = parsedGrid;
}

function leave() {
  gameStarted.value = false;
}
</script>

<template>
  <div id="startField" v-if="!gameStarted">
    <SetShips @start-game="startGame"></SetShips>
  </div>
  <div v-if="gameStarted">
    <div id="fields">
      <Grid :opponents-grid="false" :grid="grid"></Grid>
      <Grid :opponents-grid="true" :grid="undefined"></Grid>
    </div>

    <button @click="leave">leave</button>
  </div>
</template>

<style scoped>
#fields {
  display: flex;
  justify-content: space-around;
}
</style>
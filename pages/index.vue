<script setup lang="ts">
import type {Ref} from "vue";
import type {Grid, Player} from "~/utils/SinkingShipTypes";

let gameStarted: Ref<boolean> = ref(false);
let grid: Grid[][] | undefined = undefined;

let lobbyName: string = "lobby";
let winner: Ref<Player | undefined> = ref(undefined);

function startGame(parsedGrid: Grid[][]) {
  gameStarted.value = true;
  grid = parsedGrid;
}

function endGame(player: Player) {
  winner.value = player;
}

function leave() {
  reset();
}

function reset() {
  gameStarted.value = false;
  winner.value = undefined;
  grid = undefined;
}
</script>

<template>
  <div id="startField" v-if="!gameStarted">
    <SetShips @start-game="startGame"></SetShips>
  </div>
  <div v-if="gameStarted">
    <div v-if="winner">
      <h1>Der Spieler: {{ winner?.socketID }} hat das Spiel gewonnen!</h1>
    </div>

    <div id="fields">
      <Grid :opponents-grid="false" :grid="grid" :lobbyName="lobbyName" @end-game="endGame"></Grid>
      <Grid :opponents-grid="true" :grid="undefined" :lobbyName="lobbyName" @end-game="endGame"></Grid>
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
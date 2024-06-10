<script setup lang="ts">
import type {Ref} from "vue";

let gameStarted: Ref<boolean> = ref(false);

function startGame() {
  gameStarted.value = true;
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
      <Grid :opponents-grid="false"></Grid>
      <Grid :opponents-grid="true"></Grid>
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
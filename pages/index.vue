<script setup lang="ts">
import type {Ref} from "vue";

let gameStarted: Ref<boolean> = ref(false);

function startGame() {
  gameStarted.value = true;
}
</script>

<template>
  <div v-if="!gameStarted">
    <SetShips @start-game="startGame"></SetShips>
  </div>
  <div v-if="gameStarted">
    <Grid :opponents-grid="false"></Grid>
    <Grid :opponents-grid="true"></Grid>
  </div>
</template>

<style scoped>

</style>
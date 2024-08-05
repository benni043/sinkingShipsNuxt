<script setup lang="ts">
import type {Ref} from "vue";
import {useMyGridStore} from "~/stores/myGrid";
import type {Cell} from "~/utils/Types";

let gameStarted: Ref<boolean> = ref(false);

function startGame(parsedGrid: Cell[][]) {
  gameStarted.value = true;

  useMyGridStore().setGrid(parsedGrid);

  return navigateTo("/game");
}

</script>

<template>
  <SetShips @start-game="startGame"></SetShips>
</template>

<style scoped>

</style>
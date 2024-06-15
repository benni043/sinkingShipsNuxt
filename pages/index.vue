<script setup lang="ts">
import type {Ref} from "vue";
import type {Grid} from "~/utils/SinkingShipTypes";
import {useMyGridStore} from "~/stores/myGrid";

let gameStarted: Ref<boolean> = ref(false);

function startGame(parsedGrid: Grid[][]) {
  gameStarted.value = true;

  useMyGridStore().setGrid(parsedGrid);

  return navigateTo("/game")
}

</script>

<template>
  <SetShips @start-game="startGame"></SetShips>
</template>

<style scoped>

</style>
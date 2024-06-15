<script setup lang="ts">

import {type Cord, FieldType, type Grid, type HitResponse, type Player, SHIP, WATER} from "~/utils/SinkingShipTypes";
import {ref, type Ref} from "vue";
import SimpleGrid from "~/components/SimpleGrid.vue";
import {socket} from "~/components/socket";
import {useMyGridStore} from "~/stores/myGrid";

const gridSize = 10;

let myGrid: Ref<Grid[][]> = ref(useMyGridStore().grid);

let opponentsGrid: Ref<Grid[][]> = ref(Array.from({length: gridSize}, () =>
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

let lobby = "lobby";
let winner = ref("");

function click(cord: Cord) {
  socket.emit("hit", {cord: cord, lobbyName: lobby});
}

socket.on("hitResponse", (hitResponse: HitResponse) => {
  if (hitResponse.opponentsField) {
    opponentsGrid.value[hitResponse.cord.x][hitResponse.cord.y].type.fieldType = hitResponse.fieldType;
    opponentsGrid.value[hitResponse.cord.x][hitResponse.cord.y].type.isHit = true;
    opponentsGrid.value[hitResponse.cord.x][hitResponse.cord.y].id = hitResponse.id !== null ? hitResponse.id : -1;

    if (hitResponse.fieldType === FieldType.SHIP) opponentsGrid.value[hitResponse.cord.x][hitResponse.cord.y].color = SHIP
    else opponentsGrid.value[hitResponse.cord.x][hitResponse.cord.y].color = WATER
  } else {
    myGrid.value![hitResponse.cord.x][hitResponse.cord.y].type.fieldType = hitResponse.fieldType;
    myGrid.value![hitResponse.cord.x][hitResponse.cord.y].type.isHit = true;
    myGrid.value[hitResponse.cord.x][hitResponse.cord.y].id = hitResponse.id !== null ? hitResponse.id : -1;

    if (hitResponse.fieldType === FieldType.SHIP) myGrid.value![hitResponse.cord.x][hitResponse.cord.y].color = SHIP
    else myGrid.value![hitResponse.cord.x][hitResponse.cord.y].color = WATER
  }
})

socket.on("finished", (player: Player) => {
  winner.value = player.socketID;
})

socket.on("alreadyHit", () => {
  console.log("already hit");
})

onBeforeUnmount(() => {
  socket.emit("user-disconnect", ({id: socket.id, lobbyName: lobby}));
});

</script>

<template>
  <div v-if="winner !== ''">
    <h1>{{winner}}</h1>
  </div>

  <div id="fields">
    <SimpleGrid :grid="myGrid" :has-listener="false"></SimpleGrid>
    <SimpleGrid :grid="opponentsGrid" :has-listener="true" @clicked="args => click(args)"></SimpleGrid>
  </div>

  <button><nuxt-link to="/">leave</nuxt-link></button>
</template>

<style scoped>
#fields {
  display: flex;
  justify-content: space-around;
}
</style>
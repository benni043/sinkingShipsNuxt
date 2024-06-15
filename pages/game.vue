<script setup lang="ts">

import {
  type Cord,
  FieldType,
  type Grid,
  type HitResponse,
  type Player,
  SHIP, type ShipCount,
  ShipType,
  WATER
} from "~/utils/SinkingShipTypes";
import {ref, type Ref} from "vue";
import SimpleGrid from "~/components/SimpleGrid.vue";
import {socket} from "~/components/socket";
import {useMyGridStore} from "~/stores/myGrid";
import Stats from "~/components/Stats.vue";

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
let currentPlayer = "test";
let myName = "test";
let opponentName = "test2";

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

let shipCounts: ShipCount[] = [
  {shipType: ShipType.FIVE, count: 5, remaining: 2},
  {shipType: ShipType.FOUR, count: 4, remaining: 2},
  {shipType: ShipType.THREE, count: 3, remaining: 2},
  {shipType: ShipType.TWO, count: 2, remaining: 2},
  {shipType: ShipType.ONE, count: 1, remaining: 2},
]

</script>

<template>
  <div>
    <div class="app-bar">
      <span>{{ lobby }}</span>
      <div class="button-group">
        <button class="stats-button" :disabled="winner === ''">Statistik</button>
        <button class="leave-button">
          <nuxt-link to="/">Leave</nuxt-link>
        </button>
      </div>
    </div>

    <div v-if="currentPlayer !== ''" class="current-turn">
      <h2>{{ currentPlayer }}'s turn</h2>
    </div>

    <div id="fields">
      <div class="grid-container">
        <div class="player-grid">
          <h3>{{ myName }}</h3>
          <SimpleGrid :grid="myGrid" :has-listener="false"></SimpleGrid>
        </div>
        <div class="player-grid">
          <h3>{{ opponentName }}</h3>
          <SimpleGrid :grid="opponentsGrid" :has-listener="true" @clicked="args => click(args)"></SimpleGrid>

          <div class="ship-counts">
            <div v-for="ship in shipCounts" :key="ship.shipType" class="ship-count">
              <div class="ship-rectangles">
                <div v-for="n in ship.count" :key="n" class="rectangle"></div>
              </div>
              <div class="count">{{ ship.remaining }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="winner !== ''">
      <Stats :water-hits="2" :winner="winner" :play-time="2"></Stats>
    </div>
  </div>
</template>

<style scoped>
.app-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #ddd;
  font-size: 1.5em;
}

.button-group {
  display: flex;
  gap: 10px;
}

.stats-button, .leave-button {
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 0.7em;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.stats-button:disabled {
  background-color: #888888;
  cursor: default!important;
}

.stats-button:not:disabled {
  background-color: blue;
}

.stats-button:hover:not:disabled {
  background-color: darkblue;
}

.leave-button {
  background-color: red;
}

.leave-button:hover {
  background-color: #c50101;
}

.leave-button nuxt-link {
  color: white;
  text-decoration: none;
}

.current-turn {
  text-align: center;
  margin: 20px 0;
  font-size: 1.5em;
}

#fields {
  display: flex;
  justify-content: center;
}

.grid-container {
  display: flex;
  gap: 50px;
}

.player-grid {
  text-align: center;
  font-size: 1.5em;
}

.ship-counts {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.ship-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px;
}

.ship-rectangles {
  display: flex;
  flex-direction: column;
}

.rectangle {
  width: 25px;
  height: 25px;
  background-color: gray;
  margin-bottom: 5px;
}

.count {
  font-size: 1.2em;
  margin-top: 10px;
}
</style>
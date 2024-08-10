<script setup lang="ts">

import {
  type Cell,
  type Cord,
  FieldType,
  type HitResponse, SHIP,
  type ShipCount,
  ShipType, type Stats, WATER,
} from "~/utils/Types";
import {ref, type Ref} from "vue";
import SimpleGrid from "~/components/SimpleGrid.vue";
import {socket} from "~/socket";
import {useMyGridStore} from "~/stores/myGrid";

const myGridStore = useMyGridStore();

const gridSize = 10;

let myGrid: Ref<Cell[][]> = ref(myGridStore.grid);
let opponentsGrid: Ref<Cell[][]> = ref(initGrid());

let lobby = "lobby";

let stats: Ref<Stats> = ref({lobby: lobby, winner: "", waterHits: -1, playTime: -1});
let showStats: Ref<boolean> = ref(false);

let shipCounts: ShipCount[] = [
  {shipType: ShipType.FIVE, count: 5, remaining: 2},
  {shipType: ShipType.FOUR, count: 4, remaining: 2},
  {shipType: ShipType.THREE, count: 3, remaining: 2},
  {shipType: ShipType.TWO, count: 2, remaining: 2},
  {shipType: ShipType.ONE, count: 1, remaining: 2},
]

function initGrid() {
  let grid: Cell[][] = [];

  for (let x = 0; x < gridSize; x++) {
    grid[x] = [];

    for (let y = 0; y < gridSize; y++) {
      grid[x][y] = {
        type: {
          fieldType: FieldType.WATER,
          isHit: false
        },
        id: undefined,
        color: "white",
        x: x,
        y: y,
        originX: x,
        originY: y,
      }
    }
  }

  return grid;
}

function click(cord: Cord) {
  socket.emit("hit", {cord: cord, lobbyName: lobby});
}

socket.on("hitSucceeded", (hitResponse: HitResponse) => {
  console.log(hitResponse)

  if (hitResponse.opponentsField) {
    opponentsGrid.value[hitResponse.cord.x][hitResponse.cord.y].type.isHit = true;
    opponentsGrid.value[hitResponse.cord.x][hitResponse.cord.y].id = hitResponse.id === undefined ? -1 : hitResponse.id;

    if (hitResponse.fieldType === FieldType.SHIP)
      opponentsGrid.value[hitResponse.cord.x][hitResponse.cord.y].color = SHIP;
    else
      opponentsGrid.value[hitResponse.cord.x][hitResponse.cord.y].color = WATER;

  } else {
    myGrid.value[hitResponse.cord.x][hitResponse.cord.y].type.isHit = true;
    myGrid.value[hitResponse.cord.x][hitResponse.cord.y].id = hitResponse.id === undefined ? -1 : hitResponse.id;

    if (hitResponse.fieldType === FieldType.SHIP)
      myGrid.value[hitResponse.cord.x][hitResponse.cord.y].color = SHIP;
    else
      myGrid.value[hitResponse.cord.x][hitResponse.cord.y].color = WATER;

  }

  myGridStore.setCurrentPlayer(hitResponse.currentPlayer);
})

socket.on("alreadyHit", () => {
  alert("Auf dieses Feld hast du bereits geschossen!");
})

socket.on("notYourTurn", () => {
  alert("Du bist nicht an der Reihe!");
})

socket.on("gameEnd", (winner: string) => {
  stats.value.winner = winner;
  showStats.value = true;
})

onBeforeUnmount(() => {
  socket.emit("user-disconnect", ({id: socket.id, lobbyName: lobby}));

  socket.removeAllListeners();
  socket.close();
});

</script>

<template>
  <div>
    <div class="app-bar">
      <span>{{ lobby }}</span>
      <div class="button-group">
        <button class="stats-button" :disabled="stats.winner === ''" @click="showStats = !showStats">Statistik</button>
        <button class="leave-button">
          <nuxt-link to="/">Leave</nuxt-link>
        </button>
      </div>
    </div>

    <div v-if="myGridStore.currentPlayer !== ''" class="current-turn">
      <h2>{{ myGridStore.currentPlayer }}'s turn</h2>
    </div>

    <div id="fields">
      <div class="grid-container">
        <div class="player-grid">
          <h3>{{ myGridStore.myUserName }}</h3>
          <SimpleGrid :grid="myGrid" :has-listener="false"></SimpleGrid>
        </div>
        <div class="player-grid">
          <h3>{{ myGridStore.opponentUserName }}</h3>
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

    <div v-if="showStats">
      <Stats @close="showStats = !showStats" :water-hits="stats.waterHits" :winner="stats.winner"
             :play-time="stats.playTime"
             :lobby="stats.lobby"></Stats>
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
  cursor: default !important;
}

.stats-button {
  background-color: blue;
}

.stats-button:hover {
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
<script setup lang="ts">

let props = defineProps<{
  winner: string,
  waterHits: number,
  playTime: number
}>();

const emit = defineEmits(["close"]);

function close() {
  emit("close");
}

</script>

<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2>Schiffe Versenken - Statistik</h2>
        <button class="close-button" @click="close">X</button>
      </div>
      <div class="modal-content">
        <div>
          <h3 class="winner">Gewinner:</h3>
          <h4 class="winner2">{{ winner }}</h4>
        </div>
        <p>Wassertreffer: {{ waterHits }}</p>
        <p>Spielzeit: {{ playTime }} minutes</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
}

.winner {
  margin-bottom: 0;
}

.winner2 {
  margin-top: 5px;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 450px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
  }
}

.close-button {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
}

.modal-content {
  font-size: 1.2em;
}
</style>
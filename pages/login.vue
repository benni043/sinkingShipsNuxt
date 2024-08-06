<script setup lang="ts">
import {ref} from 'vue';

const username = ref<string>("");

function handleSubmit() {
  if (username.value.trim() === "") {
    alert('Bitte geben Sie einen Benutzernamen ein');
    return;
  }

  useCookie("username").value = username.value;

  navigateTo("/setShips");
}
</script>

<template>
  <div class="login-container">
    <h1>Anmelden</h1>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">Benutzername</label>
        <input
            type="text"
            id="username"
            v-model="username"
            required
        />
      </div>
      <button type="submit">Anmelden</button>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 0.5rem 1rem;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>

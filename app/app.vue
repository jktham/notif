<script setup lang="ts">
import { ref } from 'vue';
import "assets/base.css";

let permissionGranted = ref(Notification.permission === "granted");

const requestPermissions = async () => {
  let p = await Notification.requestPermission();
  permissionGranted.value = (p === "granted");
}

const sendLocalNotification = () => {
  let n = new Notification("Hello from Notif!", {
    body: "This is a local notification.",
    icon: "/favicon.ico"
  });
}
</script>

<template>
  <div class="app">
    <header>
      <h1 class="title">Notif</h1>
    </header>
    <main>
      <div class="row">
        <span>Notification permissions: {{permissionGranted}}</span>
        <button @click="requestPermissions">Request</button>
      </div>
      <div class="row">
        <span>Test local notification</span>
        <button @click="sendLocalNotification">Send</button>
      </div>
      <div class="row">
        <span>Test remote notification</span>
        <button>Send</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
}

button {
  padding: 0.5rem 1rem;
  color: var(--fg);
  background: var(--bg2);
  cursor: pointer;
}

button:active {
  background: var(--bg3);
}

.title {
  font-size: 3rem;
}

main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.row {
  display: flex;
  gap: 1rem;
  align-items: center;
}
</style>

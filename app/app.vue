<script setup lang="ts">
import { ref } from 'vue';
import "assets/base.css";

// notifications
let permissionGranted = ref(Notification.permission === "granted");

const requestPermissions = async () => {
  let p = await Notification.requestPermission();
  permissionGranted.value = (p === "granted");
}

const sendLocalNotification = () => {
  let n = new Notification("hi c:", {
    body: "local",
    icon: "/favicon.ico"
  });
}

const sendRemoteNotification = async () => {
  await $fetch("/api/send", {
    method: "post",
    body: {
      title: "hi c:",
      body: "remote",
      icon: "/favicon.ico"
    },
  }).then(console.log);
}

// service worker
let registered = ref(false);

const registerSW = async () => {
  navigator.serviceWorker.register("/sw.js");
  navigator.serviceWorker.ready.then(async registration => {
    console.log("Service Worker ready:", registration);

    let sub = await registration.pushManager.getSubscription().then(async subscription => {
      if (subscription) {
        return subscription;
      }

      const vapidPublicKey = await $fetch('/api/vapidPublicKey');

      return await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });
    });

    await $fetch('/api/subscribe', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        subscription: sub
      }),
    }).then(console.log);

    registered.value = true;
  });
};

const unregisterSW = async () => {
  let registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    let sub = await registration.pushManager.getSubscription();

    await $fetch('/api/unsubscribe', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        subscription: sub
      }),
    }).then(console.log);

    if (sub) {
      await sub.unsubscribe();
    }
    await registration.unregister();
  }
  
  registered.value = false;
};

const reregisterSW = async () => {
  await unregisterSW();
  await registerSW();
}

await registerSW();

</script>

<template>
  <div class="app">
    <header>
      <h1 class="title">notif</h1>
    </header>
    <main>
      <div class="row">
        <span>notification permissions: {{permissionGranted}}</span>
        <button @click="requestPermissions">request</button>
      </div>
      <div class="row">
        <span>test local notification</span>
        <button @click="sendLocalNotification">send</button>
      </div>
      <div class="row">
        <span>test remote notification</span>
        <button @click="sendRemoteNotification">send</button>
      </div>
      <div class="row">
        <span>serviceworker and webpush: {{registered}}</span>
        <button @click="reregisterSW">reregister</button>
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

<script setup lang="ts">
import { ref } from 'vue';
import "assets/base.css";
import { type NotifContent } from '~~/server/types';

// notifications
let notificationsGranted = ref(Notification.permission === "granted");

const requestPermissions = async () => {
  let p = await Notification.requestPermission();
  notificationsGranted.value = (p === "granted");
}

const testLocalNotification = () => {
  let n = new Notification("hi c:", {
    body: "local",
    icon: "/favicon.ico"
  });
}

const testRemoteNotification = async () => {
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
let swReady = ref(false);
let swBusy = ref(false);

const registerSW = async () => {
  swBusy.value = true;
  navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready.then(async registration => {
    console.log("service worker ready");

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
      body: {
        subscription: sub
      },
    }).then(console.log);

    swReady.value = true;
    swBusy.value = false;
  });
};

const unregisterSW = async () => {
  swBusy.value = true;
  let reg = await navigator.serviceWorker.getRegistration();
  if (reg) {
    let sub = await reg.pushManager.getSubscription();

    await $fetch('/api/unsubscribe', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: {
        subscription: sub
      },
    }).then(console.log);

    if (sub) {
      await sub.unsubscribe();
    }
    await reg.unregister();
  }
  
  swReady.value = false;
  swBusy.value = false;
};

if (notificationsGranted.value) {
  await registerSW();
}

// send
let content = ref<NotifContent>({
  title: "",
  body: "",
  icon: "",
});

const sendNotification = async (content: NotifContent) => {
  await $fetch("/api/send", {
    method: "post",
    body: content,
  }).then(console.log);
};

let curl = computed(() => {
  let url = new URL(window.location.href);
  url.pathname = "/api/send";
  let data = JSON.stringify(content.value).replaceAll("'", "'\\''");
  return `curl --header "Content-Type: application/json" --request POST --data '${data}' ${url.href}`;
});

</script>

<template>
  <div class="app">
    <header>
      <h1 class="title">notif</h1>
    </header>
    <main>
      <div class="row">
        <span>notification permissions: {{notificationsGranted}}</span>
        <button @click="requestPermissions" :disabled="notificationsGranted">request</button>
      </div>
      <div class="row">
        <span>test local notification</span>
        <button @click="testLocalNotification">send</button>
      </div>
      <div class="row">
        <span>test remote notification</span>
        <button @click="testRemoteNotification">send</button>
      </div>
      <div class="row">
        <span>serviceworker, webpush: {{swReady}}</span>
        <button v-if="swReady" @click="unregisterSW" :disabled="swBusy">unregister</button>
        <button v-else @click="registerSW" :disabled="swBusy">register</button>
      </div>
      <div class="row">
        <span>new notification</span>
        <button @click="sendNotification(content)">send</button>
      </div>
      <div class="row">
        <span>title</span>
        <input type="text" v-model="content.title" @keyup.enter="sendNotification(content)">
      </div>
      <div class="row">
        <span>body</span>
        <input type="text" v-model="content.body" @keyup.enter="sendNotification(content)">
      </div>
      <div class="row">
        <span>icon</span>
        <input type="text" v-model="content.icon" @keyup.enter="sendNotification(content)">
      </div>
      <div class="row">
        <span>curl command</span>
        <input type="text" readonly :value="curl">
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
  max-width: 30rem;
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

button:disabled {
  color: var(--fg2);
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

.row > span {
  margin-right: auto;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>

import webpush, { PushSubscription } from "web-push";
import { getSubs } from "../subs";
import { NotifContent } from "../types";

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.log("missing vapid keys, generated new:", webpush.generateVAPIDKeys());
}

webpush.setVapidDetails(
	"https://notif.jktham.dev",
	process.env.VAPID_PUBLIC_KEY ?? "",
	process.env.VAPID_PRIVATE_KEY ?? "",
);

export default defineEventHandler(async event => {
  let content = await readBody<NotifContent>(event);
  let subs = getSubs();

  let count = 0;
  for (let sub of subs) {
    try {
      await webpush.sendNotification(sub, JSON.stringify({
        title: content?.title ?? "",
        body: content?.body ?? "",
        icon: content?.icon ?? "",
        time: Date.now(),
      }), {
        urgency: "high",
      });
      console.log(`sent notification: ${sub.endpoint.slice(-8)}`);
      count++;

    } catch (e) {
      console.error(`error sending notification: ${sub.endpoint.slice(-8)}, ${e}`);
    }
  }

  setResponseStatus(event, 200);
  return `sent ${count} notification${count != 1 ? "s" : ""}`;
});

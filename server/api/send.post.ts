import webpush, { PushSubscription } from "web-push";
import { getSubs } from "../subs";

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.log("missing vapid keys, generated new:", webpush.generateVAPIDKeys());
}

webpush.setVapidDetails(
	"https://notif.jktham.dev",
	process.env.VAPID_PUBLIC_KEY ?? "",
	process.env.VAPID_PRIVATE_KEY ?? ""
);

export default defineEventHandler(async event => {
  let body = await readBody<{title: string, body: string, icon: string}>(event);
  let subs = getSubs();

  let count = 0;
  for (let sub of subs) {
    try {
      let details = webpush.generateRequestDetails(sub as PushSubscription);
      let res = await webpush.sendNotification(sub, JSON.stringify({
        title: body.title ?? "",
        body: body.body ?? "",
        icon: body.icon ?? ""
      }));
      console.log("sent notification:", res.statusCode);
      count++;

    } catch (e) {
      console.error("error sending notification:", e);
    }
  }

  setResponseStatus(event, 200);
  return `sent ${count} notifications`;
});

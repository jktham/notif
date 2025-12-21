import { PushSubscription } from "web-push";
import { addSub, hasSub } from "../subs";

export default defineEventHandler(async event => {
  let body = await readBody<{subscription: PushSubscription}>(event);
  if (!body || !body.subscription) {
    setResponseStatus(event, 400);
    return "missing subscription";
  }

  if (hasSub(body.subscription)) {
    setResponseStatus(event, 200);
    return `already subscribed: ${body.subscription.endpoint.slice(-8)}`;
  }

  addSub(body.subscription);
  
  setResponseStatus(event, 200);
    return `subscribed successfully: ${body.subscription.endpoint.slice(-8)}`;
});

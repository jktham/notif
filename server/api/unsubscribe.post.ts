import { PushSubscription } from "web-push";
import { hasSub, removeSub } from "../subs";

export default defineEventHandler(async event => {
  let body = await readBody<{subscription: PushSubscription}>(event);
  if (!body || !body.subscription) {
    setResponseStatus(event, 400);
    return "missing subscription";
  }
  
  if (!hasSub(body.subscription)) {
    setResponseStatus(event, 200);
    return `not subscribed: ${body.subscription.endpoint.slice(-8)}`;
  }

  removeSub(body.subscription);
  
  setResponseStatus(event, 200);
    return `unsubscribed successfully: ${body.subscription.endpoint.slice(-8)}`;
});

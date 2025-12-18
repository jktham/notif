import { PushSubscription } from "web-push";
import { removeSub } from "../subs";

export default defineEventHandler(async event => {
  let body = await readBody<{subscription: PushSubscription}>(event);
  if (!body || !body.subscription) {
    setResponseStatus(event, 400);
    return "missing subscription";
  }

  removeSub(body.subscription);
  
  setResponseStatus(event, 200);
  return "unsubscribed successfully";
});

import { PushSubscription } from "web-push";
import { addSub } from "../subs";

export default defineEventHandler(async event => {
  let body = await readBody<{subscription: PushSubscription}>(event);
  if (!body || !body.subscription) {
    setResponseStatus(event, 400);
    return "missing subscription";
  }

  addSub(body.subscription);
  
  setResponseStatus(event, 200);
  return "subscribed successfully";
});

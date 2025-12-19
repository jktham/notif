import {readFileSync, writeFileSync, existsSync} from "node:fs";
import { PushSubscription } from "web-push";

export function getSubs(): PushSubscription[] {
  if (!existsSync("./subs.json")) {
	  setSubs([]);
    return [];
  }

  let subs: PushSubscription[] = JSON.parse(readFileSync("./subs.json").toString());
  return subs;
}

export function setSubs(subs: PushSubscription[]) {
  writeFileSync("./subs.json", JSON.stringify(subs));
  console.log(`updated subs.json: [${subs.map(s => s.endpoint.slice(-10)).join(", ")}]`);
}

export function addSub(sub: PushSubscription) {
	let subs = getSubs();
  if (subs.find(s => JSON.stringify(s) === JSON.stringify(sub))) {
    return;
  }
	subs.push(sub);
	setSubs(subs);
}

export function removeSub(sub: PushSubscription) {
  let subs = getSubs();
  if (!subs.find(s => JSON.stringify(s) === JSON.stringify(sub))) {
    return;
  }
  subs = subs.filter(s => JSON.stringify(s) !== JSON.stringify(sub));
  setSubs(subs);
}

export function hasSub(sub: PushSubscription): boolean {
  let subs = getSubs();
  return subs.some(s => JSON.stringify(s) === JSON.stringify(sub));
}

import { SimplePool } from "nostr-tools";

export const pool = new SimplePool();

export const relays = [
  "wss://relay.damus.io",
  "wss://nostr.wine",
];

export function getConnections(onEvent) {
  return pool.subscribeMany(
    relays,
    [{ kinds: [1] }],
    {
      onevent: (ev) => onEvent(ev),
      onerror: (err) => console.error("Relay error:", err),
    }
  );
}

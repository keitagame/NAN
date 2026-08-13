import { SimplePool } from "nostr-tools";

export const pool = new SimplePool();

export const relays = [
  "wss://nos.lol",
  "wss://nostr.mom"
];
export function getConnections(onEvent) {
  const filters = [
    {
      kinds: [1],
      limit: 100,
      since: Math.floor(Date.now() / 1000) - 3600
    }
  ];

  return pool.subscribeMany(
    relays,
    filters,
    {
      onevent(ev) {
        console.log("EVENT:", ev);   // ← 必須ログ
        onEvent(ev);
      },
      onerror(err) {
        console.error("Relay error:", err);
      }
    }
  );
}

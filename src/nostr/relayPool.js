import { SimplePool } from "nostr-tools";

export const pool = new SimplePool();

export const relays = [
  "wss://nos.lol",
  "wss://nostr.mom",
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
];

/**
 * Subscribe to the global feed: text notes (kind 1) plus reactions (kind 7)
 * so likes can be tallied against notes as they arrive.
 */
export function subscribeFeed({ onNote, onReaction, onEose }) {
  const filters = [
    {
      kinds: [1],
      limit: 100,
      since: Math.floor(Date.now() / 1000) - 3600 * 6,
    },
    {
      kinds: [7],
      limit: 300,
      since: Math.floor(Date.now() / 1000) - 3600 * 6,
    },
  ];

  return pool.subscribeMany(relays, filters, {
    onevent(ev) {
      if (ev.kind === 1) {
        onNote?.(ev);
      } else if (ev.kind === 7) {
        onReaction?.(ev);
      }
    },
    oneose() {
      onEose?.();
    },
    onerror(err) {
      console.error("Relay error:", err);
    },
  });
}

/** Fetch a single user's latest kind:0 profile metadata event. */
export async function fetchProfile(pubkey) {
  const event = await pool.get(relays, {
    kinds: [0],
    authors: [pubkey],
    limit: 1,
  });
  if (!event) return null;
  try {
    return { ...JSON.parse(event.content), _event: event };
  } catch {
    return null;
  }
}

/** Fetch profiles for multiple pubkeys at once (one query, many authors). */
export async function fetchProfiles(pubkeys) {
  if (pubkeys.length === 0) return new Map();
  const events = await pool.querySync(relays, {
    kinds: [0],
    authors: [...new Set(pubkeys)],
  });
  const map = new Map();
  for (const ev of events) {
    const existing = map.get(ev.pubkey);
    if (!existing || existing._event.created_at < ev.created_at) {
      try {
        map.set(ev.pubkey, { ...JSON.parse(ev.content), _event: ev });
      } catch {
        // skip malformed metadata
      }
    }
  }
  return map;
}

/** Fetch replies (kind 1 notes tagging the given event id via "e" tag). */
export async function fetchReplies(eventId) {
  return pool.querySync(relays, {
    kinds: [1],
    "#e": [eventId],
    limit: 200,
  });
}

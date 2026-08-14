import { SimplePool } from "nostr-tools";

export const pool = new SimplePool();

export const relays = [
  "wss://nos.lol",
  "wss://relay.nostr.com",
  "wss://nostr.mom",
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
];

/**
 * グローバルフィード
 *
 * 1. querySync() で既存の投稿を取得
 * 2. subscribeMany() で新しい投稿をリアルタイム取得
 *
 * kind 1 = 通常のテキスト投稿
 * kind 7 = リアクション
 */
export function subscribeFeed({
  onNote,
  onReaction,
  onEose,
} = {}) {
  let closed = false;

  // 初期イベント取得
  pool
    .querySync(relays, {
      kinds: [1],
      limit: 100,
    })
    .then((events) => {
      if (closed) return;

      console.log(
        "[NOSTR] initial events:",
        events.length
      );

      const unique = new Map();

      for (const event of events) {
        unique.set(event.id, event);
      }

      const sorted = [...unique.values()].sort(
        (a, b) => b.created_at - a.created_at
      );

      for (const event of sorted) {
        console.log(
          "[NOSTR INITIAL EVENT]",
          event
        );

        onNote?.(event);
      }

      onEose?.();
    })
    .catch((error) => {
      console.error(
        "[NOSTR] initial fetch error:",
        error
      );
    });

  // リアルタイム購読
  const subscription = pool.subscribeMany(
    relays,
    [
      {
        kinds: [1, 7],
      },
    ],
    {
      onevent(event) {
        console.log(
          "[NOSTR REALTIME EVENT]",
          event
        );

        if (event.kind === 1) {
          onNote?.(event);
        } else if (event.kind === 7) {
          onReaction?.(event);
        }
      },

      oneose() {
        console.log(
          "[NOSTR REALTIME EOSE"
        );
      },

      onerror(error) {
        console.error(
          "[NOSTR REALTIME ERROR]",
          error
        );
      },
    }
  );

  // querySync() が終わる前にReactがcleanupしても
  // 以後の結果を無視する
  const originalClose = subscription.close.bind(
    subscription
  );

  subscription.close = () => {
    closed = true;
    originalClose();
  };

  return subscription;
}

/**
 * --------------------------------------------------
 * プロフィール取得
 * --------------------------------------------------
 */

export async function fetchProfile(pubkey) {
  if (!pubkey) {
    return null;
  }

  console.log(
    "[NOSTR] fetchProfile:",
    pubkey
  );

  try {
    const event = await pool.get(
      relays,
      {
        kinds: [0],
        authors: [pubkey],
        limit: 1,
      }
    );

    if (!event) {
      console.log(
        "[NOSTR] profile not found:",
        pubkey
      );

      return null;
    }

    try {
      const metadata =
        JSON.parse(event.content);

      return {
        ...metadata,
        _event: event,
      };

    } catch (error) {
      console.error(
        "[NOSTR] invalid profile JSON:",
        error
      );

      return null;
    }

  } catch (error) {
    console.error(
      "[NOSTR] profile fetch error:",
      error
    );

    return null;
  }
}


/**
 * --------------------------------------------------
 * 複数プロフィール取得
 * --------------------------------------------------
 */

export async function fetchProfiles(
  pubkeys
) {
  if (
    !pubkeys ||
    pubkeys.length === 0
  ) {
    return new Map();
  }

  const uniquePubkeys = [
    ...new Set(pubkeys),
  ];

  console.log(
    "[NOSTR] fetchProfiles:",
    uniquePubkeys.length
  );

  try {
    const events =
      await pool.querySync(
        relays,
        {
          kinds: [0],
          authors: uniquePubkeys,
        }
      );

    const map = new Map();

    for (const event of events) {
      const existing =
        map.get(event.pubkey);

      /*
       * 複数リレーから同じプロフィールが
       * 返ってくるので最新のものだけ残す
       */
      if (
        !existing ||
        existing._event.created_at <
          event.created_at
      ) {
        try {
          const metadata =
            JSON.parse(
              event.content
            );

          map.set(
            event.pubkey,
            {
              ...metadata,
              _event: event,
            }
          );

        } catch {
          console.warn(
            "[NOSTR] invalid metadata:",
            event.pubkey
          );
        }
      }
    }

    return map;

  } catch (error) {
    console.error(
      "[NOSTR] profiles fetch error:",
      error
    );

    return new Map();
  }
}


/**
 * --------------------------------------------------
 * リプライ取得
 * --------------------------------------------------
 */

export async function fetchReplies(
  eventId
) {
  if (!eventId) {
    return [];
  }

  console.log(
    "[NOSTR] fetchReplies:",
    eventId
  );

  try {
    return await pool.querySync(
      relays,
      {
        kinds: [1],
        "#e": [eventId],
        limit: 200,
      }
    );

  } catch (error) {
    console.error(
      "[NOSTR] replies fetch error:",
      error
    );

    return [];
  }
}


/**
 * --------------------------------------------------
 * 接続テスト
 * --------------------------------------------------
 *
 * 必要ならブラウザから
 *
 * testRelay()
 *
 * を呼んで確認できます。
 */

export async function testRelay() {
  console.log(
    "[NOSTR TEST] start"
  );

  try {
    const events =
      await pool.querySync(
        ["wss://nos.lol"],
        {
          kinds: [1],
          limit: 10,
        }
      );

    console.log(
      "[NOSTR TEST] events:",
      events
    );

    for (const event of events) {
      console.log(
        "[NOSTR TEST EVENT]",
        {
          id: event.id,
          pubkey: event.pubkey,
          kind: event.kind,
          content: event.content,
          created_at:
            event.created_at,
        }
      );
    }

    return events;

  } catch (error) {
    console.error(
      "[NOSTR TEST] error:",
      error
    );

    return [];
  }
}
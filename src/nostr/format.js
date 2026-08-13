import { nip19 } from "nostr-tools";

/** Shorten a hex pubkey into a readable npub1abcd…wxyz form. */
export function shortenPubkey(pubkey) {
  if (!pubkey) return "";
  try {
    const npub = nip19.npubEncode(pubkey);
    return `${npub.slice(0, 10)}…${npub.slice(-4)}`;
  } catch {
    return `${pubkey.slice(0, 8)}…`;
  }
}

/** Format a unix timestamp (seconds) as a short relative time string in Japanese. */
export function relativeTime(unixSeconds) {
  const diffMs = Date.now() - unixSeconds * 1000;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSec < 60) return "たった今";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}日前`;
  return new Date(unixSeconds * 1000).toLocaleDateString("ja-JP");
}

/** Pick a display name for an author, falling back to a shortened pubkey. */
export function displayName(profile, pubkey) {
  return profile?.display_name || profile?.name || shortenPubkey(pubkey);
}

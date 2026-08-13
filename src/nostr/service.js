import {
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
  nip19,
} from "nostr-tools";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";

const STORAGE_KEY = "nan_nsec_hex";

/**
 * NostrService centralizes key management and event creation/signing.
 *
 * Internally the secret key is kept as a Uint8Array (`skBytes`), which is
 * what nostr-tools' getPublicKey/finalizeEvent expect. A hex string version
 * (`sk`) is also exposed for convenience/persistence, but signing always
 * uses the raw bytes to avoid subtle type-mismatch bugs.
 */
export class NostrService {
  constructor() {
    this.skBytes = null; // Uint8Array
    this.sk = null; // hex string, derived from skBytes
    this.pk = null; // hex string
    this._restoreFromStorage();
  }

  _restoreFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this._setSecretKey(hexToBytes(saved));
      }
    } catch {
      // localStorage unavailable (private mode, etc.) or corrupted value - ignore
      this.skBytes = null;
      this.sk = null;
      this.pk = null;
    }
  }

  _setSecretKey(skBytes) {
    this.skBytes = skBytes;
    this.sk = bytesToHex(skBytes);
    this.pk = getPublicKey(skBytes);
  }

  get isLoggedIn() {
    return Boolean(this.skBytes && this.pk);
  }

  /** Generate a brand-new keypair and persist it. */
  generateKeys() {
    const skBytes = generateSecretKey();
    this._setSecretKey(skBytes);
    this._persist();
    return { sk: this.sk, pk: this.pk };
  }

  /** Import an existing key, either as raw hex or bech32 nsec. */
  importKey(input) {
    const trimmed = input.trim();
    let skBytes;
    if (trimmed.startsWith("nsec1")) {
      const decoded = nip19.decode(trimmed);
      if (decoded.type !== "nsec") {
        throw new Error("Invalid nsec string");
      }
      skBytes = decoded.data;
    } else if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
      skBytes = hexToBytes(trimmed.toLowerCase());
    } else {
      throw new Error(
        "秘密鍵の形式が正しくありません (nsec1... または 64桁の16進数)"
      );
    }

    this._setSecretKey(skBytes);
    this._persist();
    return { sk: this.sk, pk: this.pk };
  }

  /** Export current key as bech32 nsec, for backup purposes. */
  exportNsec() {
    if (!this.skBytes) return null;
    return nip19.nsecEncode(this.skBytes);
  }

  exportNpub() {
    if (!this.pk) return null;
    return nip19.npubEncode(this.pk);
  }

  logout() {
    this.skBytes = null;
    this.sk = null;
    this.pk = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  _persist() {
    try {
      localStorage.setItem(STORAGE_KEY, this.sk);
    } catch {
      // ignore (e.g. storage quota / private mode)
    }
  }

  _requireLogin() {
    if (!this.isLoggedIn) {
      throw new Error(
        "ログインしていません。先に鍵を生成またはインポートしてください。"
      );
    }
  }

  _sign(partialEvent) {
    this._requireLogin();
    const event = {
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      pubkey: this.pk,
      ...partialEvent,
    };
    return finalizeEvent(event, this.skBytes);
  }

  /** Build and sign a kind:1 text note. Optionally reply to another event. */
  buildNote(content, replyTo /* nostr event being replied to, optional */) {
    const tags = [];
    if (replyTo) {
      // Minimal NIP-10 style reply tags
      tags.push(["e", replyTo.id, "", "reply"]);
      tags.push(["p", replyTo.pubkey]);
    }
    return this._sign({ kind: 1, content, tags });
  }

  /** Build and sign a kind:7 reaction ("+" like) to a target event. */
  buildReaction(targetEvent, content = "+") {
    return this._sign({
      kind: 7,
      content,
      tags: [
        ["e", targetEvent.id],
        ["p", targetEvent.pubkey],
      ],
    });
  }

  /** Build and sign a kind:0 profile metadata event. */
  buildProfile(metadata) {
    return this._sign({ kind: 0, content: JSON.stringify(metadata), tags: [] });
  }

  /** Publish a pre-signed event to a single relay connection object. */
  async publishToRelay(relay, signedEvent) {
    return relay.publish(signedEvent);
  }

  /** Publish a pre-signed event to every relay in the pool. */
  async publishToPool(pool, relayUrls, signedEvent) {
    const results = await Promise.allSettled(
      pool.publish(relayUrls, signedEvent)
    );
    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length === relayUrls.length) {
      throw new Error("すべてのリレーへの送信に失敗しました");
    }
    return results;
  }
}

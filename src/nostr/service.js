import * as secp from "@noble/secp256k1";
import { getPublicKey, finalizeEvent } from "nostr-tools";

export class NostrService {
  constructor() {
    this.sk = null;
    this.pk = null;
  }

  generateKeys() {
    const sk_bytes = secp.utils.randomPrivateKeyBytes();   // v2
    this.sk = secp.utils.bytesToHex(sk_bytes);
    this.pk = getPublicKey(this.sk);

    return { sk: this.sk, pk: this.pk };
  }

  publish(relay, content) {
    const event = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content,
      pubkey: this.pk,
    };

    const signed = finalizeEvent(event, this.sk);
    return relay.publish(signed);
  }
}

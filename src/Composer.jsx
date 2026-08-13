import { Button, TextField } from "@mui/material";
import { relays } from "./nostr/relayPool";
import { useState } from "react"; 
export default function Composer({ nostr }) {
  const [text, setText] = useState("");

  const send = async () => {
    for (const url of relays) {
      const relay = await pool.ensureRelay(url);
      await nostr.publish(relay, text);
    }
    setText("");
  };

  return (
    <>
      <TextField
        fullWidth
        label="Write a note"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button variant="contained" onClick={send}>
        Publish
      </Button>
    </>
  );
}

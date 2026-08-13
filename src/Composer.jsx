import { useState } from "react";
import { Button, TextField, Box } from "@mui/material";
import { pool, relays } from "./nostr/relayPool";

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
    <Box sx={{ p: 2 }}>
      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Write a note"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button sx={{ mt: 2 }} variant="contained" fullWidth onClick={send}>
        Publish
      </Button>
    </Box>
  );
}

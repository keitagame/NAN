import { useState } from "react";
import { Button, TextField, Box, Typography, Alert, Chip } from "@mui/material";
import { pool, relays } from "./nostr/relayPool";
import { useAuth } from "./nostr/AuthContext";

const MAX_LEN = 500;

export default function Composer({ replyTo, onClearReply, onPosted }) {
  const { nostr, isLoggedIn } = useAuth();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    setError("");
    try {
      const signed = nostr.buildNote(text.trim(), replyTo);
      await nostr.publishToPool(pool, relays, signed);
      setText("");
      onClearReply?.();
      onPosted?.(signed);
    } catch (err) {
      setError(err.message || "投稿に失敗しました");
    } finally {
      setSending(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">投稿するにはログインしてください。</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {replyTo && (
        <Chip
          label={`返信先: ${replyTo.content.slice(0, 30)}${
            replyTo.content.length > 30 ? "…" : ""
          }`}
          onDelete={onClearReply}
          sx={{ mb: 1, maxWidth: "100%" }}
        />
      )}
      <TextField
        fullWidth
        multiline
        minRows={3}
        label={replyTo ? "返信を書く" : "いまどうしてる?"}
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
        disabled={sending}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 1,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {text.length} / {MAX_LEN}
        </Typography>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
      <Button
        sx={{ mt: 1 }}
        variant="contained"
        fullWidth
        onClick={send}
        disabled={sending || !text.trim()}
      >
        {sending ? "送信中…" : replyTo ? "返信する" : "投稿する"}
      </Button>
    </Box>
  );
}

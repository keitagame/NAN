import { useEffect, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useAuth } from "../nostr/AuthContext";
import { displayName } from "../nostr/format";
import { pool, relays } from "../nostr/relayPool";
import NoteCard from "./NoteCard";

export default function ProfileView({ onEditProfile }) {
  const { pubkey, profile, nostr } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pubkey) return;
    let cancelled = false;
    setLoading(true);
    pool
      .querySync(relays, { kinds: [1], authors: [pubkey], limit: 50 })
      .then((events) => {
        if (!cancelled) {
          setNotes(events.sort((a, b) => b.created_at - a.created_at));
        }
      })
      .catch((err) => console.error("Failed to load own notes:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pubkey]);

  if (!pubkey) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Paper variant="outlined" sx={{ p: 3, mb: 2, textAlign: "left" }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Avatar src={profile?.picture} sx={{ width: 64, height: 64 }}>
            {!profile?.picture && displayName(profile, pubkey).slice(0, 1)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">{displayName(profile, pubkey)}</Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ wordBreak: "break-all" }}
            >
              {nostr.exportNpub()}
            </Typography>
          </Box>
          <Button variant="outlined" onClick={onEditProfile}>
            編集
          </Button>
        </Box>
        {profile?.about && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            {profile.about}
          </Typography>
        )}
      </Paper>

      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : notes.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", mt: 2 }}>
          まだ投稿がありません。
        </Typography>
      ) : (
        notes.map((ev) => (
          <NoteCard key={ev.id} event={ev} profile={profile} likeCount={0} likedByMe={false} />
        ))
      )}
    </Box>
  );
}

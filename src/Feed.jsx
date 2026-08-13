import { useEffect, useRef, useState } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { subscribeFeed, fetchProfiles } from "./nostr/relayPool";
import { useAuth } from "./nostr/AuthContext";
import NoteCard from "./components/NoteCard";

const MAX_NOTES = 200;

export default function Feed({ onReply }) {
  const { pubkey } = useAuth();
  const [notes, setNotes] = useState([]);
  const [reactions, setReactions] = useState(new Map()); // eventId -> { count, likers: Set }
  const [profiles, setProfiles] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const knownAuthors = useRef(new Set());

  useEffect(() => {
    let closed = false;
    setLoading(true);
    setError("");

    let sub;
    try {
      sub = subscribeFeed({
        onNote: (ev) => {
          if (closed) return;
          setNotes((prev) => {
            if (prev.some((p) => p.id === ev.id)) return prev;
            const next = [ev, ...prev]
              .sort((a, b) => b.created_at - a.created_at)
              .slice(0, MAX_NOTES);
            return next;
          });

          if (!knownAuthors.current.has(ev.pubkey)) {
            knownAuthors.current.add(ev.pubkey);
            fetchProfiles([ev.pubkey]).then((map) => {
              if (closed || map.size === 0) return;
              setProfiles((prev) => {
                const next = new Map(prev);
                for (const [pk, p] of map) next.set(pk, p);
                return next;
              });
            });
          }
        },
        onReaction: (ev) => {
          if (closed) return;
          const targetTag = ev.tags.find((t) => t[0] === "e");
          if (!targetTag) return;
          const targetId = targetTag[1];
          setReactions((prev) => {
            const next = new Map(prev);
            const entry = next.get(targetId) || { count: 0, likers: new Set() };
            if (!entry.likers.has(ev.pubkey)) {
              entry.likers = new Set(entry.likers).add(ev.pubkey);
              entry.count = entry.likers.size;
              next.set(targetId, entry);
            }
            return next;
          });
        },
        onEose: () => {
          if (!closed) setLoading(false);
        },
      });
    } catch (err) {
      setError("リレーへの接続に失敗しました: " + err.message);
      setLoading(false);
    }

    // Safety timeout in case EOSE never arrives from any relay.
    const timeout = setTimeout(() => setLoading(false), 6000);

    return () => {
      closed = true;
      clearTimeout(timeout);
      sub?.close();
    };
  }, []);

  if (loading && notes.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {notes.length === 0 && !loading && (
        <Typography color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
          まだ投稿がありません。最初の投稿をしてみましょう。
        </Typography>
      )}
      {notes.map((ev) => {
        const reaction = reactions.get(ev.id);
        return (
          <NoteCard
            key={ev.id}
            event={ev}
            profile={profiles.get(ev.pubkey)}
            likeCount={reaction?.count || 0}
            likedByMe={pubkey ? Boolean(reaction?.likers?.has(pubkey)) : false}
            onReply={onReply}
          />
        );
      })}
    </Box>
  );
}

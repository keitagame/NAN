import { useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import { displayName, relativeTime, shortenPubkey } from "../nostr/format";
import { useAuth } from "../nostr/AuthContext";
import { pool, relays } from "../nostr/relayPool";

export default function NoteCard({ event, profile, likeCount, likedByMe, onReply }) {
  const { nostr, isLoggedIn } = useAuth();
  const [liked, setLiked] = useState(likedByMe);
  const [count, setCount] = useState(likeCount);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (!isLoggedIn || liked || liking) return;
    setLiking(true);
    try {
      const signed = nostr.buildReaction(event, "+");
      await nostr.publishToPool(pool, relays, signed);
      setLiked(true);
      setCount((c) => c + 1);
    } catch (err) {
      console.error("Failed to like:", err);
    } finally {
      setLiking(false);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, mb: 1.5, display: "flex", gap: 1.5, textAlign: "left" }}
    >
      <Avatar src={profile?.picture} sx={{ width: 44, height: 44 }}>
        {!profile?.picture && displayName(profile, event.pubkey).slice(0, 1)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {displayName(profile, event.pubkey)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {shortenPubkey(event.pubkey)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            · {relativeTime(event.created_at)}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{ mt: 0.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {event.content}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              size="small"
              onClick={handleLike}
              disabled={!isLoggedIn || liked || liking}
              color={liked ? "error" : "default"}
            >
              {liking ? (
                <CircularProgress size={16} />
              ) : liked ? (
                <FavoriteIcon fontSize="small" />
              ) : (
                <FavoriteBorderIcon fontSize="small" />
              )}
            </IconButton>
            <Typography variant="caption" color="text.secondary">
              {count}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => onReply?.(event)} disabled={!isLoggedIn}>
            <ChatBubbleOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}

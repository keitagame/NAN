import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../nostr/AuthContext";
import { pool, relays } from "../nostr/relayPool";

export default function ProfileEditDialog({ open, onClose }) {
  const { nostr, profile, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [picture, setPicture] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(profile?.name || "");
      setAbout(profile?.about || "");
      setPicture(profile?.picture || "");
      setError("");
    }
  }, [open, profile]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const metadata = { name, about, picture };
      const signed = nostr.buildProfile(metadata);
      await nostr.publishToPool(pool, relays, signed);
      await refreshProfile();
      onClose();
    } catch (err) {
      setError(err.message || "プロフィールの保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>プロフィールを編集</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="表示名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="自己紹介"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
          <TextField
            label="アイコン画像URL"
            value={picture}
            onChange={(e) => setPicture(e.target.value)}
            fullWidth
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          キャンセル
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? <CircularProgress size={20} /> : "保存"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

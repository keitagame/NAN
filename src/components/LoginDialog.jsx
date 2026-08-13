import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tabs,
  Tab,
  Box,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useAuth } from "../nostr/AuthContext";

export default function LoginDialog({ open, onClose }) {
  const { generateKeys, importKey, nostr } = useAuth();
  const [tab, setTab] = useState(0);
  const [nsecInput, setNsecInput] = useState("");
  const [error, setError] = useState("");
  const [generatedBackup, setGeneratedBackup] = useState(null);

  const handleGenerate = () => {
    setError("");
    generateKeys();
    setGeneratedBackup({
      nsec: nostr.exportNsec(),
      npub: nostr.exportNpub(),
    });
  };

  const handleImport = () => {
    setError("");
    try {
      importKey(nsecInput);
      setNsecInput("");
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setGeneratedBackup(null);
    setError("");
    setNsecInput("");
    onClose();
  };

  const copyNsec = () => {
    if (generatedBackup?.nsec) {
      navigator.clipboard?.writeText(generatedBackup.nsec);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Nostrアカウント</DialogTitle>
      <DialogContent>
        {generatedBackup ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Alert severity="success">
              新しい鍵ペアを生成しました。秘密鍵(nsec)は今しか表示されません。必ず安全な場所に保存してください。
            </Alert>
            <TextField
              label="秘密鍵 (nsec) — 絶対に他人に見せないでください"
              value={generatedBackup.nsec}
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={copyNsec} edge="end">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="公開鍵 (npub)"
              value={generatedBackup.npub}
              fullWidth
              slotProps={{ input: { readOnly: true } }}
            />
          </Box>
        ) : (
          <Box sx={{ mt: 1 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
              <Tab label="新規作成" />
              <Tab label="鍵でログイン" />
            </Tabs>

            {tab === 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  新しい秘密鍵・公開鍵のペアを生成します。生成後に表示される秘密鍵は必ず控えてください(このデバイスにも自動保存されます)。
                </Typography>
                <Button variant="contained" onClick={handleGenerate}>
                  鍵を生成してはじめる
                </Button>
              </Box>
            )}

            {tab === 1 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  既存の秘密鍵(nsec1... または64桁の16進数)を入力してログインします。
                </Typography>
                <TextField
                  label="秘密鍵 (nsec1... または hex)"
                  value={nsecInput}
                  onChange={(e) => setNsecInput(e.target.value)}
                  fullWidth
                  type="password"
                  autoComplete="off"
                />
                {error && <Alert severity="error">{error}</Alert>}
                <Button
                  variant="contained"
                  onClick={handleImport}
                  disabled={!nsecInput.trim()}
                >
                  ログイン
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {generatedBackup ? "閉じる" : "キャンセル"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

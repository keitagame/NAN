import { AppBar, Toolbar, Button, Typography } from "@mui/material";

export default function TopBar({ nostr }) {
  const generate = () => {
    const keys = nostr.generateKeys();
    alert("鍵生成完了\npubkey: " + keys.pk);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }}>Nostr Client</Typography>
        <Button color="inherit" onClick={generate}>Generate Keys</Button>
      </Toolbar>
    </AppBar>
  );
}

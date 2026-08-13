import { Button } from "@mui/material";

export default function Login({ nostr }) {
  return (
    <Button
      variant="contained"
      onClick={() => {
        const keys = nostr.generateKeys();
        console.log("Generated:", keys);
      }}
    >
      Generate Keys
    </Button>
  );
}

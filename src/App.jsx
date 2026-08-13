import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { theme } from "./theme";
import Sidebar from "./components/Sidebar";
import Feed from "./Feed";
import Composer from "./Composer";
import TopBar from "./components/TopBar";
import { NostrService } from "./nostr/service";

const nostr = new NostrService();

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <TopBar nostr={nostr} />

      <Box sx={{ display: "flex", height: "100vh" }}>
        <Sidebar />
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <Feed />
        </Box>
        <Box sx={{ width: 350, borderLeft: "1px solid #333" }}>
          <Composer nostr={nostr} />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

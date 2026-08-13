import { useState } from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { theme } from "./theme";
import Sidebar from "./components/Sidebar";
import Feed from "./Feed";
import Composer from "./Composer";
import TopBar from "./components/TopBar";
import ProfileView from "./components/ProfileView";
import ProfileEditDialog from "./components/ProfileEditDialog";
import { AuthProvider } from "./nostr/AuthContext";

function AppShell() {
  const [view, setView] = useState("home");
  const [replyTo, setReplyTo] = useState(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [feedKey, setFeedKey] = useState(0);

  const handleReply = (event) => {
    setReplyTo(event);
    setView("home");
  };

  const handlePosted = () => {
    // Force-remount the feed subscription is unnecessary since it's already
    // realtime, but a lightweight bump keeps behavior predictable if we
    // later add manual refresh.
    setFeedKey((k) => k);
  };

  return (
    <>
      <TopBar />

      <Box sx={{ display: "flex", height: "calc(100vh - 64px)" }}>
        <Sidebar view={view} onChangeView={setView} />

        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {view === "home" && <Feed key={feedKey} onReply={handleReply} />}
          {view === "profile" && (
            <ProfileView onEditProfile={() => setEditProfileOpen(true)} />
          )}
        </Box>

        <Box sx={{ width: 350, borderLeft: "1px solid #333", overflowY: "auto" }}>
          <Composer
            replyTo={replyTo}
            onClearReply={() => setReplyTo(null)}
            onPosted={handlePosted}
          />
        </Box>
      </Box>

      <ProfileEditDialog
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}

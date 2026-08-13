import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "../nostr/AuthContext";
import { displayName } from "../nostr/format";
import LoginDialog from "./LoginDialog";
import ProfileEditDialog from "./ProfileEditDialog";

export default function TopBar() {
  const { isLoggedIn, pubkey, profile, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          NAN
        </Typography>

        {isLoggedIn ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {displayName(profile, pubkey)}
            </Typography>
            <Avatar
              src={profile?.picture}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ cursor: "pointer", width: 36, height: 36 }}
            >
              {!profile?.picture && displayName(profile, pubkey).slice(0, 1)}
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setProfileEditOpen(true);
                }}
              >
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>プロフィールを編集</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  logout();
                }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>ログアウト</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button variant="contained" onClick={() => setLoginOpen(true)}>
            ログイン
          </Button>
        )}
      </Toolbar>

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      <ProfileEditDialog
        open={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
      />
    </AppBar>
  );
}

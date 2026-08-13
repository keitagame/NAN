import { Box, List, ListItemButton, ListItemText, ListItemIcon, Tooltip } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "../nostr/AuthContext";

export default function Sidebar({ view, onChangeView }) {
  const { isLoggedIn } = useAuth();

  return (
    <Box sx={{ width: 200, borderRight: "1px solid #333", height: "100%" }}>
      <List>
        <ListItemButton
          selected={view === "home"}
          onClick={() => onChangeView("home")}
        >
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>

        <Tooltip title="近日対応予定" placement="right">
          <span>
            <ListItemButton disabled>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText primary="Notifications" />
            </ListItemButton>
          </span>
        </Tooltip>

        <ListItemButton
          selected={view === "profile"}
          onClick={() => onChangeView("profile")}
          disabled={!isLoggedIn}
        >
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItemButton>
      </List>
    </Box>
  );
}

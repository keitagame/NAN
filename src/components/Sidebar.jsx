import { Box, List, ListItemButton, ListItemText } from "@mui/material";

export default function Sidebar() {
  return (
    <Box sx={{ width: 200, borderRight: "1px solid #333", height: "100%" }}>
      <List>
        <ListItemButton><ListItemText primary="Home" /></ListItemButton>
        <ListItemButton><ListItemText primary="Notifications" /></ListItemButton>
        <ListItemButton><ListItemText primary="Profile" /></ListItemButton>
      </List>
    </Box>
  );
}

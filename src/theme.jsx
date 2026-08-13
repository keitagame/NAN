import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#8ecae6" },
    background: { default: "#0f0f0f", paper: "#1a1a1a" },
  },
  shape: { borderRadius: 10 },
});

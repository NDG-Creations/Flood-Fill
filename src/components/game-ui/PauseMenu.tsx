import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { JabaliBranding } from "./JabaliBranding";
import { HelpScreen } from "./HelpScreen";

interface PauseMenuProps {
  onResume: () => void;
  onLevels?: () => void;
}

export function PauseMenu({ onResume, onLevels }: PauseMenuProps) {
  const [showHelp, setShowHelp] = useState(false);
  if (showHelp) return <HelpScreen onBack={() => setShowHelp(false)} />;

  return (
    <Box sx={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2.2cqh", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", background: "rgba(8,16,29,0.82)", fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      <Typography sx={{ fontSize: "7cqh", fontWeight: 800, color: "#fff", mb: "1cqh" }}>Paused</Typography>
      <Box component="button" onClick={onResume} sx={{ px: "6cqw", py: "2.2cqh", minHeight: 44, borderRadius: "18px", fontSize: "2.8cqh", fontWeight: 800, color: "#fff", background: "#4ade80", border: "none" }}>Resume</Box>
      {onLevels && (
        <Box component="button" onClick={onLevels} sx={{ px: "6cqw", py: "2.2cqh", minHeight: 44, borderRadius: "18px", fontSize: "2.8cqh", fontWeight: 800, color: "#fff", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
          Back to Levels
        </Box>
      )}
      <Box sx={{ mt: "1cqh", color: "#d8e2ff", fontSize: "1.9cqh", textAlign: "center", px: "8cqw" }}>Monetization hook: watch an ad in the full release to earn extra moves.</Box>
      <Box sx={{ position: "absolute", bottom: "2cqh" }}><JabaliBranding /></Box>
    </Box>
  );
}

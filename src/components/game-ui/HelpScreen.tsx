import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { JabaliBranding } from "./JabaliBranding";

interface HelpScreenProps {
  onBack: () => void;
}

function Chip({ label, sub }: { label: string; sub: string }) {
  return (
    <Box sx={{ background: "rgba(255,255,255,0.08)", borderRadius: "18px", padding: "1.4cqh 2.8cqw" }}>
      <Typography sx={{ fontSize: "2cqh", fontWeight: 700 }}>{label}</Typography>
      <Typography sx={{ fontSize: "1.8cqh", opacity: 0.8 }}>{sub}</Typography>
    </Box>
  );
}

export function HelpScreen({ onBack }: HelpScreenProps) {
  return (
    <Box sx={{ position: "absolute", inset: 0, zIndex: 20, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", background: "rgba(8,16,29,0.84)", display: "flex", flexDirection: "column", color: "#fff", padding: "4cqh 7cqw", overflow: "hidden" }}>
      <Typography sx={{ fontSize: "7.5cqh", fontWeight: 800, textAlign: "center", mb: "2cqh" }}>How to Play</Typography>
      <Typography sx={{ textAlign: "center", fontSize: "2.2cqh", color: "#d8e2ff", mb: "2.5cqh" }}>
        Tap a color chip to flood the connected region. Match the target before moves or time run out.
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5cqh", mb: "2cqh" }}>
        <Chip label="Classic" sub="Beat each level with move limits" />
        <Chip label="Blitz" sub="Race the ghost opponent" />
        <Chip label="Zen" sub="No timer, no pressure" />
        <Chip label="Power-Ups" sub="Extra moves + rewarded ad hooks" />
      </Box>
      <Box sx={{ background: "rgba(255,255,255,0.06)", borderRadius: "24px", padding: "2cqh 3cqw", mb: "2cqh" }}>
        <Typography sx={{ fontSize: "2.3cqh", fontWeight: 800, mb: "1cqh" }}>Controls</Typography>
        <Typography sx={{ fontSize: "2cqh", lineHeight: 1.5 }}>• Tap color chips at the bottom</Typography>
        <Typography sx={{ fontSize: "2cqh", lineHeight: 1.5 }}>• Use the Mode button to switch play styles</Typography>
        <Typography sx={{ fontSize: "2cqh", lineHeight: 1.5 }}>• Pause anytime to restart or view help</Typography>
      </Box>
      <Box component="button" onClick={onBack} sx={{ mt: "auto", background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "18px", py: "2cqh", fontSize: "2.5cqh", fontWeight: 800 }}>Back</Box>
      <Box sx={{ mt: "1.5cqh" }}><JabaliBranding /></Box>
    </Box>
  );
}

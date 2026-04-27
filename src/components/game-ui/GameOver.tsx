import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { JabaliBranding } from "./JabaliBranding";

interface GameOverProps { score: number; onRestart: () => void; onLevels?: () => void; }

export function GameOver({ score, onRestart, onLevels }: GameOverProps) {
  return (
    <Box sx={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", background: "rgba(8,16,29,0.86)", fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      <Typography sx={{ fontSize: "10cqh", fontWeight: 800, textTransform: "uppercase", color: "#ff7b7b", letterSpacing: "0.04em" }}>Game Over</Typography>
      <Typography sx={{ fontSize: "4.8cqh", color: "#fff", opacity: 0.85, mt: "1.2cqh" }}>Score: {score}</Typography>
      <Typography sx={{ fontSize: "2cqh", color: "#d8e2ff", mt: "1.2cqh", px: "8cqw", textAlign: "center" }}>Earn extra moves with rewarded ads in the full build.</Typography>
      <Box component="button" onClick={onRestart} sx={{ mt: "3.5cqh", px: "6cqw", py: "2.3cqh", minHeight: 44, borderRadius: "18px", fontSize: "2.8cqh", fontWeight: 800, color: "#fff", background: "#4ade80", border: "none" }}>Play Again</Box>
      {onLevels && <Box component="button" onClick={onLevels} sx={{ mt: "1.2cqh", px: "6cqw", py: "2.3cqh", minHeight: 44, borderRadius: "18px", fontSize: "2.8cqh", fontWeight: 800, color: "#fff", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>Back to Levels</Box>}
      <Box sx={{ position: "absolute", bottom: "2cqh" }}><JabaliBranding /></Box>
    </Box>
  );
}

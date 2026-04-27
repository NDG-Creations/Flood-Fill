import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface HUDProps {
  score: number;
  onLevels?: () => void;
  onBonusTime?: () => void;
  onBonusTries?: () => void;
  bonusTimeAvailable?: boolean;
  bonusTriesAvailable?: boolean;
}

export function HUD({
  score,
  onLevels,
  onBonusTime,
  onBonusTries,
  bonusTimeAvailable = false,
  bonusTriesAvailable = false,
}: HUDProps) {
  return (
    <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 5, display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "2.5cqh 4cqw", paddingTop: "max(2.5cqh, env(safe-area-inset-top, 0px))", pointerEvents: "none" }}>
      <Box sx={{ pointerEvents: "none" }}>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: "0.7cqw", background: "rgba(0,0,0,0.32)", borderRadius: "999px", padding: "0.55cqh 2.1cqw", fontSize: "2.7cqh", fontWeight: 800, color: "#fff", fontFamily: "Inter, system-ui, -apple-system, sans-serif", lineHeight: 1.2 }}>
          <Typography component="span" sx={{ fontSize: "inherit", fontWeight: 800, color: "inherit" }}>Score</Typography>
          <Typography component="span" sx={{ fontSize: "inherit", fontWeight: 900, color: "inherit" }}>{score}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: "1cqw", pointerEvents: "auto" }}>
        {onBonusTime && <ActionIcon onClick={onBonusTime} title={bonusTimeAvailable ? "Bonus time" : "Not available right now"} disabled={!bonusTimeAvailable}>⏱</ActionIcon>}
        {onBonusTries && <ActionIcon onClick={onBonusTries} title={bonusTriesAvailable ? "Bonus tries" : "Not available right now"} disabled={!bonusTriesAvailable}>🎯</ActionIcon>}
        {onLevels && <ActionIcon onClick={onLevels} title="Back">←</ActionIcon>}
      </Box>
    </Box>
  );
}

function ActionIcon({ onClick, title, children, disabled = false }: { onClick: () => void; title: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <Box component="button" onClick={disabled ? undefined : onClick} aria-label={title} sx={{ minHeight: 44, minWidth: 44, width: 52, height: 52, borderRadius: "50%", background: disabled ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)", border: "none", color: disabled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.95)", fontSize: "1.4rem", fontWeight: 800, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </Box>
  );
}

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface MapSelectProps {
  onChooseLadder: () => void;
}

const maps = [
  { name: "Ladder Map", active: true, subtitle: "Climb the main path" },
  { name: "Cloud Map", active: false, subtitle: "Coming soon" },
  { name: "Candy Map", active: false, subtitle: "Coming soon" },
  { name: "Crystal Map", active: false, subtitle: "Coming soon" },
];

export function MapSelect({ onChooseLadder }: MapSelectProps) {
  return (
    <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #09111f 0%, #16274c 52%, #08101d 100%)", padding: "max(3cqh, env(safe-area-inset-top, 0px)) 4cqw max(4cqh, env(safe-area-inset-bottom, 0px))", overflow: "auto" }}>
      <Box component="img" src="images/gamer-auth-bg.png" alt="Gamer background" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.14, filter: "saturate(1.25)" as any }} />
      <Typography sx={{ position: "relative", fontSize: "6cqh", fontWeight: 900, textAlign: "center", color: "#fff", mb: "1cqh", textShadow: "0 2px 12px rgba(0,0,0,0.55)" }}>Choose a Map</Typography>
      <Typography sx={{ position: "relative", fontSize: "1.9cqh", textAlign: "center", color: "#d8e2ff", mb: "3cqh" }}>Only Ladder Map is unlocked for now. More maps coming soon.</Typography>
      <Box sx={{ position: "relative", display: "grid", gap: "1.4cqh", maxWidth: 560, mx: "auto" }}>
        {maps.map((map) => (
          <Box key={map.name} component="button" onClick={map.active ? onChooseLadder : undefined} sx={{ minHeight: 76, borderRadius: "22px", border: map.active ? "2px solid rgba(125,198,255,0.35)" : "2px dashed rgba(148,163,184,0.65)", background: map.active ? "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(232,244,255,0.9))" : "rgba(255,255,255,0.65)", color: "#1d2333", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.4cqh 4cqw", fontSize: "2.2cqh", fontWeight: 800, cursor: map.active ? "pointer" : "not-allowed", opacity: map.active ? 1 : 0.7, boxShadow: "0 10px 20px rgba(0,0,0,0.15)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "1cqw" }}>
              <Box sx={{ width: 28, height: 28, borderRadius: "50%", background: map.active ? "linear-gradient(180deg, #7dc6ff, #4285F4)" : "rgba(148,163,184,0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                {map.active ? "✓" : "🔒"}
              </Box>
              <Box>
                <Typography sx={{ fontSize: "2.2cqh", fontWeight: 900 }}>{map.name}</Typography>
                <Typography sx={{ fontSize: "1.55cqh", color: map.active ? "#2563eb" : "#64748b" }}>{map.subtitle}</Typography>
              </Box>
            </Box>
            <Typography sx={{ fontSize: "1.6cqh", color: map.active ? "#2563eb" : "#64748b" }}>
              {map.active ? "Play" : "Coming soon"}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

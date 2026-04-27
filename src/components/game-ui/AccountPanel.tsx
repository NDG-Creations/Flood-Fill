import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface AccountPanelProps {
  signedIn: boolean;
  displayName: string;
  email: string;
  provider: "google" | "guest";
  progressCount: number;
  totalLevels: number;
  onAuth: () => void;
  onSignOut: () => void;
  syncStatus?: string;
}

export function AccountPanel({ signedIn, displayName, email, provider, progressCount, totalLevels, onAuth, onSignOut, syncStatus }: AccountPanelProps) {
  const initial = (displayName || email || "G").trim().charAt(0).toUpperCase();
  return (
    <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 5, padding: "1.2cqh 4cqw max(1.2cqh, env(safe-area-inset-bottom, 0px))", pointerEvents: "none" }}>
      <Box sx={{ pointerEvents: "auto", background: "rgba(8,16,29,0.92)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "22px", padding: "1.1cqh 3.5cqw", color: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.24)" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: "1.2cqw", alignItems: "center", flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "1cqw" }}>
            <Box sx={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(180deg, #7dc6ff, #4285F4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "2cqh" }}>
              {initial}
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1.8cqh", fontWeight: 800 }}>{displayName}</Typography>
              <Typography sx={{ fontSize: "1.45cqh", color: "#d8e2ff" }}>{progressCount}/{totalLevels} cleared</Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontSize: "1.45cqh", color: signedIn ? "#7dd3fc" : "#a6b8ff" }}>{syncStatus ?? (signedIn ? "Cloud sync on" : "Local only")}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: "1cqw", mt: "1cqh", flexWrap: "wrap" }}>
          <Box component="button" onClick={onAuth} sx={buttonStylePrimary}>{signedIn ? "Account" : "Sign in"}</Box>
          {signedIn && <Box component="button" onClick={onSignOut} sx={buttonStyleSecondary}>Log out</Box>}
        </Box>
      </Box>
    </Box>
  );
}

const buttonStylePrimary = { minHeight: 40, px: "4cqw", py: "1cqh", borderRadius: "16px", fontSize: "1.7cqh", fontWeight: 800, color: "#fff", background: "linear-gradient(180deg, #4285F4, #2b66d9)", border: "none", cursor: "pointer" };
const buttonStyleSecondary = { minHeight: 40, px: "4cqw", py: "1cqh", borderRadius: "16px", fontSize: "1.7cqh", fontWeight: 800, color: "#fff", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" };

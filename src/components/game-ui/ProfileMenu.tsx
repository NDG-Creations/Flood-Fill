import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface ProfileMenuProps {
  initial: string;
  signedIn: boolean;
  onBack: () => void;
  onLogout: () => void;
  onResetGuest?: () => void;
  onResync?: () => void;
}

export function ProfileMenu({ initial, signedIn, onBack, onLogout, onResetGuest, onResync }: ProfileMenuProps) {
  return (
    <Box sx={{ position: "absolute", inset: 0, zIndex: 40, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", background: "rgba(5,10,18,0.65)", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: "max(3cqh, env(safe-area-inset-top, 0px)) 4cqw 4cqh" }}>
      <Box sx={{ width: 220, borderRadius: "22px", background: "rgba(8,16,29,0.96)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 18px 36px rgba(0,0,0,0.3)", padding: "1.6cqh 3cqw" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "1cqw", mb: "1.2cqh" }}>
          <Box sx={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(180deg, #7dc6ff, #4285F4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "2cqh" }}>{initial}</Box>
          <Box>
            <Typography sx={{ fontWeight: 800 }}>Profile</Typography>
            <Typography sx={{ fontSize: "1.5cqh", color: "#d8e2ff" }}>{signedIn ? "Google account" : "Guest"}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: "1cqh" }}>
          <Box component="button" onClick={onBack} sx={btn}>Back</Box>
          {signedIn && onResync && <Box component="button" onClick={onResync} sx={btn}>Resync</Box>}
          {!signedIn && onResetGuest && <Box component="button" onClick={onResetGuest} sx={btn}>Reset Guest</Box>}
          {signedIn && <Box component="button" onClick={onLogout} sx={btn}>Log out</Box>}
        </Box>
      </Box>
    </Box>
  );
}

const btn = { minHeight: 42, borderRadius: 14, border: "none", background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 800, cursor: "pointer" };

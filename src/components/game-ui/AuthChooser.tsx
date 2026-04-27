import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export type AuthProviderChoice = "google" | "guest";

interface AuthChooserProps {
  onChoose: (provider: AuthProviderChoice) => void;
  onClose?: () => void;
}

export function AuthChooser({ onChoose, onClose }: AuthChooserProps) {
  return (
    <Box sx={{ position: "absolute", inset: 0, zIndex: 30, backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", background: "rgba(5,10,18,0.82)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4cqw" }}>
      <Box sx={{ width: "100%", maxWidth: "420px", background: "rgba(8,16,29,0.96)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "24px", padding: "3cqh 4cqw", color: "#fff", boxShadow: "0 20px 40px rgba(0,0,0,0.35)" }}>
        <Typography sx={{ fontSize: "5cqh", fontWeight: 900, textAlign: "center" }}>Sign in</Typography>
        <Typography sx={{ fontSize: "1.9cqh", color: "#d8e2ff", textAlign: "center", mt: "0.8cqh", mb: "2.2cqh" }}>Choose Google to back up your progress or continue as Guest.</Typography>

        <Box sx={{ display: "grid", gap: "1.2cqh" }}>
          <Box component="button" onClick={() => onChoose("google")} sx={{ minHeight: 50, borderRadius: "18px", border: "none", color: "#fff", background: "linear-gradient(180deg, #4285F4, #2b66d9)", fontSize: "2cqh", fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 20px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8cqw" }}>
            <GoogleIcon />
            Continue with Google
          </Box>
          <Box component="button" onClick={() => onChoose("guest")} sx={{ minHeight: 50, borderRadius: "18px", border: "1px solid rgba(255,255,255,0.16)", color: "#fff", background: "rgba(255,255,255,0.08)", fontSize: "2cqh", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8cqw" }}>
            <GuestIcon />
            Play as Guest
          </Box>
        </Box>

        {onClose && (
          <Box component="button" onClick={onClose} sx={{ mt: "1.5cqh", width: "100%", minHeight: 44, borderRadius: "18px", border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#fff", fontSize: "1.8cqh", fontWeight: 700, cursor: "pointer" }}>
            Close
          </Box>
        )}
      </Box>
    </Box>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#fff" d="M21.35 11.1H12v3.9h5.35c-.23 1.3-.98 2.4-2.1 3.1v2.6h3.4c1.99-1.83 3.13-4.53 3.13-7.74 0-.72-.06-1.4-.43-1.86z" />
      <path fill="#fff" d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.4-2.6c-.95.64-2.17 1.03-3.23 1.03-2.48 0-4.58-1.67-5.33-3.92H2.15v2.46A10 10 0 0 0 12 22z" />
      <path fill="#fff" d="M6.67 14.07A6 6 0 0 1 6.35 12c0-.72.11-1.42.32-2.07V7.47H2.15A10 10 0 0 0 2 12c0 1.61.39 3.13 1.1 4.46l3.57-2.39z" />
      <path fill="#fff" d="M12 6.1c1.48 0 2.8.51 3.85 1.51l2.88-2.88A9.68 9.68 0 0 0 12 2a10 10 0 0 0-9.85 5.47l3.57 2.46C7.42 7.8 9.52 6.1 12 6.1z" />
    </svg>
  );
}

function GuestIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" fill="#fff" />
      <path d="M4 22c1.8-4.2 5-6 8-6s6.2 1.8 8 6" fill="#fff" />
    </svg>
  );
}

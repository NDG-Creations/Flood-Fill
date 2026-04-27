import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface AuthWelcomeProps {
  onGoogle: () => void;
  onGuest: () => void;
}

export function AuthWelcome({ onGoogle, onGuest }: AuthWelcomeProps) {
  return (
    <Box sx={styles.screen}>
      <Box component="img" src="images/gamer-auth-bg.png" alt="Game background" sx={styles.bg as any} />
      <Box sx={styles.vignette} />
      <Box sx={styles.card}>
        <Typography sx={styles.kicker}>FLOOD FILL</Typography>
        <Typography sx={styles.title}>Ready to Play?</Typography>
        <Typography sx={styles.subtitle}>Sign in to save progress or continue as a guest.</Typography>

        <Box sx={styles.buttonRow}>
          <Box component="button" onClick={onGoogle} sx={{ ...styles.button, ...styles.primaryButton }}>
            <GoogleIcon />
            Sign in
          </Box>
          <Box component="button" onClick={onGuest} sx={{ ...styles.button, ...styles.secondaryButton }}>
            <GuestIcon />
            Guest
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.35 11.1H12v3.9h5.35c-.23 1.3-.98 2.4-2.1 3.1v2.6h3.4c1.99-1.83 3.13-4.53 3.13-7.74 0-.72-.06-1.4-.43-1.86z" /></svg>
  );
}
function GuestIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="currentColor" /><path d="M4 22c1.8-4.2 5-6 8-6s6.2 1.8 8 6" fill="currentColor" /></svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  screen: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "5cqw", background: "linear-gradient(180deg, #09111f 0%, #16274c 52%, #08101d 100%)", overflow: "hidden" },
  bg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.9, filter: "saturate(1.2) contrast(1.05)" },
  vignette: { position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 25%, rgba(125,198,255,0.18), transparent 38%), radial-gradient(circle at 50% 65%, rgba(168,85,247,0.14), transparent 34%)" },
  card: { position: "relative", width: "100%", maxWidth: 480, borderRadius: 30, padding: "4.5cqh 5cqw", background: "rgba(8,16,29,0.78)", color: "#fff", boxShadow: "0 20px 50px rgba(0,0,0,0.36)", border: "1px solid rgba(125,198,255,0.22)", backdropFilter: "blur(12px)" },
  kicker: { fontSize: "1.6cqh", letterSpacing: "0.28em", textTransform: "uppercase", color: "#7dd3fc", textAlign: "center", fontWeight: 900 },
  title: { fontSize: "7cqh", fontWeight: 900, textAlign: "center", lineHeight: 1.05, textShadow: "0 2px 10px rgba(0,0,0,0.45)" },
  subtitle: { marginTop: "1.2cqh", textAlign: "center", color: "#d8e2ff", fontSize: "2cqh" },
  buttonRow: { display: "grid", gridTemplateColumns: "1fr", gap: "1.2cqh", marginTop: "3cqh" },
  button: { minHeight: 54, border: "none", borderRadius: 18, fontSize: "2.2cqh", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", boxShadow: "0 10px 20px rgba(0,0,0,0.25)" },
  primaryButton: { background: "linear-gradient(180deg, #4285F4, #2b66d9)" },
  secondaryButton: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" },
};

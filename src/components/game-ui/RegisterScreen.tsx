import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useState } from "react";

interface RegisterScreenProps {
  onGoogleCreate: () => void;
  onManualCreate: (data: { name: string; email: string; password: string; dob: string }) => void;
  onBack: () => void;
}

export function RegisterScreen({ onGoogleCreate, onManualCreate, onBack }: RegisterScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");

  return (
    <Box sx={styles.screen}>
      <Box component="img" src="images/gamer-auth-bg.png" alt="Game background" sx={styles.bg as any} />
      <Box sx={styles.glow} />
      <Box sx={styles.card}>
        <Typography sx={styles.kicker}>CREATE ACCOUNT</Typography>
        <Typography sx={styles.title}>Register</Typography>
        <Typography sx={styles.subtitle}>Use Google to skip passwords, or create manually.</Typography>

        <Box sx={styles.buttonRow}>
          <Box component="button" onClick={onGoogleCreate} sx={{ ...styles.button, ...styles.primaryButton }}>
            <GoogleIcon />
            Create with Google
          </Box>
        </Box>

        <Box sx={styles.divider} />

        <Box component="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" sx={styles.input as any} />
        <Box component="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" sx={styles.input as any} />
        <Box component="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" sx={styles.input as any} />
        <Box component="input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} sx={styles.input as any} />

        <Box sx={styles.buttonRow}>
          <Box component="button" onClick={() => onManualCreate({ name: name.trim(), email: email.trim().toLowerCase(), password, dob })} sx={{ ...styles.button, ...styles.secondaryButton }}>Create account</Box>
          <Box component="button" onClick={onBack} sx={{ ...styles.button, ...styles.ghostButton }}>Back</Box>
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

const styles: Record<string, React.CSSProperties> = {
  screen: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "5cqw", background: "linear-gradient(180deg, #09111f 0%, #16274c 52%, #08101d 100%)", overflow: "hidden" },
  bg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.92, filter: "saturate(1.2) contrast(1.05)" },
  glow: { position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 20%, rgba(125,198,255,0.18), transparent 38%), radial-gradient(circle at 50% 70%, rgba(168,85,247,0.16), transparent 35%)" },
  card: { position: "relative", width: "100%", maxWidth: 520, borderRadius: 30, padding: "4.2cqh 5cqw", background: "rgba(8,16,29,0.78)", color: "#fff", boxShadow: "0 20px 50px rgba(0,0,0,0.36)", border: "1px solid rgba(125,198,255,0.22)", backdropFilter: "blur(12px)" },
  kicker: { fontSize: "1.5cqh", letterSpacing: "0.25em", textTransform: "uppercase", color: "#7dd3fc", textAlign: "center", fontWeight: 900 },
  title: { fontSize: "6cqh", fontWeight: 900, textAlign: "center", lineHeight: 1.05, textShadow: "0 2px 10px rgba(0,0,0,0.45)" },
  subtitle: { marginTop: "1.1cqh", textAlign: "center", color: "#d8e2ff", fontSize: "1.9cqh" },
  divider: { height: 1, background: "rgba(255,255,255,0.12)", margin: "2.2cqh 0" },
  input: { width: "100%", marginTop: "1.1cqh", minHeight: 50, borderRadius: 18, border: "1px solid rgba(125,198,255,0.24)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: "2cqh", padding: "0 16px", outline: "none" },
  buttonRow: { display: "grid", gap: "1.05cqh", marginTop: "1.6cqh" },
  button: { minHeight: 50, border: "none", borderRadius: 18, fontSize: "2.1cqh", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 10px 20px rgba(0,0,0,0.25)" },
  primaryButton: { background: "linear-gradient(180deg, #4285F4, #2b66d9)" },
  secondaryButton: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" },
  ghostButton: { background: "transparent", border: "1px solid rgba(255,255,255,0.12)" },
};

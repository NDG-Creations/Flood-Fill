import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useState } from "react";

interface SignInScreenProps {
  onSignIn: (email: string, password: string) => void;
  onGoRegister: () => void;
  onBack: () => void;
}

export function SignInScreen({ onSignIn, onGoRegister, onBack }: SignInScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Box sx={styles.screen}>
      <Box component="img" src="images/gamer-auth-bg.png" alt="Game background" sx={styles.bg as any} />
      <Box sx={styles.glow} />
      <Box sx={styles.card}>
        <Typography sx={styles.kicker}>ACCOUNT LOGIN</Typography>
        <Typography sx={styles.title}>Sign In</Typography>
        <Typography sx={styles.subtitle}>Use your email and password to continue.</Typography>

        <Box component="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" sx={styles.input as any} />
        <Box component="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" sx={styles.input as any} />

        <Box sx={styles.buttonRow}>
          <Box component="button" onClick={() => onSignIn(email.trim().toLowerCase(), password)} sx={{ ...styles.button, ...styles.primaryButton }}>Sign in</Box>
          <Box component="button" onClick={onGoRegister} sx={{ ...styles.button, ...styles.secondaryButton }}>Register now</Box>
          <Box component="button" onClick={onBack} sx={{ ...styles.button, ...styles.ghostButton }}>Back</Box>
        </Box>
      </Box>
    </Box>
  );
}

const styles: Record<string, React.CSSProperties> = {
  screen: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "5cqw", background: "linear-gradient(180deg, #09111f 0%, #16274c 52%, #08101d 100%)", overflow: "hidden" },
  bg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.92, filter: "saturate(1.2) contrast(1.05)" },
  glow: { position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 20%, rgba(125,198,255,0.18), transparent 38%), radial-gradient(circle at 50% 70%, rgba(168,85,247,0.16), transparent 35%)" },
  card: { position: "relative", width: "100%", maxWidth: 460, borderRadius: 30, padding: "4.5cqh 5cqw", background: "rgba(8,16,29,0.78)", color: "#fff", boxShadow: "0 20px 50px rgba(0,0,0,0.36)", border: "1px solid rgba(125,198,255,0.22)", backdropFilter: "blur(12px)" },
  kicker: { fontSize: "1.5cqh", letterSpacing: "0.25em", textTransform: "uppercase", color: "#7dd3fc", textAlign: "center", fontWeight: 900 },
  title: { fontSize: "6cqh", fontWeight: 900, textAlign: "center", lineHeight: 1.05, textShadow: "0 2px 10px rgba(0,0,0,0.45)" },
  subtitle: { marginTop: "1.1cqh", textAlign: "center", color: "#d8e2ff", fontSize: "1.9cqh" },
  input: { width: "100%", marginTop: "2.2cqh", minHeight: 52, borderRadius: 18, border: "1px solid rgba(125,198,255,0.24)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: "2cqh", padding: "0 16px", outline: "none" },
  buttonRow: { display: "grid", gap: "1.05cqh", marginTop: "2.4cqh" },
  button: { minHeight: 50, border: "none", borderRadius: 18, fontSize: "2.1cqh", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 10px 20px rgba(0,0,0,0.25)" },
  primaryButton: { background: "linear-gradient(180deg, #4285F4, #2b66d9)" },
  secondaryButton: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" },
  ghostButton: { background: "transparent", border: "1px solid rgba(255,255,255,0.12)" },
};

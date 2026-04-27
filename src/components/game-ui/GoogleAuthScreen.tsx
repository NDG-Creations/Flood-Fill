import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useState } from "react";

interface GoogleAuthScreenProps {
  onContinue: (email: string) => void;
  onBack: () => void;
  email: string;
}

export function GoogleAuthScreen({ onContinue, onBack, email: initialEmail }: GoogleAuthScreenProps) {
  const [email, setEmail] = useState(initialEmail);

  return (
    <Box sx={styles.screen}>
      <Box component="img" src="images/gamer-auth-bg.png" alt="Gamer background" sx={styles.bg as any} />
      <Box sx={styles.overlay} />
      <Box sx={styles.card}>
        <Typography sx={styles.title}>Google</Typography>
        <Typography sx={styles.subtitle}>This is a separate step for Gmail sign-in.</Typography>

        <Box component="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" sx={styles.input as any} />

        <Box sx={styles.buttonRow}>
          <Box component="button" onClick={() => onContinue(email.trim().toLowerCase())} sx={{ ...styles.button, ...styles.primaryButton }}>Sign in</Box>
          <Box component="button" onClick={onBack} sx={{ ...styles.button, ...styles.secondaryButton }}>Back</Box>
        </Box>
      </Box>
    </Box>
  );
}

const styles: Record<string, React.CSSProperties> = {
  screen: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "5cqw", background: "linear-gradient(180deg, #0b1020 0%, #101a33 100%)", overflow: "hidden" },
  bg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.9, filter: "saturate(1.25) contrast(1.05)" },
  overlay: { position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 30%, rgba(125,198,255,0.18), transparent 40%), radial-gradient(circle at 50% 70%, rgba(168,85,247,0.16), transparent 35%)" },
  card: { position: "relative", width: "100%", maxWidth: 460, borderRadius: 28, padding: "4cqh 5cqw", background: "rgba(8,16,29,0.78)", color: "#fff", boxShadow: "0 18px 44px rgba(0,0,0,0.32)", border: "1px solid rgba(125,198,255,0.22)", backdropFilter: "blur(12px)" },
  title: { fontSize: "6cqh", fontWeight: 900, textAlign: "center", lineHeight: 1.1 },
  subtitle: { marginTop: "1cqh", textAlign: "center", color: "#d8e2ff", fontSize: "2cqh" },
  input: { width: "100%", marginTop: "3cqh", minHeight: 52, borderRadius: 18, border: "1px solid rgba(125,198,255,0.24)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: "2cqh", padding: "0 16px", outline: "none" },
  buttonRow: { display: "grid", gridTemplateColumns: "1fr", gap: "1.2cqh", marginTop: "3cqh" },
  button: { minHeight: 52, border: "none", borderRadius: 18, fontSize: "2.2cqh", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", boxShadow: "0 10px 20px rgba(0,0,0,0.25)" },
  primaryButton: { background: "linear-gradient(180deg, #4285F4, #2b66d9)" },
  secondaryButton: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" },
};

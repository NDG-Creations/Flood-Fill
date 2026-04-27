import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface LevelProgress {
  unlocked: boolean;
  completed: boolean;
  bestScore: number | null;
}

interface LevelSelectProps {
  levels: LevelProgress[];
  onSelectLevel: (levelIndex: number) => void;
  onBonusTime?: () => void;
  onBonusTries?: () => void;
}

function getDifficultyLabel(idx: number) {
  if (idx < 20) return "Easy";
  if (idx < 50) return "Hard";
  return "Extreme";
}

function LevelNode({ idx, level, onSelect, left, top }: { idx: number; level: LevelProgress; onSelect: () => void; left: string; top: string }) {
  const locked = !level.unlocked;
  const completed = level.completed;
  const difficulty = getDifficultyLabel(idx);
  return (
    <Box component="button" onClick={() => !locked && onSelect()} sx={{ position: "absolute", left, top, transform: "translate(-50%, -50%)", width: "clamp(44px, 7vw, 62px)", height: "clamp(44px, 7vw, 62px)", borderRadius: "50%", border: completed ? "2px solid rgba(8,15,30,0.35)" : locked ? "1.5px solid rgba(0,0,0,0.10)" : "2px solid rgba(245, 158, 11, 0.85)", background: completed ? "radial-gradient(circle at 30% 30%, #b6e3ff, #7dc6ff 68%)" : locked ? "radial-gradient(circle at 30% 30%, #ffe88a, #f4c542 72%)" : difficulty === "Extreme" ? "radial-gradient(circle at 30% 30%, #ff7b7b, #f43f5e 72%)" : difficulty === "Hard" ? "radial-gradient(circle at 30% 30%, #ffb86b, #fb923c 72%)" : "radial-gradient(circle at 30% 30%, #fff2aa, #ffca3a 72%)", color: completed ? "#07111f" : "#2b1d00", boxShadow: completed ? "0 6px 16px rgba(125,198,255,0.20)" : locked ? "0 6px 14px rgba(244,197,66,0.16)" : "0 8px 18px rgba(245,158,11,0.16)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.02cqh", cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.9 : 1, padding: 0, touchAction: "manipulation" }}>
      <Typography sx={{ fontSize: "clamp(10px, 1.4vw, 14px)", fontWeight: 900, lineHeight: 1 }}>{idx + 1}</Typography>
      <Typography sx={{ fontSize: "clamp(6px, 0.8vw, 8px)", fontWeight: 800, opacity: 0.95, lineHeight: 1 }}>{difficulty}</Typography>
      <Typography sx={{ fontSize: "clamp(6px, 0.8vw, 8px)", opacity: 0.95, minHeight: "1em", lineHeight: 1 }}>{completed ? "✓" : locked ? "LOCK" : level.bestScore != null ? `${level.bestScore}` : ""}</Typography>
    </Box>
  );
}

export function LevelSelect({ levels, onSelectLevel, onBonusTime, onBonusTries }: LevelSelectProps) {
  const pattern = [
    { x: 26, y: 0 },
    { x: 74, y: 0 },
    { x: 26, y: -1 },
    { x: 74, y: -1 },
    { x: 50, y: -2 },
  ];

  const rungSpacingY = 5.8;
  const ladderGapY = 10.2;
  const positions = levels.map((_, idx) => {
    const ladder = Math.floor(idx / 5);
    const step = idx % 5;
    const p = pattern[step];
    const top = 92 - ladder * ladderGapY + p.y * rungSpacingY;
    return { left: `${p.x}%`, top: `${top}%` };
  });

  const pathSegments = positions.map((p, i) => `${i === 0 ? "M" : "L"} ${p.left} ${p.top}`).join(" ");

  return (
    <Box sx={{ position: "absolute", inset: 0, overflowY: "auto", WebkitOverflowScrolling: "touch", color: "#fff", background: "linear-gradient(180deg, #09111f 0%, #16274c 52%, #08101d 100%)" }}>
      <Box component="img" src="images/gamer-auth-bg.png" alt="Game background" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.18, filter: "saturate(1.25)" as any }} />
      <Box sx={{ position: "sticky", top: 0, zIndex: 3, padding: "max(2.2cqh, env(safe-area-inset-top, 0px)) 4cqw 1.2cqh", backdropFilter: "blur(10px)", background: "linear-gradient(180deg, rgba(9,17,31,0.95), rgba(9,17,31,0.45))" }}>
        <Typography sx={{ fontSize: "5.5cqh", fontWeight: 900, textAlign: "center", color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.55)" }}>Ladder Map</Typography>
        <Typography sx={{ fontSize: "1.8cqh", color: "#d8e2ff", textAlign: "center" }}>Climb level by level. Each set of 5 levels becomes a new ladder.</Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1.2, mt: 1.2 }}>
          {onBonusTime && <MiniIcon onClick={onBonusTime} label="Bonus time">⏱</MiniIcon>}
          {onBonusTries && <MiniIcon onClick={onBonusTries} label="Bonus tries">🎯</MiniIcon>}
        </Box>
      </Box>

      <Box sx={{ position: "relative", width: "100%", maxWidth: "720px", mx: "auto", minHeight: `${Math.max(320, levels.length * 8)}vh`, overflow: "hidden" }}>
        <Box sx={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0 8%, transparent 10%), radial-gradient(circle at 70% 15%, rgba(255,255,255,0.08) 0 7%, transparent 9%), radial-gradient(circle at 55% 32%, rgba(255,255,255,0.06) 0 6%, transparent 8%), radial-gradient(circle at 10% 70%, rgba(255,255,255,0.08) 0 7%, transparent 9%), radial-gradient(circle at 85% 62%, rgba(255,255,255,0.06) 0 6%, transparent 8%)", backgroundRepeat: "no-repeat", pointerEvents: "none", opacity: 0.9 }} />

        <Box sx={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "10px", transform: "translateX(-50%)", background: "linear-gradient(180deg, rgba(125,198,255,0.35), rgba(125,198,255,0.05))", borderRadius: "999px", opacity: 0.75, pointerEvents: "none" }} />

        {Array.from({ length: Math.ceil(levels.length / 5) }, (_, ladderIdx) => {
          const baseY = 92 - ladderIdx * ladderGapY;
          return (
            <Box key={`ladder-${ladderIdx}`} sx={{ position: "absolute", left: 0, right: 0, top: `${baseY - 4}%`, height: `${ladderGapY + 8}%`, pointerEvents: "none" }}>
              {[0, 1, 2, 3, 4].map((rung) => (
                <Box key={rung} sx={{ position: "absolute", left: "22%", right: "22%", top: `${(rung / 4) * 100}%`, height: "3px", background: "rgba(125,198,255,0.22)" }} />
              ))}
            </Box>
          );
        })}

        <Box component="svg" viewBox="0 0 100 100" preserveAspectRatio="none" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <path d={pathSegments} fill="none" stroke="rgba(125,198,255,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2.2 1.6" />
        </Box>

        {levels.map((level, idx) => (
          <LevelNode key={idx} idx={idx} level={level} onSelect={() => onSelectLevel(idx)} left={positions[idx].left} top={positions[idx].top} />
        ))}

        {Array.from({ length: Math.ceil(levels.length / 5) }, (_, ladderIdx) => (
          <Box key={ladderIdx} sx={{ position: "absolute", left: "50%", top: `${92 - ladderIdx * ladderGapY}%`, transform: "translateX(-50%)", textAlign: "center", width: "100%", pointerEvents: "none" }}>
            <Typography sx={{ fontSize: "1.5cqh", letterSpacing: "0.12em", textTransform: "uppercase", color: "#d8e2ff", opacity: 0.9 }}>
              Ladder {ladderIdx + 1}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function MiniIcon({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <Box component="button" aria-label={label} onClick={onClick} sx={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(37,99,235,0.14)", color: "#fff", fontSize: "1.1rem", cursor: "pointer" }}>
      {children}
    </Box>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { PhaserGame, GameRef } from "./game/PhaserGame";
import { useGameState } from "./game/useGameState";
import { LoadingScreen, HUD, PauseMenu, GameOver, LevelSelect, MapSelect, AccountPanel, AuthWelcome, SignInScreen, RegisterScreen, GuestNameScreen, GoogleEmailScreen, GoogleAuthScreen, ProfileMenu, type LevelProgress } from "./components/game-ui";
import { TouchOverlay } from "./components/touch-overlay";
import { EventBus } from "./game/EventBus";
import { accountStorage, type PlayerProfile } from "./game/accountStorage";
import { supabaseAuth } from "./game/supabase-auth";
import { cloudSave } from "./game/cloudSave";

const PROGRESS_KEY = "flood-fill-progress-v1";
const TOTAL_LEVELS = 100;

type AppScreen = "welcome" | "signIn" | "register" | "guestName" | "googleEmail" | "googleAuth" | "maps" | "levels" | "game";
type AppPhase = "loadingAuth" | "ready" | "error";

function loadProgress(): Record<number, number> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as Record<number, number>) : {};
  } catch {
    return {};
  }
}

function computeUnlocked(progress: Record<number, number>, idx: number) {
  return idx === 0 || (progress[idx - 1] != null && progress[idx - 1] > 0);
}

function normalizeProfile(profile: PlayerProfile | null): PlayerProfile {
  return profile ?? accountStorage.buildGuestProfile();
}

export default function App() {
  const gameRef = useRef<GameRef>(null);
  const [appPhase, setAppPhase] = useState<AppPhase>("loadingAuth");
  const [screen, setScreen] = useState<AppScreen>("welcome");
  const [previousScreen, setPreviousScreen] = useState<AppScreen>("welcome");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [progress, setProgress] = useState<Record<number, number>>(() => loadProgress());
  const [milestone, setMilestone] = useState<number | null>(null);
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    const email = accountStorage.loadActiveProfileEmail();
    return normalizeProfile(email ? accountStorage.loadProfile(email) : null);
  });
  const [pendingGoogleEmail, setPendingGoogleEmail] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>("Local only");
  const [bonusTimeAvailable, setBonusTimeAvailable] = useState(false);
  const [bonusTriesAvailable, setBonusTriesAvailable] = useState(false);
  const { screen: gameScreen, score, loadingProgress, finalScore, pauseGame, resumeGame, restartGame } = useGameState();
  const cloudUserIdRef = useRef<string | null>(null);

  const resetAuthJourney = () => {
    setShowProfileMenu(false);
    setSelectedLevel(null);
    setScreen("welcome");
    setPreviousScreen("welcome");
    setPendingGoogleEmail("");
    setLoadError(null);
  };

  useEffect(() => {
    (async () => {
      try {
        const session = await supabaseAuth.init();
        if (session) {
          setProfile(session.profile);
          setProgress(session.profile.completedLevels ?? {});
          setScreen("levels");
          setSyncStatus("Cloud sync on");
          cloudUserIdRef.current = session.userId;
        } else {
          const email = accountStorage.loadActiveProfileEmail();
          const restored = normalizeProfile(email ? accountStorage.loadProfile(email) : null);
          setProfile(restored);
          setProgress(restored.completedLevels ?? {});
          setSyncStatus(restored.provider === "guest" ? "Local only" : "Cloud sync on");
          setScreen("welcome");
        }
        setSelectedLevel(null);
        setAppPhase("ready");
        setLoadError(null);
      } catch {
        setLoadError("Could not restore your profile. Please try again.");
        setAppPhase("error");
        setScreen("welcome");
      }
    })();
  }, []);

  useEffect(() => {
    const client = supabaseAuth.getClient();
    if (!client) return;
    const { data } = client.auth.onAuthStateChange(async (_event: string, session: any) => {
      const user = session?.user;
      if (!user?.id) return;
      const email = user.email ?? "";
      const baseProfile: PlayerProfile = { email, displayName: email.split("@")[0] || "Player", provider: "google", completedLevels: {}, selectedLevel: 0, updatedAt: Date.now() };
      const restored = await cloudSave.load(user.id, baseProfile);
      cloudUserIdRef.current = user.id;
      setProfile(restored);
      setProgress(restored.completedLevels ?? {});
      setScreen("levels");
      setAppPhase("ready");
      setSyncStatus("Cloud sync on");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (appPhase !== "ready") return;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress, appPhase]);

  useEffect(() => {
    if (appPhase !== "ready") return;
    accountStorage.saveProfile({ ...profile, completedLevels: progress, selectedLevel: selectedLevel ?? profile.selectedLevel, updatedAt: Date.now() });
    if (profile.provider === "google") {
      if (cloudUserIdRef.current) {
        void cloudSave.save(cloudUserIdRef.current, { ...profile, completedLevels: progress, selectedLevel: selectedLevel ?? profile.selectedLevel, updatedAt: Date.now() });
      }
      setSyncStatus("Syncing…");
      setTimeout(() => setSyncStatus("Cloud sync on"), 600);
    } else {
      setSyncStatus("Local only");
    }
  }, [profile, progress, selectedLevel, appPhase]);

  useEffect(() => {
    if (profile.provider !== "google" || !cloudUserIdRef.current) return;
    const onBeforeUnload = () => {
      void cloudSave.touch(cloudUserIdRef.current!, { ...profile, completedLevels: progress, selectedLevel: selectedLevel ?? profile.selectedLevel, updatedAt: Date.now() });
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [profile, progress, selectedLevel]);

  useEffect(() => {
    if (screen !== "levels") return;
    setShowProfileMenu(false);
  }, [screen]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBonusTimeAvailable(false);
      setBonusTriesAvailable(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [screen, selectedLevel]);

  const levelData: LevelProgress[] = useMemo(() => {
    return Array.from({ length: TOTAL_LEVELS }, (_, idx) => {
      const completedScore = progress[idx];
      return { unlocked: computeUnlocked(progress, idx), completed: completedScore != null, bestScore: completedScore ?? null };
    });
  }, [progress]);

  const startGuestFlow = () => setScreen("guestName");
  const startGoogleFlow = async () => {
    try {
      await supabaseAuth.signInWithGoogle();
    } catch {
      // Fallback: keep the user on the register flow if OAuth can't open.
      // The real Google account chooser will appear only when the Supabase
      // auth provider is available and configured.
      setScreen("register");
    }
  };
  const startSignInFlow = () => setScreen("signIn");
  const startRegisterFlow = () => setScreen("register");
  const openLevels = () => setScreen("levels");

  const finishGuest = (name: string) => {
    const guest = accountStorage.buildGuestProfile();
    setProfile({ ...guest, displayName: name || "Guest" });
    setProgress(guest.completedLevels);
    setSelectedLevel(null);
    accountStorage.clearActiveProfileEmail();
    setPreviousScreen("guestName");
    setScreen("maps");
    setShowProfileMenu(false);
    setAppPhase("ready");
    setLoadError(null);
  };

  const finishGoogleEmail = (email: string) => {
    setPendingGoogleEmail(email);
    setScreen("googleAuth");
  };

  const finishManualRegister = ({ name, email, password, dob }: { name: string; email: string; password: string; dob: string }) => {
    if (!name || !email || !password || !dob) return;
    const guest = accountStorage.buildGuestProfile();
    const created = { ...guest, email, displayName: name, provider: "google" as const, updatedAt: Date.now() };
    accountStorage.saveProfile(created);
    setProfile(created);
    setProgress(created.completedLevels);
    setScreen("signIn");
    setLoadError("Account created. Please sign in now.");
  };

  const finishGoogleAuth = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    (async () => {
      try {
        const saved = accountStorage.loadProfile(cleanEmail);
        const baseProfile = normalizeProfile(saved ?? { email: cleanEmail, displayName: cleanEmail.split("@")[0] || "Player", provider: "google", completedLevels: {}, selectedLevel: 0, updatedAt: Date.now() });
        const merged = saved ? accountStorage.mergeProfiles(baseProfile, saved) : baseProfile;
        setProfile({ ...merged, email: cleanEmail, provider: "google", displayName: merged.displayName || cleanEmail.split("@")[0] || "Player" });
        setProgress(merged.completedLevels);
        setSelectedLevel(null);
        accountStorage.setActiveProfileEmail(cleanEmail);
        await cloudSave.save(cleanEmail, { ...merged, email: cleanEmail, provider: "google" });
        setPreviousScreen("googleAuth");
        setScreen("maps");
        setAppPhase("ready");
        setLoadError(null);
      } catch {
        setLoadError("Google sign-in failed. Please try again.");
      }
    })();
  };

  const profileInitial = (profile.displayName || profile.email || "G").trim().charAt(0).toUpperCase();

  const backToWelcome = () => setScreen("welcome");
  const backFromProfileMenu = () => setShowProfileMenu(false);
  const backToPrevious = () => {
    setShowProfileMenu(false);
    setScreen(previousScreen);
  };

  const handleSelectLevel = (levelIndex: number) => {
    if (!levelData[levelIndex]?.unlocked) return;
    setSelectedLevel(levelIndex);
    setProfile((p) => ({ ...p, selectedLevel: levelIndex }));
    EventBus.setCurrentLevel(levelIndex);
    EventBus.emit("start-level", levelIndex);
    setScreen("game");
  };

  const handleLevelComplete = (levelIndex: number, scoreValue: number) => {
    if (scoreValue <= 0) return;
    setProgress((prev) => {
      const current = prev[levelIndex];
      const next = current == null || scoreValue > current ? { ...prev, [levelIndex]: scoreValue } : prev;
      const unlockHit = (levelIndex + 1) % 10 === 0 ? levelIndex + 1 : null;
      if (unlockHit != null) setMilestone(unlockHit);
      return next;
    });
  };

  const returnToLevels = (discardUnfinished = true) => {
    if (discardUnfinished && selectedLevel != null && progress[selectedLevel] == null) setProfile((p) => ({ ...p, selectedLevel: 0 }));
    setSelectedLevel(null);
    restartGame();
    setScreen("levels");
  };

  const handleBonusTime = () => {
    if (!bonusTimeAvailable) {
      setLoadError("Bonus time is not available right now. Try again later.");
      return;
    }
    EventBus.emit("bonus-time");
    setBonusTimeAvailable(false);
  };

  const handleBonusTries = () => {
    if (!bonusTriesAvailable) {
      setLoadError("Bonus tries are not available right now. Try again later.");
      return;
    }
    EventBus.emit("bonus-tries");
    setBonusTriesAvailable(false);
  };

  const resetGuestSave = () => {
    const guest = accountStorage.buildGuestProfile();
    localStorage.removeItem(PROGRESS_KEY);
    setProgress({});
    setSelectedLevel(null);
    setProfile(guest);
    accountStorage.clearActiveProfileEmail();
    setSyncStatus("Local only");
    resetAuthJourney();
    setAppPhase("ready");
  };

  const resyncFromCloud = async () => {
    if (profile.provider !== "google") return;
    const userId = cloudUserIdRef.current;
    if (!userId) return;
    setSyncStatus("Syncing…");
    const restored = await cloudSave.load(userId, profile);
    setProfile(restored);
    setProgress(restored.completedLevels ?? {});
    setSyncStatus("Cloud sync on");
  };

  useEffect(() => {
    const onGameOver = ({ score: scoreValue }: { score: number }) => {
      if (selectedLevel != null) handleLevelComplete(selectedLevel, scoreValue);
      setSelectedLevel(null);
      setScreen("levels");
    };
    const onLevelComplete = ({ levelIndex, score: scoreValue }: { levelIndex: number; score: number }) => {
      handleLevelComplete(levelIndex, scoreValue);
    };
    EventBus.on("game-over", onGameOver);
    EventBus.on("level-complete", onLevelComplete);
    return () => {
      EventBus.off("game-over", onGameOver);
      EventBus.off("level-complete", onLevelComplete);
    };
  }, [selectedLevel]);

  const showGame = screen === "game" && selectedLevel != null;
  const showGameBackdrop = showGame;
  const showProfileRail = screen === "maps" || screen === "levels";

  if (appPhase === "loadingAuth") {
    return <div className="app-container"><div style={{ color: "#fff", fontSize: 24, fontWeight: 800 }}>Restoring your profile…</div></div>;
  }

  return (
    <div className="app-container">
      <div style={{ position: "relative", width: "min(100vw, calc(100vh * 9 / 16))", height: "min(100vh, calc(100vw * 16 / 9))", maxWidth: "720px", maxHeight: "1280px", background: "linear-gradient(180deg, #09111f 0%, #16274c 52%, #08101d 100%)", containerType: "size" as React.CSSProperties["containerType"], overflow: "hidden", borderRadius: 0, transition: "opacity 220ms ease, transform 220ms ease" }}>
        {showGameBackdrop && <PhaserGame ref={gameRef} />}
        {screen === "welcome" && <AuthWelcome onGoogle={startSignInFlow} onGuest={startGuestFlow} />}
        {screen === "signIn" && <SignInScreen onSignIn={(email, password) => {
          const saved = email ? accountStorage.loadProfile(email) : null;
          if (!saved || password.length < 1) {
            setLoadError("Check your email/password or register first.");
            return;
          }
          setProfile({ ...saved, provider: "google" });
          setProgress(saved.completedLevels);
          setScreen("levels");
          setLoadError(null);
        }} onGoRegister={startRegisterFlow} onBack={backToWelcome} />}
        {screen === "register" && <RegisterScreen onGoogleCreate={startGoogleFlow} onManualCreate={finishManualRegister} onBack={() => setScreen("signIn")} />}
        {screen === "guestName" && <GuestNameScreen onContinue={finishGuest} onBack={backToWelcome} />}
        {screen === "googleEmail" && <GoogleEmailScreen onContinue={finishGoogleEmail} onBack={backToWelcome} email={pendingGoogleEmail} />}
        {screen === "googleAuth" && <GoogleAuthScreen onContinue={finishGoogleAuth} onBack={() => setScreen("register")} email={pendingGoogleEmail} />}
        {screen === "maps" && <MapSelect onChooseLadder={openLevels} />}
        {screen === "levels" && <LevelSelect levels={levelData} onSelectLevel={handleSelectLevel} onBonusTime={() => EventBus.emit("bonus-time")} onBonusTries={() => EventBus.emit("bonus-tries")} />}
        {showProfileRail && (
          <>
            <button
              onClick={() => setShowProfileMenu((v) => !v)}
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "none",
                background: "linear-gradient(180deg, #7dc6ff, #4285F4)",
                color: "#fff",
                fontWeight: 900,
                fontSize: 20,
                zIndex: 6,
              }}
            >
              {profileInitial}
            </button>
            <AccountPanel signedIn={profile.provider === "google"} displayName={profile.displayName} email={profile.email} provider={profile.provider === "guest" ? "guest" : "google"} progressCount={Object.keys(progress).length} totalLevels={TOTAL_LEVELS} onAuth={() => setScreen("welcome")} onSignOut={() => { setScreen("welcome"); }} syncStatus={syncStatus} />
          </>
        )}
        {showProfileMenu && showProfileRail && (
          <ProfileMenu
            initial={profileInitial}
            signedIn={profile.provider === "google"}
            onBack={backToPrevious}
            onLogout={() => {
              resetAuthJourney();
              accountStorage.clearActiveProfileEmail();
              setProfile(accountStorage.buildGuestProfile());
              cloudUserIdRef.current = null;
              setSyncStatus("Local only");
            }}
            onResetGuest={resetGuestSave}
            onResync={resyncFromCloud}
          />
        )}
        {showGame && gameScreen === "loading" && <LoadingScreen progress={loadingProgress} />}
        {showGame && gameScreen === "playing" && (<><HUD score={score} onLevels={() => returnToLevels(true)} onBonusTime={handleBonusTime} onBonusTries={handleBonusTries} bonusTimeAvailable={bonusTimeAvailable} bonusTriesAvailable={bonusTriesAvailable} /><TouchOverlay showJoystick={false} showButtonA={false} showButtonB={false} /></>)}
        {showGame && gameScreen === "paused" && <PauseMenu onResume={resumeGame} onLevels={() => returnToLevels(true)} />}
        {showGame && gameScreen === "gameover" && (<GameOver score={finalScore} onRestart={() => { restartGame(); setSelectedLevel(null); setScreen("levels"); }} onLevels={() => returnToLevels(true)} />)}
      </div>
    </div>
  );
}

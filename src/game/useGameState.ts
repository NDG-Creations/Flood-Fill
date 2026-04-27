import { useCallback, useEffect, useRef, useState } from "react";
import { EventBus } from "./EventBus";
import { GAME_INPUT_EVENT } from "../components/touch-overlay/types";

export type GameScreen = "loading" | "playing" | "paused" | "gameover";

interface GameState {
  screen: GameScreen;
  score: number;
  loadingProgress: number;
  finalScore: number;
}

export function useGameState() {
  const [state, setState] = useState<GameState>({
    screen: "playing",
    score: 0,
    loadingProgress: 0,
    finalScore: 0,
  });

  // Use a ref to access latest state inside the PAUSE listener without
  // re-subscribing on every state change.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const onLoadingProgress = (progress: number) => {
      setState((s) => ({ ...s, loadingProgress: progress }));
    };

    const onLoadingCompleteHandler = () => {
      setState((s) => ({ ...s, screen: "playing" }));
    };

    const onScoreUpdate = (score: number) => {
      setState((s) => ({ ...s, score }));
    };

    const onGamePaused = () => {
      setState((s) => ({ ...s, screen: "paused" }));
    };

    const onGameResumed = () => {
      setState((s) => ({ ...s, screen: "playing" }));
    };

    const onGameOver = ({ score }: { score: number }) => {
      setState((s) => ({ ...s, screen: "gameover", finalScore: score }));
    };

    EventBus.on("loading-progress", onLoadingProgress);
    EventBus.onLoadingComplete(onLoadingCompleteHandler);
    EventBus.on("score-update", onScoreUpdate);
    EventBus.on("game-paused", onGamePaused);
    EventBus.on("game-resumed", onGameResumed);
    EventBus.on("game-over", onGameOver);

    // Listen for PAUSE action from TouchOverlay (keyboard ESC on desktop).
    // Toggles pause/resume depending on current screen state.
    const onPauseInput = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.action !== "PAUSE" || detail.phase !== "down") return;
      const current = stateRef.current.screen;
      if (current === "playing") {
        EventBus.emit("pause-game");
      } else if (current === "paused") {
        EventBus.emit("resume-game");
      }
    };

    window.addEventListener(GAME_INPUT_EVENT, onPauseInput);

    return () => {
      EventBus.off("loading-progress", onLoadingProgress);
      EventBus.off("loading-complete", onLoadingCompleteHandler);
      EventBus.off("score-update", onScoreUpdate);
      EventBus.off("game-paused", onGamePaused);
      EventBus.off("game-resumed", onGameResumed);
      EventBus.off("game-over", onGameOver);
      window.removeEventListener(GAME_INPUT_EVENT, onPauseInput);
    };
  }, []);

  const pauseGame = useCallback(() => {
    EventBus.emit("pause-game");
  }, []);

  const resumeGame = useCallback(() => {
    EventBus.emit("resume-game");
  }, []);

  const restartGame = useCallback(() => {
    setState((s) => ({ ...s, screen: "playing", score: 0 }));
    EventBus.emit("restart-game");
  }, []);

  return {
    ...state,
    pauseGame,
    resumeGame,
    restartGame,
  };
}

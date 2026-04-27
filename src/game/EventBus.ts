/**
 * Typed event bus for Phaser ↔ React communication.
 *
 * Phaser → React events are emitted from scene lifecycle hooks and
 * game logic. React → Phaser events are emitted from UI components
 * and hooks.
 */
type GameEvents = {
  // ── Phaser → React ───────────────────────────────────────
  "scene-ready": (scene: Phaser.Scene) => void;
  "loading-progress": (progress: number) => void;
  "loading-complete": () => void;
  "score-update": (score: number) => void;
  "level-complete": (data: { levelIndex: number; score: number }) => void;
  "game-over": (data: { score: number }) => void;
  "game-paused": () => void;
  "game-resumed": () => void;

  // ── React → Phaser ───────────────────────────────────────
  "pause-game": () => void;
  "resume-game": () => void;
  "restart-game": () => void;
  "start-level": (levelIndex: number) => void;
  "bonus-time": () => void;
  "bonus-tries": () => void;
};

/* ── Stub Phaser types so the template compiles outside Sandpack ─ */
declare global {
  namespace Phaser {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Scene {}
  }
}

/**
 * Lightweight browser-safe event emitter.
 *
 * Replaces Node.js `EventEmitter` which cannot be bundled by Vite for
 * browser targets.  Only the three methods actually used (`on`, `off`,
 * `emit`) are implemented.
 */
class SimpleEmitter {
  private readonly listeners = new Map<string, Set<Function>>();

  on(event: string, callback: Function): void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(callback);
  }

  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach((cb) => cb(...args));
  }
}

const emitter = new SimpleEmitter();

/**
 * Central event bus for game ↔ UI communication.
 *
 * Provides typed `on` / `off` / `emit` helpers so that event names
 * and handler signatures are always in sync across the React and
 * Phaser layers.
 */
export const EventBus = {
  on<K extends keyof GameEvents>(event: K, callback: GameEvents[K]) {
    emitter.on(event, callback);
  },

  off<K extends keyof GameEvents>(event: K, callback: GameEvents[K]) {
    emitter.off(event, callback);
  },

  emit<K extends keyof GameEvents>(
    event: K,
    ...args: Parameters<GameEvents[K]>
  ) {
    emitter.emit(event, ...args);
  },

  /* ── Sticky loading-complete flag ──────────────────────────
   *
   * Phaser may fire `loading-complete` before React's `useEffect`
   * has subscribed. We persist the signal so `useGameState` can
   * read it on mount.
   */
  _loadingComplete: false as boolean,

  emitLoadingComplete() {
    this._loadingComplete = true;
    this.emit("loading-complete");
  },

  onLoadingComplete(cb: () => void) {
    if (this._loadingComplete) {
      cb();
    } else {
      this.on("loading-complete", cb);
    }
  },

  resetLoadingComplete() {
    this._loadingComplete = false;
  },

  currentLevel: 0 as number,

  setCurrentLevel(levelIndex: number) {
    this.currentLevel = levelIndex;
  },

  getCurrentLevel() {
    return this.currentLevel;
  },
};

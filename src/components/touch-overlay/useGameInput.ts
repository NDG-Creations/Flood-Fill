import type { GameInputEvent } from "./types";
import { GAME_INPUT_EVENT } from "./types";

/**
 * Input state for Phaser scenes
 */
export interface GameInputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  actionA: boolean;
  actionB: boolean;
  pause: boolean;
  axis: { x: number; y: number };
}

/**
 * Connect TouchOverlay input to a Phaser scene.
 * Call in scene's create() method.
 *
 * @example
 * ```typescript
 * // In scene create():
 * this.gameInput = connectPhaserInput(this);
 *
 * // In update():
 * this.player.setVelocityX(this.gameInput.axis.x * 400);
 * if (this.gameInput.actionA) this.player.setVelocityY(-600);
 * ```
 */
export function connectPhaserInput(scene: {
  events: { on: Function; once: Function; off: Function };
}): GameInputState {
  const state: GameInputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    actionA: false,
    actionB: false,
    pause: false,
    axis: { x: 0, y: 0 },
  };

  const listener = (e: Event) => {
    const event = (e as CustomEvent<GameInputEvent>).detail;

    switch (event.action) {
      case "MOVE":
        if (event.axis) state.axis = event.axis;
        break;
      case "MOVE_LEFT":
        state.left = event.phase === "down";
        break;
      case "MOVE_RIGHT":
        state.right = event.phase === "down";
        break;
      case "MOVE_UP":
        state.up = event.phase === "down";
        break;
      case "MOVE_DOWN":
        state.down = event.phase === "down";
        break;
      case "ACTION_A":
        state.actionA = event.phase === "down";
        break;
      case "ACTION_B":
        state.actionB = event.phase === "down";
        break;
      case "PAUSE":
        state.pause = event.phase === "down";
        break;
    }
  };

  // Resets all input to a neutral state. Called on scene pause so that inputs
  // held at the moment of pausing never bleed through when the game resumes.
  // TouchOverlay also flushes on unmount, but this acts as a belt-and-suspenders
  // safeguard for pauses triggered programmatically from within the scene itself.
  const resetState = () => {
    state.left = false;
    state.right = false;
    state.up = false;
    state.down = false;
    state.actionA = false;
    state.actionB = false;
    state.pause = false;
    state.axis = { x: 0, y: 0 };
  };

  window.addEventListener(GAME_INPUT_EVENT, listener);
  scene.events.on("pause", resetState);

  // Use once() so this handler self-removes after firing, preventing accumulation
  // across scene restarts (each restart re-runs create() → connectPhaserInput()).
  scene.events.once("shutdown", () => {
    window.removeEventListener(GAME_INPUT_EVENT, listener);
    scene.events.off("pause", resetState);
  });

  return state;
}

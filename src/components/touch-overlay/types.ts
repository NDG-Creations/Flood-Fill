/**
 * Game input action types
 */
export type ActionId =
  | "MOVE" // Analog joystick movement (has axis values)
  | "MOVE_LEFT" // Digital left
  | "MOVE_RIGHT" // Digital right
  | "MOVE_UP" // Digital up
  | "MOVE_DOWN" // Digital down
  | "ACTION_A" // Primary action — A button / Space
  | "ACTION_B" // Secondary action — B button / J key
  | "PAUSE"; // Escape key (pause handled by HUD)

/** Custom event name for game input — shared between TouchOverlay and consumers */
export const GAME_INPUT_EVENT = "game:input";

export type ActionPhase = "down" | "up" | "change";

export interface GameInputEvent {
  action: ActionId;
  phase: ActionPhase;
  /** Analog axis values for MOVE action (-1 to 1) */
  axis?: { x: number; y: number };
  /** Optional intensity value (0 to 1) */
  value?: number;
}

export interface TouchOverlayConfig {
  /** Show joystick (default: true) */
  showJoystick?: boolean;
  /** Show A button - typically Jump (default: true) */
  showButtonA?: boolean;
  /** Show B button - typically Fire/Action (default: true) */
  showButtonB?: boolean;
  /** Label for A button (default: "A") */
  buttonALabel?: string;
  /** Label for B button (default: "B") */
  buttonBLabel?: string;
  /** Joystick deadzone - ignore small movements (default: 0.08) */
  deadzone?: number;
  /** Threshold for digital direction triggers (default: 0.35) */
  threshold?: number;
  /** Only emit analog MOVE events, no digital directions (default: false) */
  analogOnly?: boolean;
  /** Force show on desktop for testing (default: false) */
  forceShow?: boolean;
}

/** Keyboard mapping for desktop */
export const DEFAULT_KEY_MAP: Record<string, ActionId> = {
  ArrowLeft: "MOVE_LEFT",
  KeyA: "MOVE_LEFT",
  ArrowRight: "MOVE_RIGHT",
  KeyD: "MOVE_RIGHT",
  ArrowUp: "MOVE_UP",
  KeyW: "MOVE_UP",
  ArrowDown: "MOVE_DOWN",
  KeyS: "MOVE_DOWN",
  Space: "ACTION_A",
  KeyJ: "ACTION_B",
  Escape: "PAUSE",
};

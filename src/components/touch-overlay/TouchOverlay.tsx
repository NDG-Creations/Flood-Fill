import React, { useRef, useCallback, useEffect, useState } from "react";
import type {
  TouchOverlayConfig,
  ActionId,
  ActionPhase,
  GameInputEvent,
} from "./types";
import { DEFAULT_KEY_MAP, GAME_INPUT_EVENT } from "./types";

/** Dispatch a game input event */
function dispatchGameInput(
  action: ActionId,
  phase: ActionPhase,
  axis?: { x: number; y: number },
  value?: number
) {
  const detail: GameInputEvent = { action, phase };
  if (axis) detail.axis = axis;
  if (typeof value === "number") detail.value = value;
  window.dispatchEvent(new CustomEvent(GAME_INPUT_EVENT, { detail }));
}

/** Detect device type */
function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return /mobile|android|iphone|ipod|blackberry|opera mini|iemobile|ipad|tablet/.test(
    ua
  );
}

interface JoystickState {
  active: boolean;
  center: { x: number; y: number };
  axis: { x: number; y: number };
  digital: { left: boolean; right: boolean; up: boolean; down: boolean };
  radius: number;
  centerOffset: number;
}

export function TouchOverlay({
  showJoystick = true,
  showButtonA = true,
  showButtonB = true,
  buttonALabel = "A",
  buttonBLabel = "B",
  deadzone = 0.08,
  threshold = 0.35,
  analogOnly = false,
  forceShow = false,
}: TouchOverlayConfig = {}) {
  const [isMobile] = useState(() => isMobileDevice());
  const joyBaseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<JoystickState>({
    active: false,
    center: { x: 0, y: 0 },
    axis: { x: 0, y: 0 },
    digital: { left: false, right: false, up: false, down: false },
    radius: 52,
    centerOffset: 44,
  });

  // Tracks which action buttons are currently held. Lives in a ref so it
  // survives React re-renders (e.g. score updates) without ever resetting
  // mid-press and silently dropping the corresponding "up" event.
  const pressedRef = useRef<Partial<Record<ActionId, boolean>>>({});

  // Don't render on desktop unless forced
  const shouldShow = forceShow || isMobile;

  // Emit analog movement
  const emitAnalog = useCallback(
    (x: number, y: number) => {
      const ax = Math.abs(x) < deadzone ? 0 : x;
      const ay = Math.abs(y) < deadzone ? 0 : y;
      stateRef.current.axis = {
        x: Number(ax.toFixed(3)),
        y: Number(ay.toFixed(3)),
      };
      dispatchGameInput("MOVE", "change", stateRef.current.axis);
    },
    [deadzone]
  );

  // Emit digital directions based on analog axis
  const emitDigitals = useCallback(
    (x: number, y: number) => {
      if (analogOnly) return;
      const next = {
        left: x <= -threshold,
        right: x >= threshold,
        up: y <= -threshold,
        down: y >= threshold,
      };
      const prev = stateRef.current.digital;

      if (next.left !== prev.left)
        dispatchGameInput("MOVE_LEFT", next.left ? "down" : "up");
      if (next.right !== prev.right)
        dispatchGameInput("MOVE_RIGHT", next.right ? "down" : "up");
      if (next.up !== prev.up)
        dispatchGameInput("MOVE_UP", next.up ? "down" : "up");
      if (next.down !== prev.down)
        dispatchGameInput("MOVE_DOWN", next.down ? "down" : "up");

      stateRef.current.digital = next;
    },
    [analogOnly, threshold]
  );

  // Update knob position
  const setKnobPosition = useCallback((dx: number, dy: number) => {
    if (knobRef.current) {
      const offset = stateRef.current.centerOffset;
      knobRef.current.style.left = `${offset + dx}px`;
      knobRef.current.style.top = `${offset + dy}px`;
    }
  }, []);

  // Joystick handlers
  const handleJoystickStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const base = joyBaseRef.current;
      const knob = knobRef.current;
      if (!base || !knob) return;

      const rect = base.getBoundingClientRect();
      const baseSize = rect.width;
      const knobSize = knob.offsetWidth;
      const radius = (baseSize - knobSize) / 2;
      const centerOffset = (baseSize - knobSize) / 2;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      stateRef.current.active = true;
      stateRef.current.center = { x, y };
      stateRef.current.radius = radius;
      stateRef.current.centerOffset = centerOffset;
      setKnobPosition(0, 0);
      emitAnalog(0, 0);
      emitDigitals(0, 0);
    },
    [emitAnalog, emitDigitals, setKnobPosition]
  );

  // Global pointer move/up handlers
  useEffect(() => {
    if (!shouldShow || !showJoystick) return;

    const handleMove = (e: PointerEvent) => {
      if (!stateRef.current.active || !joyBaseRef.current) return;
      e.preventDefault();

      const rect = joyBaseRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let dx = x - stateRef.current.center.x;
      let dy = y - stateRef.current.center.y;
      const RADIUS = stateRef.current.radius || 1;
      const len = Math.hypot(dx, dy) || 1;
      const clamped = Math.min(len, RADIUS);
      dx *= clamped / len;
      dy *= clamped / len;

      setKnobPosition(dx, dy);

      const ax = dx / RADIUS;
      const ay = dy / RADIUS;
      emitAnalog(ax, ay);
      emitDigitals(ax, ay);
    };

    const handleEnd = () => {
      if (!stateRef.current.active) return;
      stateRef.current.active = false;
      setKnobPosition(0, 0);
      emitAnalog(0, 0);
      emitDigitals(0, 0);
    };

    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleEnd);
    window.addEventListener("pointercancel", handleEnd);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleEnd);
      window.removeEventListener("pointercancel", handleEnd);
    };
  }, [shouldShow, showJoystick, emitAnalog, emitDigitals, setKnobPosition]);

  // Keyboard handler for desktop
  useEffect(() => {
    if (isMobile && !forceShow) return;

    const keysDown = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      const action = DEFAULT_KEY_MAP[e.code];
      if (!action) return;
      e.preventDefault();

      if (action === "PAUSE") {
        dispatchGameInput("PAUSE", "down");
        setTimeout(() => dispatchGameInput("PAUSE", "up"), 30);
        return;
      }

      if (!keysDown.has(e.code)) {
        keysDown.add(e.code);
        dispatchGameInput(action, "down");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const action = DEFAULT_KEY_MAP[e.code];
      if (!action) return;
      e.preventDefault();

      if (keysDown.has(e.code)) {
        keysDown.delete(e.code);
        dispatchGameInput(action, "up");
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isMobile, forceShow]);

  // Flush any held inputs on unmount so the Phaser scene never receives stale
  // "pressed" state after the overlay disappears (pause, game-over, menu transition).
  useEffect(() => {
    return () => {
      const pressed = pressedRef.current;
      (Object.keys(pressed) as ActionId[]).forEach((action) => {
        if (pressed[action]) {
          pressed[action] = false;
          dispatchGameInput(action, "up");
        }
      });
      if (stateRef.current.active) {
        stateRef.current.active = false;
        dispatchGameInput("MOVE", "change", { x: 0, y: 0 });
        dispatchGameInput("MOVE_LEFT", "up");
        dispatchGameInput("MOVE_RIGHT", "up");
        dispatchGameInput("MOVE_UP", "up");
        dispatchGameInput("MOVE_DOWN", "up");
      }
    };
  }, []); // empty deps — runs cleanup only on unmount

  // Button press handler factory.
  // Wrapping with useCallback gives a stable function reference across renders.
  // Reading/writing pressedRef.current[action] instead of a closure-local variable
  // ensures the held state is never lost when React re-renders mid-press.
  const createButtonHandler = useCallback(
    (action: ActionId) => ({
      onPointerDown: (e: React.PointerEvent) => {
        e.preventDefault();
        // Capture the pointer so pointerup is always delivered to this element
        // even when the finger drifts outside its bounds.
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        pressedRef.current[action] = true;
        (e.currentTarget as HTMLElement).style.background =
          "rgba(255,255,255,0.25)";
        dispatchGameInput(action, "down");
      },
      onPointerUp: (e: React.PointerEvent) => {
        e.preventDefault();
        if (!pressedRef.current[action]) return;
        pressedRef.current[action] = false;
        (e.currentTarget as HTMLElement).style.background =
          "rgba(255,255,255,0.1)";
        dispatchGameInput(action, "up");
      },
      onPointerCancel: (e: React.PointerEvent) => {
        e.preventDefault();
        if (!pressedRef.current[action]) return;
        pressedRef.current[action] = false;
        (e.currentTarget as HTMLElement).style.background =
          "rgba(255,255,255,0.1)";
        dispatchGameInput(action, "up");
      },
      // onPointerLeave is a safety valve for environments where setPointerCapture
      // is unavailable or the capture is released unexpectedly.
      onPointerLeave: (e: React.PointerEvent) => {
        e.preventDefault();
        if (!pressedRef.current[action]) return;
        pressedRef.current[action] = false;
        (e.currentTarget as HTMLElement).style.background =
          "rgba(255,255,255,0.1)";
        dispatchGameInput(action, "up");
      },
      onPointerEnter: (e: React.PointerEvent) => {
        if (e.buttons !== 1) return;
        pressedRef.current[action] = true;
        (e.currentTarget as HTMLElement).style.background =
          "rgba(255,255,255,0.25)";
        dispatchGameInput(action, "down");
      },
    }),
    [] // pressedRef is a stable ref — no external deps
  );

  if (!shouldShow) return null;

  // Safe-area bottom offset for mobile devices with home indicator
  const safeBottom = "max(4cqh, env(safe-area-inset-bottom, 0px))";

  return (
    <div style={styles.overlay}>
      {/* Joystick */}
      {showJoystick && (
        <div
          ref={joyBaseRef}
          style={{
            ...styles.joyBase,
            left: "4cqw",
            bottom: safeBottom,
          }}
          onPointerDown={handleJoystickStart}
        >
          <div ref={knobRef} style={styles.joyKnob} />
        </div>
      )}

      {/* A Button (primary action) */}
      {showButtonA && (
        <div
          style={{
            ...styles.btn,
            ...styles.btnA,
            bottom: safeBottom,
          }}
          {...createButtonHandler("ACTION_A")}
        >
          {buttonALabel}
        </div>
      )}

      {/* B Button (secondary action) */}
      {showButtonB && (
        <div
          style={{
            ...styles.btn,
            ...styles.btnB,
            bottom: `calc(${safeBottom} + 14cqh)`,
          }}
          {...createButtonHandler("ACTION_B")}
        >
          {buttonBLabel}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    userSelect: "none",
    touchAction: "none",
    zIndex: 10,
  },
  joyBase: {
    position: "absolute",
    width: "30cqw",
    height: "30cqw",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(2px)",
    pointerEvents: "auto",
    touchAction: "none",
    WebkitTapHighlightColor: "transparent",
  },
  joyKnob: {
    position: "absolute",
    left: "35%",
    top: "35%",
    width: "30%",
    height: "30%",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.9)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.35)",
    // No transition - immediate response for better game feel
  },
  btn: {
    position: "absolute",
    width: "18cqw",
    height: "18cqw",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "monospace",
    fontSize: "4.5cqw",
    color: "#fff",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.35)",
    pointerEvents: "auto",
    touchAction: "none",
    WebkitTapHighlightColor: "transparent",
  },
  btnA: {
    right: "6cqw",
  },
  btnB: {
    right: "28cqw",
  },
};

export default TouchOverlay;

/**
 * Type-safe Phaser Helpers
 *
 * Wrappers for common Phaser pitfalls that cause TypeScript errors at build time.
 * The AI agent uses these to avoid union-type issues, callback casting, and
 * lifecycle mistakes that only surface during `tsc && vite build`.
 */

import * as Phaser from "phaser";

// ============================================================================
// Body Access
// ============================================================================

/**
 * Safely access an Arcade physics body from a game object.
 * `sprite.body` is typed as `Body | StaticBody | null` — this narrows to
 * `Arcade.Body` or returns null if the body is static or absent.
 */
export function getBody(
  obj: Phaser.GameObjects.GameObject
): Phaser.Physics.Arcade.Body | null {
  const body = (obj as Phaser.Physics.Arcade.Sprite).body;
  if (body instanceof Phaser.Physics.Arcade.Body) {
    return body;
  }
  return null;
}

// ============================================================================
// Collision Helpers
// ============================================================================

type ArcadeSprite = Phaser.Physics.Arcade.Sprite;
type ArcadeImage = Phaser.Physics.Arcade.Image;
type ArcadeGroup = Phaser.Physics.Arcade.Group;
type StaticGroup = Phaser.Physics.Arcade.StaticGroup;
type Collidable = ArcadeSprite | ArcadeImage | ArcadeGroup | StaticGroup;

/**
 * Type-safe overlap handler. Collision callbacks receive `GameObjectWithBody`
 * which requires casting — this wrapper handles it.
 */
export function onOverlap(
  scene: Phaser.Scene,
  a: Collidable,
  b: Collidable,
  callback: (
    objA: Phaser.GameObjects.GameObject,
    objB: Phaser.GameObjects.GameObject
  ) => void
): Phaser.Physics.Arcade.Collider {
  return scene.physics.add.overlap(
    a,
    b,
    callback as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback
  );
}

/**
 * Type-safe collider handler. Same casting issue as overlap.
 */
export function onCollide(
  scene: Phaser.Scene,
  a: Collidable,
  b: Collidable,
  callback?: (
    objA: Phaser.GameObjects.GameObject,
    objB: Phaser.GameObjects.GameObject
  ) => void
): Phaser.Physics.Arcade.Collider {
  return scene.physics.add.collider(
    a,
    b,
    callback as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback
  );
}

// ============================================================================
// Timer
// ============================================================================

/**
 * Wraps `scene.time.addEvent()` — prevents `setInterval`/`setTimeout` misuse
 * which causes leaks across scene restarts.
 */
export function addTimer(
  scene: Phaser.Scene,
  config: Phaser.Types.Time.TimerEventConfig
): Phaser.Time.TimerEvent {
  return scene.time.addEvent(config);
}

// ============================================================================
// Scene Lifecycle
// ============================================================================

/**
 * Register a cleanup handler for scene shutdown. Prevents EventBus listener
 * leaks by ensuring cleanup runs when the scene stops or restarts.
 */
export function onShutdown(scene: Phaser.Scene, cleanup: () => void): void {
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
}

// ============================================================================
// Group Iteration
// ============================================================================

/**
 * Type-safe iteration over group children.
 * `group.getChildren()` returns `GameObject[]` — this casts each child.
 */
export function forEachInGroup<T extends Phaser.GameObjects.GameObject>(
  group: Phaser.GameObjects.Group,
  callback: (child: T) => void
): void {
  group.getChildren().forEach((child) => callback(child as T));
}

// ============================================================================
// Animation
// ============================================================================

/**
 * Wraps `scene.anims.create()` with correct config types.
 * Returns the created animation or undefined if it already exists.
 */
export function createAnim(
  scene: Phaser.Scene,
  config: Phaser.Types.Animations.Animation
): Phaser.Animations.Animation | false {
  return scene.anims.create(config);
}

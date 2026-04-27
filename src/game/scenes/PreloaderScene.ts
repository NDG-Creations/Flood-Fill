import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class PreloaderScene extends Scene {
  constructor() {
    super("PreloaderScene");
  }

  preload() {
    this.load.on("progress", (value: number) => {
      EventBus.emit("loading-progress", value);
    });

    this.load.on("complete", () => {
      EventBus.emitLoadingComplete();
    });

    // ── Put your game assets here ───────────────────────────
    // this.load.image("logo", "logo.png");
    // this.load.spritesheet("player", "player.png", {
    //   frameWidth: 32,
    //   frameHeight: 48,
    // });
    // ─────────────────────────────────────────────────────────

    // Background fill while loading
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0005, 1);
    bg.fillRect(0, 0, this.scale.width, this.scale.height);
  }

  create() {
    EventBus.emit("scene-ready", this);

    // No React handshake — go straight to gameplay.
    this.scene.start("GameScene");
  }
}

import * as Phaser from "phaser";
import { BootScene, PreloaderScene, GameScene } from "./scenes";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 720,
    height: 1280,
  },
  physics: {
    default: "arcade",
    arcade: {
      // IMPORTANT: World gravity is OFF by default.
      // Enable for games where falling is a core mechanic: { x: 0, y: 600 }
      // Needs gravity: platformers, side-scrollers, physics puzzles, pinball, Flappy Bird-style games.
      // No gravity needed: top-down games, dungeon crawlers, overhead racers, twin-stick shooters, bullet-hell games.
      // When gravity is enabled, any body that must not fall needs body.setAllowGravity(false).
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, PreloaderScene, GameScene],
  transparent: true, // Allow React UI to show through
};

export function StartGame(parent: string | HTMLElement): Phaser.Game {
  return new Phaser.Game({ ...config, parent });
}

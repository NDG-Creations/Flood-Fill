import * as Phaser from "phaser";
import { EventBus } from "../EventBus";
import { onShutdown } from "../helpers";
import { connectPhaserInput, type GameInputState } from "../../components/touch-overlay/useGameInput";

type GameMode = "classic" | "blitz" | "zen";

type CellState = {
  color: number;
  filledBy: 0 | 1 | 2;
};

type LevelConfig = {
  size: number;
  colors: number;
  moveLimit: number;
  timeLimit: number;
  targetFill: number;
};

const WORLD_W = 720;
const WORLD_H = 1280;
const PALETTE = [0xff6b6b, 0xfeca57, 0x48dbfb, 0x1dd1a1, 0x5f27cd, 0xff9f43];
const GHOST_COLOR = 0xe0e0e0;
const MODE_ORDER: GameMode[] = ["classic", "blitz", "zen"];
const ROUND_TIME_LIMIT = 60;
const LEVEL_TRANSITION_DELAY = 5;

export class GameScene extends Phaser.Scene {
  private gameInput!: GameInputState;
  private mode: GameMode = "classic";
  private levelIndex = 0;
  private levelConfigs: LevelConfig[] = [];
  private cells: CellState[][] = [];
  private cellSize = 0;
  private boardX = 0;
  private boardY = 0;
  private boardSize = 0;
  private selectedColor = 0;
  private moves = 0;
  private score = 0;
  private timerValue = 0;
  private ghostProgress = 0;
  private levelLocked = false;
  private lockPulse = 0;
  private transitionPending = false;
  private transitionDelay = 0;
  private boardContainer!: Phaser.GameObjects.Container;
  private uiGroup!: Phaser.GameObjects.Container;
  private paletteButtons: Phaser.GameObjects.Container[] = [];
  private hudText!: Phaser.GameObjects.Text;
  private modeText!: Phaser.GameObjects.Text;
  private metaText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private boardBg!: Phaser.GameObjects.Graphics;
  private flashTween?: Phaser.Tweens.Tween;
  private countdownTimer?: Phaser.Time.TimerEvent;
  private onPauseGame = () => this.handlePause();
  private onResumeGame = () => this.handleResume();
  private onRestartGame = () => this.handleRestart();
  private onStartLevel = (levelIndex: number) => this.loadLevel(levelIndex);
  private onBonusTime = () => this.addBonusTime();
  private onBonusTries = () => this.addBonusTries();

  constructor() { super("GameScene"); }

  init() {
    this.mode = "classic";
    this.levelIndex = Math.max(0, Math.min(99, EventBus.getCurrentLevel() || 0));
    this.levelConfigs = this.buildLevels();
    this.cells = [];
    this.paletteButtons = [];
    this.selectedColor = 0;
    this.moves = 0;
    this.score = 0;
    this.timerValue = 0;
    this.ghostProgress = 0;
    this.levelLocked = false;
    this.lockPulse = 0;
    this.transitionPending = false;
    this.transitionDelay = 0;
  }

  create() {
    this.cameras.main.setBackgroundColor("#0c1020");
    this.gameInput = connectPhaserInput(this);

    this.addGradientBackground();
    this.boardContainer = this.add.container(0, 0);
    this.uiGroup = this.add.container(0, 0);
    this.buildUI();
    this.loadLevel(this.levelIndex);

    EventBus.on("pause-game", this.onPauseGame);
    EventBus.on("resume-game", this.onResumeGame);
    EventBus.on("restart-game", this.onRestartGame);
    EventBus.on("start-level", this.onStartLevel);
    EventBus.on("bonus-time", this.onBonusTime);
    EventBus.on("bonus-tries", this.onBonusTries);
    onShutdown(this, () => {
      EventBus.off("pause-game", this.onPauseGame);
      EventBus.off("resume-game", this.onResumeGame);
      EventBus.off("restart-game", this.onRestartGame);
      EventBus.off("start-level", this.onStartLevel);
      EventBus.off("bonus-time", this.onBonusTime);
      EventBus.off("bonus-tries", this.onBonusTries);
      this.countdownTimer?.remove();
    });

    this.input.on("pointerdown", this.handlePointerDown, this);
    this.input.keyboard?.on("keydown-ESC", () => EventBus.emit("pause-game"));
    EventBus.emit("scene-ready", this);
  }

  update() {
    if (this.scene.isPaused()) return;
    if (this.mode === "blitz") {
      this.ghostProgress += 1 / 60;
      if (this.ghostProgress > 1) this.ghostProgress = 1;
    }

    // Keep visuals stable: no zooming/pulsing while the level is locked.
    // The board should remain static until the timer completes.
    this.boardContainer.setScale(1);
    this.messageText.setAlpha(1);
  }

  private buildLevels(): LevelConfig[] {
    const levels: LevelConfig[] = [];
    for (let i = 0; i < 100; i++) {
      const size = Math.min(6 + Math.floor(i / 3), 14);
      const colors = Math.min(5 + Math.floor(i / 8), 7);
      const moveLimit = Math.max(20 - Math.floor(i / 6), 6);
      const timeLimit = Math.max(ROUND_TIME_LIMIT - Math.floor(i / 10), 30);
      const targetFill = 1;
      levels.push({ size, colors, moveLimit, timeLimit, targetFill });
    }
    return levels;
  }

  private addGradientBackground() {
    const bg = this.add.graphics();
    bg.fillStyle(0x10182f, 1).fillRect(0, 0, WORLD_W, WORLD_H);
    bg.fillGradientStyle(0x10182f, 0x10182f, 0x1b2c5d, 0x0b1328, 1);
    bg.fillRect(0, 0, WORLD_W, WORLD_H);
    bg.fillStyle(0xffffff, 0.04).fillCircle(610, 180, 260).fillCircle(160, 880, 340);
  }

  private buildUI() {
    this.boardBg = this.add.graphics();
    this.boardContainer.add(this.boardBg);
    this.hudText = this.add.text(24, 1110, "", { fontFamily: "Inter, system-ui", fontSize: "24px", color: "#fff", fontStyle: "700" });
    this.modeText = this.add.text(WORLD_W - 24, 1110, "", { fontFamily: "Inter, system-ui", fontSize: "17px", color: "#d8e2ff", align: "right" }).setOrigin(1, 0);
    this.metaText = this.add.text(WORLD_W - 24, 1136, "", { fontFamily: "Inter, system-ui", fontSize: "15px", color: "#9db4ff", align: "right" }).setOrigin(1, 0);
    this.messageText = this.add.text(WORLD_W / 2, 182, "", { fontFamily: "Inter, system-ui", fontSize: "22px", color: "#ffffff", align: "center" }).setOrigin(0.5);
    this.uiGroup.add([this.hudText, this.modeText, this.metaText, this.messageText]);

    const backBtn = this.createArrowButton(WORLD_W - 64, 28, () => this.returnToLevels());
    this.uiGroup.add(backBtn);
  }

  private createArrowButton(x: number, y: number, onClick: () => void) {
    const c = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.1).fillRoundedRect(0, 0, 52, 52, 18);
    const t = this.add.text(26, 26, "←", { fontFamily: "Inter, system-ui", fontSize: "22px", color: "#fff", fontStyle: "700" }).setOrigin(0.5);
    c.add([bg, t]);
    c.setSize(52, 52);
    c.setInteractive({ useHandCursor: true });
    c.on("pointerdown", onClick);
    return c;
  }

  private loadLevel(index: number) {
    const cfg = this.levelConfigs[index % this.levelConfigs.length];
    this.levelIndex = index;
    EventBus.setCurrentLevel(index);
    this.moves = 0;
    this.timerValue = cfg.timeLimit;
    this.selectedColor = Phaser.Math.Between(0, cfg.colors - 1);
    this.ghostProgress = 0;
    this.levelLocked = false;
    this.lockPulse = 0;
    this.transitionPending = false;
    this.transitionDelay = 0;
    this.countdownTimer?.remove();
    this.countdownTimer = this.time.addEvent({ delay: 1000, loop: true, callback: () => this.tickTimer() });
    this.generateBoard(cfg);
    this.renderBoard();
    this.updateHud();
    this.showMessage(`Level ${index + 1}`);
    this.evaluateCompletion();
  }

  private generateBoard(cfg: LevelConfig) {
    this.cells = Array.from({ length: cfg.size }, (_, y) =>
      Array.from({ length: cfg.size }, (_, x) => ({
        color: Phaser.Math.Between(0, cfg.colors - 1),
        filledBy: (x === 0 && y === 0 ? 1 : 0) as 0 | 1 | 2,
      }))
    );
    this.cellSize = Math.floor(Math.min(560 / cfg.size, 560 / cfg.size));
    this.boardSize = this.cellSize * cfg.size;
    this.boardX = Math.floor((WORLD_W - this.boardSize) / 2);
    this.boardY = 240;
  }

  private renderBoard() {
    if (!this.boardContainer || !this.boardBg) return;

    // Clear and redraw everything using the persistent boardBg graphics only.
    this.boardBg.clear();
    this.boardBg.fillStyle(0x0b1122, 0.9).fillRoundedRect(this.boardX - 10, this.boardY - 10, this.boardSize + 20, this.boardSize + 20, 26);
    this.boardBg.lineStyle(3, 0xffffff, 0.08).strokeRoundedRect(this.boardX - 10, this.boardY - 10, this.boardSize + 20, this.boardSize + 20, 26);

    for (let y = 0; y < this.cells.length; y++) {
      for (let x = 0; x < this.cells[y].length; x++) {
        const cell = this.cells[y][x];
        const px = this.boardX + x * this.cellSize;
        const py = this.boardY + y * this.cellSize;
        const col = cell.filledBy === 2 ? GHOST_COLOR : PALETTE[cell.color % PALETTE.length];
        this.boardBg.fillStyle(col, cell.filledBy === 1 || cell.filledBy === 2 ? 1 : 0.82);
        this.boardBg.fillRoundedRect(px + 2, py + 2, this.cellSize - 4, this.cellSize - 4, 10);
        this.boardBg.lineStyle(2, 0x000000, 0.16).strokeRoundedRect(px + 2, py + 2, this.cellSize - 4, this.cellSize - 4, 10);
      }
    }

    this.renderPalette();
  }

  private renderPalette() {
    this.paletteButtons.forEach((b) => b.destroy());
    this.paletteButtons = [];
    const cfg = this.levelConfigs[this.levelIndex % this.levelConfigs.length];
    const startX = 76;
    const y = 1070;
    const gap = 106;
    if (!this.sys || !this.boardBg || !this.boardContainer) return;
    for (let i = 0; i < cfg.colors; i++) {
      const gx = startX + i * gap;
      const gy = y;
      this.boardBg.fillStyle(PALETTE[i], 1).fillCircle(gx, gy, 34);
      this.boardBg.lineStyle(i === this.selectedColor ? 6 : 2, 0xffffff, i === this.selectedColor ? 1 : 0.2).strokeCircle(gx, gy, 34);
      const hit = this.add.circle(gx, gy, 44, 0x000000, 0);
      hit.setInteractive(new Phaser.Geom.Circle(0, 0, 44), Phaser.Geom.Circle.Contains);
      hit.on("pointerdown", () => this.floodFill(i));
      this.boardContainer.add(hit);
      this.paletteButtons.push(hit as unknown as Phaser.GameObjects.Container);
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (pointer.y < 1020) return;
    const cfg = this.levelConfigs[this.levelIndex % this.levelConfigs.length];
    const paletteTop = 1030;
    if (pointer.y >= paletteTop) {
      const idx = Math.floor((pointer.x - 30) / 106);
      if (idx >= 0 && idx < cfg.colors) this.floodFill(idx);
    }
  }

  private floodFill(colorIndex: number) {
    if (this.levelLocked || this.transitionPending) return;
    if (colorIndex === this.selectedColor) {
      this.evaluateCompletion();
      return;
    }
    const cfg = this.levelConfigs[this.levelIndex % this.levelConfigs.length];
    this.selectedColor = colorIndex;
    this.moves += 1;
    const startColor = this.cells[0][0].color;
    const visited = new Set<string>();
    const stack = [[0, 0]];
    while (stack.length) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      visited.add(key);
      if (!this.cells[y] || !this.cells[y][x]) continue;
      if (this.cells[y][x].color !== startColor && this.cells[y][x].filledBy !== 1) continue;
      this.cells[y][x].color = colorIndex;
      this.cells[y][x].filledBy = 1;
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy]) => stack.push([x+dx,y+dy]));
    }

    if (this.mode === "blitz") this.applyGhostMove(cfg.colors);
    this.score = this.calculateScore();
    EventBus.emit("score-update", this.score);
    this.renderBoard();
    this.updateHud();
    this.evaluateCompletion();
  }

  private isBoardUniform() {
    if (!this.cells.length) return false;
    const target = this.cells[0][0].color;
    for (const row of this.cells) {
      for (const cell of row) {
        if (cell.color !== target) return false;
      }
    }
    return true;
  }

  private evaluateCompletion() {
    if (this.transitionPending || this.levelLocked) return;
    if (this.isBoardUniform()) {
      this.levelLocked = true;
      this.transitionPending = true;
      this.transitionDelay = LEVEL_TRANSITION_DELAY;
      this.showMessage(`Grid complete — next level in ${this.transitionDelay}s`);
      this.updateHud();
    }
  }

  private applyGhostMove(colors: number) {
    const ghostColor = Phaser.Math.Between(0, colors - 1);
    const queue = [[this.cells.length - 1, this.cells.length - 1]];
    const seen = new Set<string>();
    const targetColor = this.cells[this.cells.length - 1][this.cells.length - 1].color;
    while (queue.length) {
      const [x, y] = queue.pop()!;
      const key = `${x},${y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (!this.cells[y] || !this.cells[y][x]) continue;
      if (this.cells[y][x].color !== targetColor && this.cells[y][x].filledBy !== 2) continue;
      this.cells[y][x].color = ghostColor;
      this.cells[y][x].filledBy = 2;
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy]) => queue.push([x+dx,y+dy]));
    }
  }

  private countFilled() {
    let filled = 0, total = 0;
    for (const row of this.cells) for (const c of row) { total++; if (c.filledBy === 1) filled++; }
    return filled / total;
  }

  private checkWinLoss() {
    const pct = this.countFilled();
    const cfg = this.levelConfigs[this.levelIndex % this.levelConfigs.length];

    if (pct >= 0.999) {
      this.evaluateCompletion();
      return;
    }

    if (this.mode !== "zen" && this.moves >= cfg.moveLimit && this.timerValue <= 0) {
      EventBus.emit("game-over", { score: this.score });
    }
  }

  private advanceLevelOrFinish() {
    EventBus.emit("level-complete", { levelIndex: this.levelIndex, score: this.score });
    if (this.levelIndex < 99) {
      this.loadLevel(this.levelIndex + 1);
    } else {
      EventBus.emit("game-over", { score: this.score + 2000 });
    }
  }

  private tickTimer() {
    if (this.mode === "zen") return;
    this.timerValue -= 1;
    this.updateHud();
    if (this.timerValue <= 10) this.flashWarning();
    if (this.timerValue === 30) this.showMilestoneOverlay("⏱ Half time completed");
    if (this.timerValue === 10) this.showMilestoneOverlay("⏱ 10 seconds left");
    if (this.timerValue === 5) this.showMilestoneOverlay("⏱ 5 seconds left");
    if (this.timerValue <= 0) this.showMilestoneOverlay("Time over");

    if (this.transitionPending) {
      this.transitionDelay -= 1;
      this.showMessage(`Grid complete — next level in ${Math.max(this.transitionDelay, 0)}s`);
      if (this.transitionDelay <= 0) {
        this.transitionPending = false;
        this.levelLocked = false;
        this.advanceLevelOrFinish();
      }
      return;
    }

    if (this.timerValue <= 0) {
      const pct = this.countFilled();
      if (pct >= 0.999) {
        this.advanceLevelOrFinish();
      } else {
        EventBus.emit("game-over", { score: this.score });
      }
      return;
    }

    this.checkWinLoss();
  }

  private flashWarning() {
    if (this.flashTween) return;
    this.flashTween = this.tweens.add({ targets: this.messageText, alpha: 0.4, yoyo: true, repeat: 4, duration: 200, onComplete: () => { this.messageText.alpha = 1; this.flashTween = undefined; } });
  }

  private showMilestoneOverlay(text: string) {
    const overlay = this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x000000, 0.42);
    overlay.setDepth(999);
    const icon = this.add.text(WORLD_W / 2, WORLD_H / 2 - 38, "⏱", { fontSize: "84px" }).setOrigin(0.5).setDepth(1000);
    const label = this.add.text(WORLD_W / 2, WORLD_H / 2 + 24, text, { fontFamily: "Inter, system-ui", fontSize: "24px", color: "#fff", fontStyle: "700", align: "center" }).setOrigin(0.5).setDepth(1000);
    this.time.delayedCall(1000, () => { overlay.destroy(); icon.destroy(); label.destroy(); });
  }

  private updateHud() {
    const cfg = this.levelConfigs[this.levelIndex % this.levelConfigs.length];
    try {
      this.modeText?.setText(`Mode: ${this.mode.toUpperCase()}  |  Level ${this.levelIndex + 1}/20`);
      this.metaText?.setText(
        this.mode === "zen"
          ? `Unlimited moves • Relaxed pace • Target 100%`
          : `Moves ${this.moves}/${cfg.moveLimit}  ⏱ ${this.timerValue}s  •  Target 100%`
      );
    } catch {
      // no-op
    }
  }

  private addBonusTime() {
    this.timerValue += 10;
    this.showMessage("Bonus +10s");
    this.updateHud();
  }

  private addBonusTries() {
    this.moves = Math.max(0, this.moves - 3);
    this.showMessage("Bonus +3 tries");
    this.updateHud();
  }

  private returnToLevels() {
    EventBus.emit("resume-game");
    EventBus.emit("game-resumed");
  }

  private calculateScore() {
    const cfg = this.levelConfigs[this.levelIndex % this.levelConfigs.length];
    const filledPercent = this.countFilled();
    const completionScore = Math.round(filledPercent * 40);
    const timeBonus = Math.min(Math.max(this.timerValue, 0), 20);
    const moveBonus = Math.max(Math.min(cfg.moveLimit - this.moves, 20), 0);
    const difficultyBonus = Math.min(Math.floor((cfg.size + cfg.colors) / 2), 24);
    const raw = completionScore + timeBonus + moveBonus + difficultyBonus;
    return Math.max(0, Math.min(100, raw));
  }

  private showMessage(text: string) {
    // Avoid late lifecycle calls that can throw during scene teardown.
    // The message text is only cosmetic, so we safely skip updates if the
    // object is no longer valid.
    try {
      this.messageText?.setText(text);
    } catch {
      // no-op
    }
  }

  private cycleMode() {
    const idx = MODE_ORDER.indexOf(this.mode);
    this.mode = MODE_ORDER[(idx + 1) % MODE_ORDER.length];
    this.score = 0;
    this.showMessage(`${this.mode.toUpperCase()} MODE`);
    this.loadLevel(0);
    EventBus.emit("score-update", this.score);
  }

  private grantBonusMoves() {
    this.moves = Math.max(0, this.moves - 5);
    this.score += 150;
    this.showMessage("Rewarded bonus: +5 moves");
    EventBus.emit("score-update", this.score);
    this.updateHud();
  }

  private handlePause = () => {
    if (this.scene) {
      this.scene.pause();
    }
    EventBus.emit("game-paused");
  };

  private handleResume = () => {
    if (this.scene) {
      this.scene.resume();
    }
    EventBus.emit("game-resumed");
  };

  private handleRestart = () => {
    // React handles the view reset; the scene itself should not try to
    // restart directly here because it can race with teardown and cause
    // queueing errors.
    EventBus.emit("game-resumed");
  };
}

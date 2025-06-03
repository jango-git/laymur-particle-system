import type { UILayer } from "laymur";
import type { WebGLRenderer } from "three";
import type { UIParticleSystem } from "../UIParticleSystem";
import { UIEmitter } from "./UIEmitter";

export interface UIUniformInTimeEmitterOptions {
  infinite: boolean;
  spawnAmount: number;
  playbackDuration: number;
  playsByDefault: boolean;
}

export abstract class UIUniformInTimeEmitter extends UIEmitter {
  protected readonly infiniteInternal: boolean;
  protected readonly spawnAmountInternal: number;
  protected readonly playbackDurationInternal: number;
  protected readonly playsByDefaultInternal: boolean;

  private isPlayingInternal = false;
  private currentTime = 0;
  private lastTimeParticleAmount = 0;

  constructor(
    layer: UILayer,
    system: UIParticleSystem,
    options: UIUniformInTimeEmitterOptions,
  ) {
    super(layer, system);

    this.infiniteInternal = options.infinite;
    this.spawnAmountInternal = options.spawnAmount;
    this.playbackDurationInternal = options.playbackDuration;
    this.playsByDefaultInternal = options.playsByDefault;

    if (options.playsByDefault) {
      this.play();
    }
  }

  public play(): void {
    if (!this.isPlayingInternal) {
      this.isPlayingInternal = true;
      this.resetSpawn();
    }
  }

  public stop(): void {
    if (this.isPlayingInternal) {
      this.isPlayingInternal = false;
      this.resetSpawn();
    }
  }

  protected override render(renderer: WebGLRenderer, deltaTime: number): void {
    if (!this.isPlayingInternal) {
      return;
    }

    if (this.infiniteInternal) {
      this.resetSpawn();
    }

    this.currentTime += deltaTime;
    const currentParticleAmount = Math.min(
      this.spawnAmountInternal,
      this.spawnAmountInternal *
        (this.currentTime / this.playbackDurationInternal),
    );

    const particleCountToSpawn = Math.round(
      currentParticleAmount - this.lastTimeParticleAmount,
    );
    this.lastTimeParticleAmount = currentParticleAmount;

    for (let i = 0; i < particleCountToSpawn; i++) {
      this.spawn();
    }

    if (this.lastTimeParticleAmount >= this.spawnAmountInternal) {
      this.stop();
    }
  }

  protected resetSpawn(): void {
    this.currentTime = 0;
    this.lastTimeParticleAmount = 0;
  }

  protected abstract spawn(): void;
}

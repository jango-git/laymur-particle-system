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
    this.applyTransformations();

    if (!this.isPlayingInternal) {
      return;
    }

    this.currentTime += deltaTime;

    if (this.infiniteInternal) {
      if (this.currentTime >= this.playbackDurationInternal) {
        this.resetSpawn();
      }
    } else {
      this.currentTime = Math.min(
        this.currentTime,
        this.playbackDurationInternal,
      );
    }

    const totalAmount = this.spawnAmountInternal;
    const duration = this.playbackDurationInternal;

    const expectedCount = Math.floor(
      (this.currentTime / duration) * totalAmount,
    );

    const countToSpawn = expectedCount - this.lastTimeParticleAmount;
    this.lastTimeParticleAmount = expectedCount;

    for (let i = 0; i < countToSpawn; i++) {
      this.spawn();
    }

    if (!this.infiniteInternal && this.currentTime >= duration) {
      this.stop();
    }
  }

  protected resetSpawn(): void {
    this.currentTime = 0;
    this.lastTimeParticleAmount = 0;
  }

  protected abstract spawn(): void;
}

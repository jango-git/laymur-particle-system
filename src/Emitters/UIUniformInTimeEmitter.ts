import type { UILayer } from "laymur";
import type { WebGLRenderer } from "three";
import type { UIParticleSystem } from "../UIParticleSystem";
import { UIEmitter } from "./UIEmitter";

/**
 * Configuration options for UIUniformInTimeEmitter.
 */
export interface UIUniformInTimeEmitterOptions {
  /**
   * Whether the emitter should loop infinitely.
   * When true, the emitter will restart after completing each cycle.
   */
  infinite: boolean;
  
  /**
   * Total number of particles to spawn per cycle.
   */
  spawnAmount: number;
  
  /**
   * Duration in seconds for one complete spawn cycle.
   */
  playbackDuration: number;
  
  /**
   * Whether the emitter should start playing automatically.
   */
  playsByDefault: boolean;
}

/**
 * Abstract emitter that spawns particles uniformly distributed over time.
 * 
 * This emitter spreads particle spawning evenly throughout the playback duration,
 * ensuring consistent particle emission rates. It supports both infinite looping
 * and single-cycle playback.
 * 
 * @abstract
 * @extends {UIEmitter}
 * 
 * @example
 * ```typescript
 * class MyEmitter extends UIUniformInTimeEmitter {
 *   protected spawn(elapsedTime: number): void {
 *     // Spawn a particle with specific properties
 *   }
 * }
 * 
 * const emitter = new MyEmitter(layer, system, {
 *   infinite: true,
 *   spawnAmount: 50,
 *   playbackDuration: 2,
 *   playsByDefault: true
 * });
 * ```
 */
export abstract class UIUniformInTimeEmitter extends UIEmitter {
  /** Whether the emitter loops infinitely */
  protected readonly infiniteInternal: boolean;
  /** Total number of particles to spawn per cycle */
  protected readonly spawnAmountInternal: number;
  /** Duration of one complete spawn cycle in seconds */
  protected readonly playbackDurationInternal: number;
  /** Whether the emitter starts playing automatically */
  protected readonly playsByDefaultInternal: boolean;

  /** Current playback state */
  private isPlayingInternal = false;
  /** Current time position within the playback cycle */
  private currentTime = 0;
  /** Number of particles spawned up to the last update */
  private lastTimeParticleAmount = 0;

  /**
   * Creates a new UIUniformInTimeEmitter instance.
   * 
   * @param layer - The UI layer this emitter belongs to
   * @param system - The particle system that will manage spawned particles
   * @param options - Configuration options for the emitter
   */
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

  /**
   * Starts or resumes particle emission.
   * If already playing, this method has no effect.
   */
  public play(): void {
    if (!this.isPlayingInternal) {
      this.isPlayingInternal = true;
      this.resetSpawn();
    }
  }

  /**
   * Stops particle emission and resets the emitter state.
   * If already stopped, this method has no effect.
   */
  public stop(): void {
    if (this.isPlayingInternal) {
      this.isPlayingInternal = false;
      this.resetSpawn();
    }
  }

  /**
   * Updates the emitter and spawns particles based on elapsed time.
   * This method is called automatically by the rendering system.
   * 
   * @param renderer - The WebGL renderer
   * @param deltaTime - Time elapsed since last frame in seconds
   * @protected
   */
  protected override render(renderer: WebGLRenderer, deltaTime: number): void {
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
    const step = duration / Math.max(1, totalAmount - 1);

    for (let i = 1; i <= countToSpawn; i++) {
      const targetTime = (this.lastTimeParticleAmount + i) * step;
      this.spawn(this.currentTime - targetTime);
    }

    this.lastTimeParticleAmount = expectedCount;

    if (!this.infiniteInternal && this.currentTime >= duration) {
      this.stop();
    }
  }

  /**
   * Resets the spawn cycle to its initial state.
   * This clears the current time and particle count.
   * 
   * @protected
   */
  protected resetSpawn(): void {
    this.currentTime = 0;
    this.lastTimeParticleAmount = 0;
  }

  /**
   * Abstract method to spawn a single particle.
   * Must be implemented by concrete emitter classes.
   * 
   * @param elapsedTime - Time elapsed since this particle should have been spawned
   * @protected
   * @abstract
   */
  protected abstract spawn(elapsedTime: number): void;
}

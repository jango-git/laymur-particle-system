import { Color, MathUtils, Vector2 } from "three";
import type { UIParticleSystem } from "../UIParticleSystem";
import {
  isUIRangeColor,
  type UIRange,
  type UIRangeColor,
  type UIRangeRadial,
  type UIRangeVector,
} from "../UIRange";
import { UIUniformInTimeEmitter } from "./UIUniformInTimeEmitter";

/**
 * Configuration options for particles spawned by UIRectangleEmitter.
 */
export interface UIRectangleEmitterParticleOptions {
  /**
   * Lifetime of particles in seconds.
   * Can be a fixed value or a range for random variation.
   */
  lifeTime: UIRange | number;

  /**
   * Initial spawn position range within the rectangle.
   * Particles will spawn randomly within this rectangular area.
   */
  position: UIRangeVector;
  
  /**
   * Initial scale of particles.
   * Can be a fixed value or a range for random variation.
   */
  scale: UIRange | number;
  
  /**
   * Initial rotation angle in degrees.
   * Can be a fixed value or a range for random variation.
   */
  angle: UIRange | number;

  /**
   * Initial velocity configuration using radial coordinates.
   * Defines both direction (angle) and magnitude (power) ranges.
   */
  velocity: UIRangeRadial;
  
  /**
   * Angular velocity in degrees per second.
   * Can be a fixed value or a range for random variation.
   */
  angularVelocity: UIRange | number;

  /**
   * Scale animation curve over particle lifetime.
   * Array values represent scale at evenly distributed time points from birth to death.
   * Each value can be fixed or a range for per-particle variation.
   */
  scaleOverTime: (UIRange | number)[];
  
  /**
   * Color animation curve over particle lifetime.
   * Array values represent colors at evenly distributed time points from birth to death.
   * Supports hex colors, grayscale ranges, or RGB component ranges.
   */
  colorOverTime: (UIRangeColor | UIRange | number)[];
  
  /**
   * Opacity animation curve over particle lifetime.
   * Array values represent opacity (0-1) at evenly distributed time points from birth to death.
   * Each value can be fixed or a range for per-particle variation.
   */
  opacityOverTime: (UIRange | number)[];
}

/**
 * Configuration options for UIRectangleEmitter behavior.
 */
export interface UIRectangleEmitterOptions {
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
 * Rectangle-shaped particle emitter that spawns particles within a rectangular area.
 * 
 * This emitter creates particles uniformly distributed over time within a defined
 * rectangular region. It supports extensive customization of particle properties
 * including position, scale, rotation, velocity, and animated properties over lifetime.
 * 
 * @extends {UIUniformInTimeEmitter}
 * 
 * @example
 * ```typescript
 * const emitter = new UIRectangleEmitter(
 *   particleSystem,
 *   {
 *     infinite: true,
 *     spawnAmount: 100,
 *     playbackDuration: 2,
 *     playsByDefault: true
 *   },
 *   {
 *     lifeTime: { min: 1, max: 3 },
 *     position: { min: { x: -50, y: -50 }, max: { x: 50, y: 50 } },
 *     velocity: { powerMin: 100, powerMax: 200, angleMin: -45, angleMax: 45 },
 *     colorOverTime: [0xff0000, 0xffff00, 0x0000ff],
 *     opacityOverTime: [0, 1, 0]
 *   }
 * );
 * ```
 */
export class UIRectangleEmitter extends UIUniformInTimeEmitter {
  /** Particle lifetime configuration */
  private readonly lifeTime: UIRange | number;
  /** Spawn position range */
  private readonly position: UIRangeVector | number;
  /** Initial scale configuration */
  private readonly scale: UIRange | number;
  /** Initial rotation angle configuration */
  private readonly angle: UIRange | number;
  /** Initial velocity configuration */
  private readonly velocity: UIRangeRadial;
  /** Angular velocity configuration */
  private readonly angularVelocity: UIRange | number;
  /** Scale animation curve */
  private readonly scaleOverTime: (UIRange | number)[];
  /** Color animation curve */
  private readonly colorOverTime: (UIRangeColor | UIRange | number)[];
  /** Opacity animation curve */
  private readonly opacityOverTime: (UIRange | number)[];

  /** Internal scale multiplier for the emitter */
  private emitterScaleInternal = 1;

  /**
   * Creates a new UIRectangleEmitter instance.
   * 
   * @param system - The particle system that will manage spawned particles
   * @param emitterOptions - Configuration for emitter behavior (timing, looping, etc.)
   * @param particleOptions - Configuration for individual particle properties
   */
  constructor(
    system: UIParticleSystem,
    emitterOptions: Partial<UIRectangleEmitterOptions> = {},
    particleOptions: Partial<UIRectangleEmitterParticleOptions> = {},
  ) {
    super(system.layer, system, {
      infinite: emitterOptions.infinite ?? false,
      spawnAmount: emitterOptions.spawnAmount ?? 16,
      playbackDuration: emitterOptions.playbackDuration ?? 1,
      playsByDefault: emitterOptions.playsByDefault ?? false,
    });

    this.lifeTime = particleOptions.lifeTime ?? 20;
    this.position = particleOptions.position ?? {
      min: { x: 0, y: 0 },
      max: { x: 0, y: 0 },
    };
    this.scale = particleOptions.scale ?? 1;
    this.angle = particleOptions.angle ?? 0;
    this.velocity = particleOptions.velocity ?? {
      powerMin: 0,
      powerMax: 0,
      angleMin: 0,
      angleMax: 0,
    };
    this.angularVelocity = particleOptions.angularVelocity ?? 0;
    this.scaleOverTime = particleOptions.scaleOverTime ?? [1];
    this.colorOverTime = particleOptions.colorOverTime ?? [0xffffff];
    this.opacityOverTime = particleOptions.opacityOverTime ?? [1];
  }

  /**
   * Gets the emitter scale multiplier.
   * This value scales all position and velocity-related properties.
   * 
   * @returns The current emitter scale
   */
  public get emitterScale(): number {
    return this.emitterScaleInternal;
  }

  /**
   * Sets the emitter scale multiplier.
   * This value scales all position and velocity-related properties,
   * allowing the entire particle effect to be scaled up or down.
   * 
   * @param value - The new emitter scale
   */
  public set emitterScale(value: number) {
    this.emitterScaleInternal = value;
  }

  /**
   * Spawns a single particle with randomized properties based on configuration.
   * This method is called by the base class at appropriate intervals.
   * 
   * @param elapsedTime - Time elapsed since this particle should have been spawned
   * @protected
   */
  protected override spawn(elapsedTime: number): void {
    const lifeTime =
      typeof this.lifeTime === "number"
        ? this.lifeTime
        : MathUtils.randFloat(this.lifeTime.min, this.lifeTime.max);

    const position = new Vector2(
      this.x +
        (typeof this.position === "number"
          ? this.position
          : MathUtils.randFloat(this.position.min.x, this.position.max.x)) *
          this.emitterScaleInternal,
      this.y +
        (typeof this.position === "number"
          ? this.position
          : MathUtils.randFloat(this.position.min.y, this.position.max.y)) *
          this.emitterScaleInternal,
    );

    const rotation = MathUtils.degToRad(
      typeof this.angle === "number"
        ? this.angle
        : MathUtils.randFloat(this.angle.min, this.angle.max),
    );

    const velocityAngle = MathUtils.degToRad(
      MathUtils.randFloat(this.velocity.angleMin, this.velocity.angleMax),
    );

    const velocityPower =
      MathUtils.randFloat(this.velocity.powerMin, this.velocity.powerMax) *
      this.emitterScaleInternal;

    const velocity = new Vector2(
      Math.cos(velocityAngle),
      Math.sin(velocityAngle),
    ).multiplyScalar(velocityPower);

    const angularVelocity = MathUtils.degToRad(
      typeof this.angularVelocity === "number"
        ? this.angularVelocity
        : MathUtils.randFloat(
            this.angularVelocity.min,
            this.angularVelocity.max,
          ),
    );

    const scaleFactor =
      (typeof this.scale === "number"
        ? this.scale
        : MathUtils.randFloat(this.scale.min, this.scale.max)) *
      this.emitterScaleInternal;

    const scaleOverTime = this.scaleOverTime.map((value: UIRange | number) =>
      typeof value === "number"
        ? value * scaleFactor
        : MathUtils.randFloat(value.min, value.max) * scaleFactor,
    );

    const colorOverTime = this.colorOverTime.map(
      (value: UIRangeColor | UIRange | number) => {
        if (typeof value === "number") {
          return new Color().setHex(value);
        } else if (isUIRangeColor(value)) {
          return new Color(
            MathUtils.randFloat(value.rMin, value.rMax),
            MathUtils.randFloat(value.gMin, value.gMax),
            MathUtils.randFloat(value.bMin, value.bMax),
          );
        } else {
          const color = MathUtils.randFloat(value.min, value.max);
          return new Color(color, color, color);
        }
      },
    );

    const opacityOverTime = this.opacityOverTime.map(
      (value: UIRange | number) =>
        typeof value === "number"
          ? value
          : MathUtils.randFloat(value.min, value.max),
    );

    this.system.spawnParticle(
      {
        lifeTime,
        position,
        rotation,
        velocity,
        angularVelocity,
        scaleOverTime,
        colorOverTime,
        opacityOverTime,
      },
      elapsedTime,
    );
  }
}

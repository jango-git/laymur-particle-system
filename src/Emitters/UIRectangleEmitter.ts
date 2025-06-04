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

export interface UIRectangleEmitterParticleOptions {
  lifeTime: UIRange | number;

  position: UIRangeVector;
  scale: UIRange | number;
  angle: UIRange | number;

  velocity: UIRangeRadial;
  angularVelocity: UIRange | number;

  scaleOverTime: (UIRange | number)[];
  colorOverTime: (UIRangeColor | UIRange | number)[];
  opacityOverTime: (UIRange | number)[];
}

export interface UIRectangleEmitterOptions {
  infinite: boolean;
  spawnAmount: number;
  playbackDuration: number;
  playsByDefault: boolean;
}

export class UIRectangleEmitter extends UIUniformInTimeEmitter {
  private readonly lifeTime: UIRange | number;
  private readonly position: UIRangeVector | number;
  private readonly scale: UIRange | number;
  private readonly angle: UIRange | number;
  private readonly velocity: UIRangeRadial;
  private readonly angularVelocity: UIRange | number;
  private readonly scaleOverTime: (UIRange | number)[];
  private readonly colorOverTime: (UIRangeColor | UIRange | number)[];
  private readonly opacityOverTime: (UIRange | number)[];

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

  protected override spawn(elapsedTime: number): void {
    const lifeTimeFactor =
      1 /
      (typeof this.lifeTime === "number"
        ? this.lifeTime
        : MathUtils.randFloat(this.lifeTime.min, this.lifeTime.max));

    const position = new Vector2(
      this.x +
        (typeof this.position === "number"
          ? this.position
          : MathUtils.randFloat(this.position.min.x, this.position.max.x)),
      this.y +
        (typeof this.position === "number"
          ? this.position
          : MathUtils.randFloat(this.position.min.y, this.position.max.y)),
    );

    const rotation = MathUtils.degToRad(
      typeof this.angle === "number"
        ? this.angle
        : MathUtils.randFloat(this.angle.min, this.angle.max),
    );

    const velocityAngle = MathUtils.degToRad(
      MathUtils.randFloat(this.velocity.angleMin, this.velocity.angleMax),
    );

    const velocityPower = MathUtils.randFloat(
      this.velocity.powerMin,
      this.velocity.powerMax,
    );

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
      typeof this.scale === "number"
        ? this.scale
        : MathUtils.randFloat(this.scale.min, this.scale.max);

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
        lifeTimeFactor,
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

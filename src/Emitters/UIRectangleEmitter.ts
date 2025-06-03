import type { UILayer } from "laymur";
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

  position: UIRangeVector | number;
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
  constructor(
    layer: UILayer,
    system: UIParticleSystem,
    emitterOptions: UIRectangleEmitterOptions,
    private readonly particleOptions: UIRectangleEmitterParticleOptions,
  ) {
    super(layer, system, emitterOptions);
  }

  protected spawn(): void {
    const lifeTimeFactor =
      1 /
      (typeof this.particleOptions.lifeTime === "number"
        ? this.particleOptions.lifeTime
        : MathUtils.randFloat(
            this.particleOptions.lifeTime.min,
            this.particleOptions.lifeTime.max,
          ));

    const position = new Vector2(
      this.x +
        (typeof this.particleOptions.position === "number"
          ? this.particleOptions.position
          : MathUtils.randFloat(
              this.particleOptions.position.min.x,
              this.particleOptions.position.max.x,
            )),
      this.y +
        (typeof this.particleOptions.position === "number"
          ? this.particleOptions.position
          : MathUtils.randFloat(
              this.particleOptions.position.min.y,
              this.particleOptions.position.max.y,
            )),
    );

    const rotation = MathUtils.degToRad(
      typeof this.particleOptions.angle === "number"
        ? this.particleOptions.angle
        : MathUtils.randFloat(
            this.particleOptions.angle.min,
            this.particleOptions.angle.max,
          ),
    );

    const velocityAngle = MathUtils.degToRad(
      MathUtils.randFloat(
        this.particleOptions.velocity.angleMin,
        this.particleOptions.velocity.angleMax,
      ),
    );

    const velocityPower = MathUtils.degToRad(
      MathUtils.randFloat(
        this.particleOptions.velocity.angleMin,
        this.particleOptions.velocity.angleMax,
      ),
    );

    const velocity = new Vector2(
      Math.cos(velocityAngle),
      Math.sin(velocityAngle),
    ).multiplyScalar(velocityPower);

    const angularVelocity = MathUtils.degToRad(
      typeof this.particleOptions.angularVelocity === "number"
        ? this.particleOptions.angularVelocity
        : MathUtils.randFloat(
            this.particleOptions.angularVelocity.min,
            this.particleOptions.angularVelocity.max,
          ),
    );

    const scaleOverTime = this.particleOptions.scaleOverTime.map(
      (value: UIRange | number) =>
        typeof value === "number"
          ? value
          : MathUtils.randFloat(value.min, value.max),
    );

    const colorOverTime = this.particleOptions.colorOverTime.map(
      (value: UIRangeColor | UIRange | number) => {
        if (typeof value === "number") {
          return new Color(value, value, value);
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

    const opacityOverTime = this.particleOptions.opacityOverTime.map(
      (value: UIRange | number) =>
        typeof value === "number"
          ? value
          : MathUtils.randFloat(value.min, value.max),
    );

    this.system.spawnParticle({
      lifeTimeFactor,
      position,
      rotation,
      velocity,
      angularVelocity,
      scaleOverTime,
      colorOverTime,
      opacityOverTime,
    });
  }
}

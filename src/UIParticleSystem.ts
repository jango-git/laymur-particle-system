import type { UILayer } from "laymur";
import { UIElement } from "laymur";
import type {
  BufferAttribute,
  Texture,
  Vector2Like,
  WebGLRenderer,
} from "three";
import {
  Color,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  MathUtils,
  Mesh,
  PlaneGeometry,
  Vector2,
} from "three";
import { UIParticleMaterial } from "./UIParticleMaterial";

export interface UISystemSpawnOptions {
  lifeTimeFactor: number;
  position: Vector2Like;
  rotation: number;
  velocity: Vector2Like;
  angularVelocity: number;
  scaleOverTime: number[];
  colorOverTime: Color[];
  opacityOverTime: number[];
}

interface UIParticle {
  lifeTime: number;
  lifeTimeFactor: number;
  position: Vector2;
  rotation: number;
  scale: number;
  scaleOverTime: number[];
  opacity: number;
  opacityOverTime: number[];
  color: Color;
  colorOverTime: Color[];
  velocity: Vector2;
  angularVelocity: number;
}

interface UISystemOptions {
  capacity: number;
  gravity: Vector2Like;
}

export class UIParticleSystem extends UIElement {
  private readonly instancedGeometry: InstancedBufferGeometry;
  private readonly material: UIParticleMaterial;
  private readonly particles: UIParticle[] = [];
  private readonly gravity = new Vector2(0, -1024);

  constructor(
    layer: UILayer,
    texture: Texture,
    options: Partial<UISystemOptions> = {},
  ) {
    const width = texture.image.width;
    const height = texture.image.height;

    if (!width || !height) {
      throw new Error("Invalid texture dimensions");
    }

    const plane = new PlaneGeometry(width, height);
    const instancedGeometry = new InstancedBufferGeometry();
    instancedGeometry.index = plane.index;

    instancedGeometry.setAttribute(
      "position",
      plane.attributes["position"] as BufferAttribute,
    );
    instancedGeometry.setAttribute(
      "uv",
      plane.attributes["uv"] as BufferAttribute,
    );

    plane.dispose();
    const capacity = options.capacity ?? 128;

    instancedGeometry.setAttribute(
      "instanceTransform",
      new InstancedBufferAttribute(new Float32Array(capacity * 4), 4).setUsage(
        DynamicDrawUsage,
      ),
    );
    instancedGeometry.setAttribute(
      "instanceColor",
      new InstancedBufferAttribute(new Float32Array(capacity * 4), 4).setUsage(
        DynamicDrawUsage,
      ),
    );

    const material = new UIParticleMaterial(texture);
    const mesh = new Mesh(instancedGeometry, material);
    mesh.frustumCulled = false;

    super(layer, mesh, 0, 0, 1, 1);
    this.instancedGeometry = instancedGeometry;
    this.material = material;

    if (options.gravity) {
      this.gravity.copy(options.gravity);
    }

    this.applyTransformations();
  }

  public override destroy(): void {
    this.instancedGeometry.dispose();
    this.material.dispose();
    super.destroy();
  }

  public spawnParticle(options: UISystemSpawnOptions): void {
    if (
      this.particles.length >=
      this.instancedGeometry.attributes["instanceTransform"].count
    ) {
      return;
    }

    this.particles.push({
      lifeTime: 0,
      lifeTimeFactor: options.lifeTimeFactor,
      position: new Vector2().copy(options.position),
      rotation: options.rotation,
      scale: options.scaleOverTime[0],
      scaleOverTime: [...options.scaleOverTime],
      opacity: options.opacityOverTime[0],
      opacityOverTime: [...options.opacityOverTime],
      color: options.colorOverTime[0],
      colorOverTime: [...options.colorOverTime],
      velocity: new Vector2().copy(options.velocity),
      angularVelocity: options.angularVelocity,
    });
  }

  protected override render(renderer: WebGLRenderer, deltaTime: number): void {
    this.applyTransformations();
    const removedParticles: UIParticle[] = [];

    for (const particle of this.particles) {
      particle.lifeTime += particle.lifeTimeFactor * deltaTime;

      if (particle.lifeTime > 1) {
        removedParticles.push(particle);
        continue;
      }

      particle.velocity.addScaledVector(this.gravity, deltaTime);
      particle.position.addScaledVector(particle.velocity, deltaTime);
      particle.rotation += particle.angularVelocity * deltaTime;
      particle.scale = this.lerpArray(
        particle.lifeTime,
        particle.scaleOverTime,
      );
      particle.opacity = this.lerpArray(
        particle.lifeTime,
        particle.opacityOverTime,
      );
      particle.color = this.lerpColorArray(
        particle.lifeTime,
        particle.colorOverTime,
      );
    }

    this.removeParticles(removedParticles);
    this.updateInstanceAttributes();
  }

  private removeParticles(particles: UIParticle[]): void {
    for (const particle of particles) {
      const index = this.particles.indexOf(particle);
      if (index !== -1) {
        this.particles.splice(index, 1);
      }
    }
  }

  private updateInstanceAttributes(): void {
    const transformAttribute =
      this.instancedGeometry.attributes["instanceTransform"];
    const colorAttribute = this.instancedGeometry.attributes["instanceColor"];

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      transformAttribute.setXYZW(
        i,
        particle.position.x,
        particle.position.y,
        particle.rotation,
        particle.scale,
      );
      colorAttribute.setXYZW(
        i,
        particle.color.r,
        particle.color.g,
        particle.color.b,
        particle.opacity,
      );

      transformAttribute.needsUpdate = true;
      colorAttribute.needsUpdate = true;
    }

    this.instancedGeometry.instanceCount = this.particles.length;
  }

  private lerpArray(factor: number, array: number[]): number {
    const lastIndex = array.length - 1;
    const exactIndex = lastIndex * factor;
    const floorIndex = Math.floor(exactIndex);
    const ceilIndex = Math.min(floorIndex + 1, lastIndex);
    return MathUtils.lerp(
      array[floorIndex],
      array[ceilIndex],
      exactIndex - floorIndex,
    );
  }

  private lerpColorArray(factor: number, array: Color[]): Color {
    const lastIndex = array.length - 1;
    const exactIndex = lastIndex * factor;
    const floorIndex = Math.floor(exactIndex);
    const ceilIndex = Math.min(floorIndex + 1, lastIndex);
    const fromColor = array[floorIndex];
    const toColor = array[ceilIndex];
    return new Color(
      MathUtils.lerp(fromColor.r, toColor.r, exactIndex - floorIndex),
      MathUtils.lerp(fromColor.g, toColor.g, exactIndex - floorIndex),
      MathUtils.lerp(fromColor.b, toColor.b, exactIndex - floorIndex),
    );
  }
}

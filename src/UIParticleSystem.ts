import type { UILayer } from "laymur";
import { UIAnchor } from "laymur";
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

/**
 * Configuration options for spawning a single particle.
 */
export interface UISystemSpawnOptions {
  /**
   * Lifetime of the particle in seconds.
   */
  lifeTime: number;

  /**
   * Initial position of the particle in local space.
   */
  position: Vector2Like;

  /**
   * Initial rotation angle in radians.
   */
  rotation: number;

  /**
   * Initial velocity vector in pixels per second.
   */
  velocity: Vector2Like;

  /**
   * Angular velocity in radians per second.
   */
  angularVelocity: number;

  /**
   * Array of scale values over the particle's lifetime.
   * Values are interpolated linearly between array indices.
   */
  scaleOverTime: number[];

  /**
   * Array of colors over the particle's lifetime.
   * Colors are interpolated linearly between array indices.
   */
  colorOverTime: Color[];

  /**
   * Array of opacity values (0-1) over the particle's lifetime.
   * Values are interpolated linearly between array indices.
   */
  opacityOverTime: number[];
}

/**
 * Internal representation of a particle instance.
 * @internal
 */
interface UIParticle {
  /** Current age of the particle (0-1) */
  lifeTime: number;
  /** Reciprocal of total lifetime for optimization */
  lifeTimeFactor: number;
  /** Current position in local space */
  position: Vector2;
  /** Current rotation angle in radians */
  rotation: number;
  /** Current scale value */
  scale: Vector2;
  /** Scale animation curve */
  scaleOverTime: number[];
  /** Current opacity value */
  opacity: number;
  /** Opacity animation curve */
  opacityOverTime: number[];
  /** Current color */
  color: Color;
  /** Color animation curve */
  colorOverTime: Color[];
  /** Current velocity vector */
  velocity: Vector2;
  /** Angular velocity in radians per second */
  angularVelocity: number;
}

/**
 * Configuration options for UIParticleSystem.
 */
interface UISystemOptions {
  /**
   * Maximum number of particles that can exist simultaneously.
   * Higher values use more memory but allow for more particles.
   * @default 128
   */
  capacity: number;

  /**
   * Gravity force applied to all particles in pixels per second squared.
   * @default {x: 0, y: -1024}
   */
  gravity: Vector2Like;
}

/**
 * Main particle system class that manages and renders UI particles efficiently.
 *
 * This system uses GPU instancing to render many particles with high performance.
 * It handles particle lifecycle, physics simulation, and animated properties.
 * Particles are rendered using a provided texture and can be spawned by emitters
 * or directly through the spawnParticle method.
 *
 * Features:
 * - GPU instanced rendering for performance
 * - Per-particle animation curves for scale, color, and opacity
 * - Physics simulation with gravity and velocity
 * - Automatic particle cleanup when lifetime expires
 *
 * @extends {UIAnchor}
 *
 * @example
 * ```typescript
 * // Create a particle system with a texture
 * const texture = new THREE.TextureLoader().load('particle.png');
 * const particleSystem = new UIParticleSystem(uiLayer, texture, {
 *   capacity: 500,
 *   gravity: { x: 0, y: -500 }
 * });
 *
 * // Create an emitter for the system
 * const emitter = new UIRectangleEmitter(particleSystem, {
 *   infinite: true,
 *   spawnAmount: 100,
 *   playbackDuration: 2
 * });
 *
 * emitter.play();
 * ```
 */
export class UIParticleSystem extends UIAnchor {
  /** Instanced geometry for efficient particle rendering */
  private readonly instancedGeometry: InstancedBufferGeometry;
  /** Material used for particle rendering */
  private readonly material: UIParticleMaterial;
  /** Array of active particles */
  private readonly particles: UIParticle[] = [];
  /** Gravity force applied to particles */
  private readonly gravity = new Vector2(0, -1024);

  /**
   * Creates a new UIParticleSystem instance.
   *
   * @param layer - The UI layer this system belongs to
   * @param texture - The texture to use for particle rendering. The texture dimensions
   *                  determine the size of each particle quad.
   * @param options - Configuration options for the particle system
   * @throws {Error} If the texture has invalid dimensions
   */
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
      "instanceScale",
      new InstancedBufferAttribute(new Float32Array(capacity * 2), 2).setUsage(
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

    super(layer, 0, 0, mesh);
    this.instancedGeometry = instancedGeometry;
    this.material = material;

    if (options.gravity) {
      this.gravity.copy(options.gravity);
    }
  }

  /**
   * Destroys the particle system and releases all resources.
   * This method should be called when the particle system is no longer needed
   * to prevent memory leaks.
   *
   * @override
   */
  public override destroy(): void {
    this.instancedGeometry.dispose();
    this.material.dispose();
    super.destroy();
  }

  /**
   * Spawns a new particle with the specified properties.
   *
   * This method creates a particle and adds it to the system if capacity allows.
   * If elapsedTime is provided, the particle will be pre-simulated by that amount,
   * useful for creating particles that appear to have already been animating.
   *
   * @param options - Configuration for the new particle
   * @param elapsedTime - Optional time in seconds to pre-simulate the particle.
   *                      Useful for spawn bursts that need temporal distribution.
   */
  public spawnParticle(options: UISystemSpawnOptions, elapsedTime = 0): void {
    if (
      this.particles.length >=
      this.instancedGeometry.attributes["instanceTransform"].count
    ) {
      return;
    }

    const particle = {
      lifeTime: 0,
      lifeTimeFactor: 1 / options.lifeTime,
      position: new Vector2(options.position.x, options.position.y),
      rotation: options.rotation,
      scale: new Vector2(options.scaleOverTime[0], options.scaleOverTime[0]),
      scaleOverTime: [...options.scaleOverTime],
      opacity: options.opacityOverTime[0],
      opacityOverTime: [...options.opacityOverTime],
      color: options.colorOverTime[0],
      colorOverTime: [...options.colorOverTime],
      velocity: new Vector2().copy(options.velocity),
      angularVelocity: options.angularVelocity,
    };

    if (elapsedTime === 0 || this.updateParticle(particle, elapsedTime)) {
      this.particles.push(particle);
    }
  }

  /**
   * Updates all particles and renders the system.
   * This method is called automatically by the rendering system.
   *
   * @param renderer - The WebGL renderer
   * @param deltaTime - Time elapsed since last frame in seconds
   * @protected
   * @override
   */
  protected override render(renderer: WebGLRenderer, deltaTime: number): void {
    this.applyTransformations();
    const removedParticles: UIParticle[] = [];

    for (const particle of this.particles) {
      if (!this.updateParticle(particle, deltaTime)) {
        removedParticles.push(particle);
      }
    }

    this.removeParticles(removedParticles);
    this.updateInstanceAttributes();
  }

  /**
   * Updates a single particle's physics and animated properties.
   *
   * @param particle - The particle to update
   * @param deltaTime - Time elapsed since last frame in seconds
   * @returns True if the particle is still alive, false if it should be removed
   * @private
   */
  private updateParticle(particle: UIParticle, deltaTime: number): boolean {
    particle.lifeTime += particle.lifeTimeFactor * deltaTime;

    if (particle.lifeTime > 1) {
      return false;
    }

    particle.velocity.addScaledVector(this.gravity, deltaTime);
    particle.position.addScaledVector(particle.velocity, deltaTime);
    particle.rotation += particle.angularVelocity * deltaTime;
    const scale = this.lerpArray(particle.lifeTime, particle.scaleOverTime);
    particle.scale.x = scale;
    particle.scale.y = scale;
    particle.opacity = this.lerpArray(
      particle.lifeTime,
      particle.opacityOverTime,
    );
    particle.color = this.lerpColorArray(
      particle.lifeTime,
      particle.colorOverTime,
    );

    return true;
  }

  /**
   * Removes dead particles from the active particle array.
   *
   * @param particles - Array of particles to remove
   * @private
   */
  private removeParticles(particles: UIParticle[]): void {
    for (const particle of particles) {
      const index = this.particles.indexOf(particle);
      if (index !== -1) {
        this.particles.splice(index, 1);
      }
    }
  }

  /**
   * Updates GPU instance attributes with current particle data.
   * This syncs the particle array state to the GPU for rendering.
   *
   * @private
   */
  private updateInstanceAttributes(): void {
    if (this.particles.length === 0) {
      this.instancedGeometry.instanceCount = 0;
      return;
    }

    const transformAttribute =
      this.instancedGeometry.attributes["instanceTransform"];
    const scaleAttribute = this.instancedGeometry.attributes["instanceScale"];
    const colorAttribute = this.instancedGeometry.attributes["instanceColor"];

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      transformAttribute.setXYZW(
        i,
        particle.position.x,
        particle.position.y,
        this.zIndex,
        particle.rotation,
      );
      scaleAttribute.setXY(i, particle.scale.x, particle.scale.y);
      colorAttribute.setXYZW(
        i,
        particle.color.r,
        particle.color.g,
        particle.color.b,
        particle.opacity,
      );
    }

    transformAttribute.needsUpdate = true;
    scaleAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;

    this.instancedGeometry.instanceCount = this.particles.length;
  }

  /**
   * Linearly interpolates a value from an array based on a normalized factor.
   * Used for animating particle properties over their lifetime.
   *
   * @param factor - Normalized time factor (0-1)
   * @param array - Array of values to interpolate between
   * @returns The interpolated value
   * @private
   */
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

  /**
   * Linearly interpolates a color from an array based on a normalized factor.
   * Used for animating particle colors over their lifetime.
   *
   * @param factor - Normalized time factor (0-1)
   * @param array - Array of colors to interpolate between
   * @returns The interpolated color
   * @private
   */
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

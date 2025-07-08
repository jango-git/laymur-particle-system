import type { UILayer } from "laymur";
import { UIAnchor } from "laymur";
import { Object3D, type WebGLRenderer } from "three";
import type { UIParticleSystem } from "../UIParticleSystem";

/**
 * Abstract base class for particle emitters in the UI particle system.
 *
 * Emitters are responsible for spawning particles with specific patterns and behaviors.
 * They extend UIAnchor to allow positioning within the UI layer hierarchy.
 *
 * @abstract
 * @extends {UIAnchor}
 *
 * @example
 * ```typescript
 * class CustomEmitter extends UIEmitter {
 *   protected spawn(elapsedTime: number): void {
 *     // Custom spawn logic
 *   }
 * }
 * ```
 */
export abstract class UIEmitter extends UIAnchor {
  /**
   * Creates a new UIEmitter instance.
   *
   * @param layer - The UI layer this emitter belongs to
   * @param system - The particle system that will manage particles spawned by this emitter
   */
  constructor(
    layer: UILayer,
    protected readonly system: UIParticleSystem,
  ) {
    super(layer, 0, 0, new Object3D());
  }

  protected override render(renderer: WebGLRenderer, deltaTime: number): void {
    this.applyTransformations();
    void renderer;
    void deltaTime;
  }
}

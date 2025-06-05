import type { Blending, Texture } from "three";
import { Color, ShaderMaterial } from "three";

/**
 * Custom shader material for rendering UI particles with instanced rendering.
 *
 * This material extends Three.js ShaderMaterial to provide efficient rendering
 * of many particles using GPU instancing. Each particle instance can have its
 * own transform (position, rotation, scale), color, and opacity.
 *
 * The material uses custom vertex and fragment shaders to:
 * - Apply per-instance transformations in the vertex shader
 * - Blend texture, instance color, and material color in the fragment shader
 * - Support transparency for particle fading effects
 *
 * @extends {ShaderMaterial}
 *
 * @example
 * ```typescript
 * const texture = new THREE.TextureLoader().load('particle.png');
 * const material = new UIParticleMaterial(texture);
 * material.setColor(0xff0000).setOpacity(0.8);
 * ```
 */
export class UIParticleMaterial extends ShaderMaterial {
  /**
   * Creates a new UIParticleMaterial instance.
   *
   * @param texture - The texture to use for particle rendering.
   *                  This texture will be applied to each particle instance.
   */
  constructor(texture: Texture) {
    super({
      uniforms: {
        map: { value: texture },
        color: { value: new Color(1, 1, 1) },
        opacity: { value: 1.0 },
      },
      vertexShader: `
        attribute vec4 instanceTransform;
        attribute vec2 instanceScale;
        attribute vec4 instanceColor;

        varying vec2 vUv;
        varying vec4 vColor;

        void main() {
          vUv = uv;
          vColor = instanceColor;

          float c = cos(instanceTransform.w);
          float s = sin(instanceTransform.w);
          mat2 rotationMatrix = mat2(c, -s, s, c);

          vec2 scaledPosition = position.xy * instanceScale.xy;
          vec2 rotatedPosition = rotationMatrix * scaledPosition;
          vec2 translatedPosition = rotatedPosition + instanceTransform.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(translatedPosition.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform vec3 color;
        uniform float opacity;

        varying vec2 vUv;
        varying vec4 vColor;

        void main() {
          vec4 textureColor = texture2D(map, vUv);
          gl_FragColor = vec4(textureColor.rgb * vColor.rgb * color, textureColor.a * vColor.a * opacity);
          #include <colorspace_fragment>
        }
      `,
      transparent: true,
      lights: false,
      fog: false,
      depthWrite: false,
      depthTest: false,
    });
  }

  /**
   * Gets the current material color as a hexadecimal number.
   * This color is multiplied with the particle texture and instance colors.
   *
   * @returns The color as a hex number (e.g., 0xffffff for white)
   */
  public getColor(): number {
    return this.uniforms.color.value.getHex();
  }

  /**
   * Gets the current material opacity value.
   * This opacity is multiplied with the texture alpha and instance opacity.
   *
   * @returns The opacity value between 0 (transparent) and 1 (opaque)
   */
  public getOpacity(): number {
    return this.uniforms.opacity.value;
  }

  /**
   * Gets the current blending mode used for particle rendering.
   *
   * @returns The Three.js blending mode constant
   */
  public getBlending(): Blending {
    return this.blending;
  }

  /**
   * Sets the material color.
   * This color is multiplied with the particle texture and instance colors.
   *
   * @param color - The color as a hex number (e.g., 0xff0000 for red)
   * @returns This material instance for method chaining
   */
  public setColor(color: number): UIParticleMaterial {
    this.uniforms.color.value.setHex(color);
    this.uniformsNeedUpdate = true;
    return this;
  }

  /**
   * Sets the material opacity.
   * The value is clamped between 0 and 1. This opacity is multiplied
   * with the texture alpha and instance opacity values.
   *
   * @param opacity - The opacity value (0 = transparent, 1 = opaque)
   * @returns This material instance for method chaining
   */
  public setOpacity(opacity: number): UIParticleMaterial {
    this.uniforms.opacity.value = Math.max(0, Math.min(1, opacity));
    this.uniformsNeedUpdate = true;
    return this;
  }

  /**
   * Sets the blending mode for particle rendering.
   * Common modes include NormalBlending, AdditiveBlending, and MultiplyBlending.
   *
   * @param blending - The Three.js blending mode to use
   * @returns This material instance for method chaining
   *
   * @example
   * ```typescript
   * import { AdditiveBlending } from 'three';
   * material.setBlending(AdditiveBlending);
   * ```
   */
  public setBlending(blending: Blending): UIParticleMaterial {
    this.blending = blending;
    return this;
  }
}

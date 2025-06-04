import type { Blending, Texture } from "three";
import { Color, ShaderMaterial } from "three";

export class UIParticleMaterial extends ShaderMaterial {
  constructor(texture: Texture) {
    super({
      vertexShader: `
        attribute vec4 instanceTransform;
        attribute vec4 instanceColor;

        varying vec2 vUv;
        varying vec4 vColor;

        void main() {
          vUv = uv;
          vColor = instanceColor;

          float c = cos(instanceTransform.z);
          float s = sin(instanceTransform.z);
          mat2 rotationMatrix = mat2(c, -s, s, c);

          vec2 rotatedPosition = rotationMatrix * position.xy;
          vec3 scaledPosition = vec3(rotatedPosition, position.z) * instanceTransform.w;
          vec3 translatedPosition = scaledPosition + vec3(instanceTransform.xy, 0.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(translatedPosition, 1.0);
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
      uniforms: {
        map: { value: texture },
        color: { value: new Color(1, 1, 1) },
        opacity: { value: 1.0 },
      },
      transparent: true,
    });
  }

  public getColor(): number {
    return this.uniforms.color.value.getHex();
  }

  public getOpacity(): number {
    return this.uniforms.opacity.value;
  }

  public getBlending(): Blending {
    return this.blending;
  }

  public setColor(color: number): UIParticleMaterial {
    this.uniforms.color.value.setHex(color);
    this.uniformsNeedUpdate = true;
    return this;
  }

  public setOpacity(opacity: number): UIParticleMaterial {
    this.uniforms.opacity.value = Math.max(0, Math.min(1, opacity));
    this.uniformsNeedUpdate = true;
    return this;
  }

  public setBlending(blending: Blending): UIParticleMaterial {
    this.blending = blending;
    return this;
  }
}

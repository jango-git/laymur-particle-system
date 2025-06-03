import type { UILayer } from "laymur";
import { UIElement } from "laymur";
import { Object3D } from "three";
import type { UIParticleSystem } from "../UIParticleSystem";

export abstract class UIEmitter extends UIElement {
  constructor(
    layer: UILayer,
    protected readonly system: UIParticleSystem,
  ) {
    super(layer, new Object3D(), 0, 0, 1, 1);
  }
}

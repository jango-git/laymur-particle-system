import type { UILayer } from "laymur";
import { UIAnchor } from "laymur";
import type { UIParticleSystem } from "../UIParticleSystem";

export abstract class UIEmitter extends UIAnchor {
  constructor(
    layer: UILayer,
    protected readonly system: UIParticleSystem,
  ) {
    super(layer, 0, 0);
  }
}

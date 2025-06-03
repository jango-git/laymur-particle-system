import type { Vector2Like } from "three";

export interface UIRange {
  min: number;
  max: number;
}

export interface UIRangeVector {
  min: Vector2Like;
  max: Vector2Like;
}

export interface UIRangeRadial {
  powerMin: number;
  powerMax: number;
  angleMin: number;
  angleMax: number;
}

export interface UIRangeColor {
  rMin: number;
  rMax: number;
  gMin: number;
  gMax: number;
  bMin: number;
  bMax: number;
}

export function isVector2Like(value: unknown): value is Vector2Like {
  return (
    value !== null &&
    typeof value === "object" &&
    "x" in value &&
    typeof value.x === "number" &&
    "y" in value &&
    typeof value.y === "number"
  );
}

export function isUIRange(value: unknown): value is UIRange {
  return (
    value !== null &&
    typeof value === "object" &&
    "min" in value &&
    typeof value.min === "number" &&
    "max" in value &&
    typeof value.max === "number"
  );
}

export function isUIRangeVector2(value: unknown): value is UIRangeVector {
  return (
    value !== null &&
    typeof value === "object" &&
    "min" in value &&
    isVector2Like(value.min) &&
    "max" in value &&
    isVector2Like(value.max)
  );
}

export function isUIRangeRadial(value: unknown): value is UIRangeRadial {
  return (
    value !== null &&
    typeof value === "object" &&
    "powerMin" in value &&
    typeof value.powerMin === "number" &&
    "powerMax" in value &&
    typeof value.powerMax === "number" &&
    "angleMin" in value &&
    typeof value.angleMin === "number" &&
    "angleMax" in value &&
    typeof value.angleMax === "number"
  );
}

export function isUIRangeColor(value: unknown): value is UIRangeColor {
  return (
    value !== null &&
    typeof value === "object" &&
    "rMin" in value &&
    typeof value.rMin === "number" &&
    "rMax" in value &&
    typeof value.rMax === "number" &&
    "gMin" in value &&
    typeof value.gMin === "number" &&
    "gMax" in value &&
    typeof value.gMax === "number" &&
    "bMin" in value &&
    typeof value.bMin === "number" &&
    "bMax" in value &&
    typeof value.bMax === "number"
  );
}

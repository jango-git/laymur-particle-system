import type { Vector2Like } from "three";

/**
 * Represents a numeric range with minimum and maximum values.
 * Used for randomizing particle properties within specified bounds.
 *
 * @example
 * ```typescript
 * const lifeTimeRange: UIRange = { min: 1, max: 3 };
 * const randomLifeTime = MathUtils.randFloat(lifeTimeRange.min, lifeTimeRange.max);
 * ```
 */
export interface UIRange {
  /**
   * The minimum value of the range (inclusive).
   */
  min: number;

  /**
   * The maximum value of the range (inclusive).
   */
  max: number;
}

/**
 * Represents a 2D vector range with minimum and maximum vector values.
 * Used for randomizing 2D properties like position within rectangular bounds.
 *
 * @example
 * ```typescript
 * const positionRange: UIRangeVector = {
 *   min: { x: -50, y: -50 },
 *   max: { x: 50, y: 50 }
 * };
 * ```
 */
export interface UIRangeVector {
  /**
   * The minimum vector values (inclusive).
   */
  min: Vector2Like;

  /**
   * The maximum vector values (inclusive).
   */
  max: Vector2Like;
}

/**
 * Represents a radial range using polar coordinates.
 * Used for randomizing directional properties like velocity with
 * both magnitude (power) and direction (angle) variation.
 *
 * @example
 * ```typescript
 * const velocityRange: UIRangeRadial = {
 *   powerMin: 100,
 *   powerMax: 200,
 *   angleMin: -45,
 *   angleMax: 45
 * };
 * ```
 */
export interface UIRangeRadial {
  /**
   * The minimum magnitude/power value (inclusive).
   */
  powerMin: number;

  /**
   * The maximum magnitude/power value (inclusive).
   */
  powerMax: number;

  /**
   * The minimum angle in degrees (inclusive).
   */
  angleMin: number;

  /**
   * The maximum angle in degrees (inclusive).
   */
  angleMax: number;
}

/**
 * Represents a color range with minimum and maximum values for RGB components.
 * Each component should be in the range [0, 1].
 * Used for randomizing particle colors with per-component variation.
 *
 * @example
 * ```typescript
 * const colorRange: UIRangeColor = {
 *   rMin: 0.8, rMax: 1.0,  // Red varies from 80% to 100%
 *   gMin: 0.0, gMax: 0.2,  // Green varies from 0% to 20%
 *   bMin: 0.0, bMax: 0.1   // Blue varies from 0% to 10%
 * };
 * ```
 */
export interface UIRangeColor {
  /**
   * The minimum red component value (0-1, inclusive).
   */
  rMin: number;

  /**
   * The maximum red component value (0-1, inclusive).
   */
  rMax: number;

  /**
   * The minimum green component value (0-1, inclusive).
   */
  gMin: number;

  /**
   * The maximum green component value (0-1, inclusive).
   */
  gMax: number;

  /**
   * The minimum blue component value (0-1, inclusive).
   */
  bMin: number;

  /**
   * The maximum blue component value (0-1, inclusive).
   */
  bMax: number;
}

/**
 * Type guard to check if a value conforms to the Vector2Like interface.
 *
 * @param value - The value to check
 * @returns True if the value has numeric x and y properties
 *
 * @example
 * ```typescript
 * const maybeVector: unknown = { x: 10, y: 20 };
 * if (isVector2Like(maybeVector)) {
 *   // TypeScript now knows maybeVector has x and y properties
 *   console.log(maybeVector.x, maybeVector.y);
 * }
 * ```
 */
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

/**
 * Type guard to check if a value is a UIRange object.
 *
 * @param value - The value to check
 * @returns True if the value has numeric min and max properties
 *
 * @example
 * ```typescript
 * const config: unknown = { min: 0, max: 100 };
 * if (isUIRange(config)) {
 *   const randomValue = MathUtils.randFloat(config.min, config.max);
 * }
 * ```
 */
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

/**
 * Type guard to check if a value is a UIRangeVector object.
 *
 * @param value - The value to check
 * @returns True if the value has min and max properties that are Vector2Like
 *
 * @example
 * ```typescript
 * const positionConfig: unknown = {
 *   min: { x: -50, y: -50 },
 *   max: { x: 50, y: 50 }
 * };
 * if (isUIRangeVector2(positionConfig)) {
 *   // TypeScript knows positionConfig is UIRangeVector
 * }
 * ```
 */
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

/**
 * Type guard to check if a value is a UIRangeRadial object.
 *
 * @param value - The value to check
 * @returns True if the value has all required radial range properties
 *
 * @example
 * ```typescript
 * const velocityConfig: unknown = {
 *   powerMin: 100, powerMax: 200,
 *   angleMin: -45, angleMax: 45
 * };
 * if (isUIRangeRadial(velocityConfig)) {
 *   // TypeScript knows velocityConfig is UIRangeRadial
 * }
 * ```
 */
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

/**
 * Type guard to check if a value is a UIRangeColor object.
 *
 * @param value - The value to check
 * @returns True if the value has all required RGB range properties
 *
 * @example
 * ```typescript
 * const colorConfig: unknown = {
 *   rMin: 0.8, rMax: 1.0,
 *   gMin: 0.0, gMax: 0.2,
 *   bMin: 0.0, bMax: 0.1
 * };
 * if (isUIRangeColor(colorConfig)) {
 *   // TypeScript knows colorConfig is UIRangeColor
 * }
 * ```
 */
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

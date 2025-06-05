/**
 * @module laymur-particle-system
 *
 * A GPU-accelerated particle system for the Laymur UI framework.
 *
 * This module provides a high-performance particle system designed specifically
 * for UI layers in web applications. It leverages Three.js and GPU instancing
 * to render thousands of particles efficiently while maintaining smooth performance.
 *
 * ## Key Features
 *
 * - **GPU Instanced Rendering**: Efficiently renders many particles with minimal draw calls
 * - **Flexible Emitters**: Various emitter types for different particle patterns
 * - **Animated Properties**: Particles support animated scale, color, and opacity over lifetime
 * - **Physics Simulation**: Built-in gravity and velocity for realistic particle movement
 * - **UI Integration**: Seamlessly integrates with the Laymur UI layer system
 *
 * ## Basic Usage
 *
 * ```typescript
 * import { UIParticleSystem, UIRectangleEmitter } from 'laymur-particle-system';
 * import { UILayer } from 'laymur';
 * import * as THREE from 'three';
 *
 * // Create a UI layer
 * const uiLayer = new UILayer();
 *
 * // Load a particle texture
 * const texture = new THREE.TextureLoader().load('particle.png');
 *
 * // Create the particle system
 * const particleSystem = new UIParticleSystem(uiLayer, texture, {
 *   capacity: 500,
 *   gravity: { x: 0, y: -500 }
 * });
 *
 * // Create an emitter
 * const emitter = new UIRectangleEmitter(
 *   particleSystem,
 *   {
 *     infinite: true,
 *     spawnAmount: 100,
 *     playbackDuration: 2,
 *     playsByDefault: true
 *   },
 *   {
 *     lifeTime: { min: 1, max: 3 },
 *     position: { min: { x: -50, y: -50 }, max: { x: 50, y: 50 } },
 *     velocity: { powerMin: 100, powerMax: 200, angleMin: -45, angleMax: 45 },
 *     colorOverTime: [0xff0000, 0xffff00, 0x0000ff],
 *     opacityOverTime: [0, 1, 0]
 *   }
 * );
 *
 * // Position the emitter
 * emitter.x = 400;
 * emitter.y = 300;
 * ```
 *
 * ## Architecture
 *
 * The particle system is built with a modular architecture:
 *
 * - **UIParticleSystem**: Core system that manages particle lifecycle and rendering
 * - **UIEmitter**: Abstract base class for particle spawning patterns
 * - **UIParticleMaterial**: Custom shader material for efficient particle rendering
 * - **UIRange**: Type definitions for randomizable particle properties
 *
 * ## Performance Considerations
 *
 * - Set appropriate capacity limits based on target hardware
 * - Use texture atlases for multiple particle types
 * - Consider using simpler animation curves for better performance
 * - Pre-warm emitters off-screen when needed
 *
 * @packageDocumentation
 */

export * from "./Emitters/UIEmitter";
export * from "./Emitters/UIRectangleEmitter";
export * from "./Emitters/UIUniformInTimeEmitter";
export * from "./UIParticleMaterial";
export * from "./UIParticleSystem";
export * from "./UIRange";

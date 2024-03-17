/*
 * Copyright (c) 2023-2024. Selldone® Business OS™
 *
 * Author: M.Pajuhaan
 * Web: https://selldone.com
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
 * From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
 * Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
 * Our journey is not just about reaching a destination, but about creating a masterpiece.
 * Tread carefully, for you're treading on dreams.
 */

import ParticleManager from "./particle-manager";
import Canvas from "./canvas";

/**
 * A class to drawing confetti onto a canvas.
 */
export default class Confetti {
  private killed: boolean = false;
  private framesSinceDrop: number = 0;
  private canvas: Canvas | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private W: number = 0;
  private H: number = 0;
  private particleManager: ParticleManager | null = null;
  private particlesPerFrame: number = 0; // max particles dropped per frame
  private wind: number = 0;
  private windSpeed: number = 1;
  private windSpeedMax: number = 1;
  private windChange: number = 0.01;
  private windPosCoef: number = 0.002;
  private animationId: number | null = null;

  /**
   * Initialise.
   */
  constructor() {
    this.setDefaults();
  }

  /**
   * Initialize default.
   */
  private setDefaults(): void {
    this.killed = false;
    this.framesSinceDrop = 0;
    this.canvas = null;
    this.canvasEl = null;
    this.W = 0;
    this.H = 0;
    this.particleManager = null;
    this.particlesPerFrame = 0; // max particles dropped per frame
    this.wind = 0;
    this.windSpeed = 1;
    this.windSpeedMax = 1;
    this.windChange = 0.01;
    this.windPosCoef = 0.002;
    this.animationId = null;
  }

  private getParticleOptions(opts: any): any {
    const options = {
      canvas: this.canvas,
      W: this.W,
      H: this.H,
      wind: this.wind,
      windPosCoef: this.windPosCoef,
      windSpeedMax: this.windSpeedMax,
      count: 0,
    };

    Object.assign(options, opts);

    return options;
  }

  /**
   * Create the confetti particles.
   * @param {Object} opts
   *   The particle options.
   */
  private createParticles(opts: any = {}): void {
    const particleOpts = this.getParticleOptions(opts);
    this.particleManager = new ParticleManager(particleOpts);
  }

  /**
   * Get a canvas element from the given options.
   * @param {Object} opts
   *   The particle options.
   */
  private getCanvasElementFromOptions(opts: any): HTMLCanvasElement | null {
    const { canvasId, canvasElement } = opts;
    let canvasEl = canvasElement;

    if (canvasElement && !(canvasElement instanceof HTMLCanvasElement)) {
      throw new Error(
        "Invalid options: canvasElement is not a valid HTMLCanvasElement",
      );
    }

    if (canvasId && canvasElement) {
      throw new Error(
        "Invalid options: canvasId and canvasElement are mutually exclusive",
      );
    }

    if (canvasId && !canvasEl) {
      canvasEl = document.getElementById(canvasId);
    }

    if (canvasId && !(canvasEl instanceof HTMLCanvasElement)) {
      throw new Error(
        `Invalid options: element with id "${canvasId}" is not a valid HTMLCanvasElement`,
      );
    }

    return canvasEl;
  }

  /**
   * Start dropping confetti.
   * @param {Object} opts
   *   The particle options.
   */
  public start(opts: any = {}): void {
    this.remove(); // clear any previous settings

    const canvasEl = this.getCanvasElementFromOptions(opts);

    this.canvas = new Canvas(canvasEl!);
    this.canvasEl = canvasEl;

    this.createParticles(opts);
    this.setGlobalOptions(opts);
    this.animationId = requestAnimationFrame(this.mainLoop.bind(this));
  }

  /**
   * Set the global options.
   */
  private setGlobalOptions(opts: any): void {
    this.particlesPerFrame = opts.particlesPerFrame || 2;
    this.windSpeedMax = opts.windSpeedMax || 1;
  }

  /**
   * Stop dropping confetti.
   */
  public stop(): void {
    this.killed = true;
    this.particlesPerFrame = 0;
  }

  /**
   * Update the confetti options.
   */
  public update(opts: any): void {
    const canvasEl = this.getCanvasElementFromOptions(opts);

    // Restart if a different canvas is given
    if (this.canvas && canvasEl !== this.canvasEl) {
      this.start(opts);
      return;
    }

    this.setGlobalOptions(opts);

    if (this.particleManager) {
      this.particleManager.particleOptions = this.getParticleOptions(opts);
      this.particleManager.refresh();
    }
  }

  /**
   * Remove confetti.
   */
  public remove(): void {
    this.stop();

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.canvas) {
      this.canvas.clear();
    }

    this.setDefaults();
  }

  /**
   * Run the main animation loop.
   */
  private mainLoop(time: number): void {
    this.canvas?.updateDimensions();
    this.canvas?.clear();

    this.windSpeed = Math.sin(time / 8000) * this.windSpeedMax;
    this.wind = this.particleManager!.particleOptions.wind += this.windChange; // eslint-disable-line

    let numberToAdd = this.framesSinceDrop * this.particlesPerFrame;

    while (numberToAdd >= 1) {
      this.particleManager?.add();
      numberToAdd -= 1;
      this.framesSinceDrop = 0;
    }

    this.particleManager?.update();
    this.particleManager?.draw();

    // Stop calling if no particles left in view (i.e. it's been stopped)
    if (!this.killed || this.particleManager?.items.length) {
      this.animationId = requestAnimationFrame(this.mainLoop.bind(this));
    }

    this.framesSinceDrop += 1;
  }
}

/*
 * Copyright (c) 2023. Selldone® Business OS™
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

import getRandomNumber from "@components/ui/confetti/utils/get-random-number";

export namespace confetti{
  export interface ParticleOptions {
    color?: string;
    size?: number;
    dropRate?: number;
  }

  export interface SetupOptions {
    canvas: HTMLCanvasElementWithCtx; // Assuming canvas is an HTMLCanvasElement for drawing
    wind: number;
    windPosCoef: number;
    windSpeedMax: number;
    count: number;
  }



  /**
   * Extends HTMLCanvasElement to include 'ctx' as CanvasRenderingContext2D.
   */
  export interface HTMLCanvasElementWithCtx extends HTMLCanvasElement {
    ctx: CanvasRenderingContext2D;
  }
}

/**
 * Represents a particle that can be drawn on a canvas.
 */
export default class BaseParticle {
  color: string;
  size: number;
  dropRate: number;
  canvas: confetti.HTMLCanvasElementWithCtx;
  wind: number;
  windPosCoef: number;
  windSpeedMax: number;
  x: number;
  y: number;
  d: number; // density
  particleSize: number;
  tilt: number;
  tiltAngleIncremental: number;
  tiltAngle: number;
  angle: number;
  count: number;
  remove: boolean;

  /**
   * Initializes a new instance of the BaseParticle class.
   * @param options The particle options including color, size, and drop rate.
   */
  constructor({
    color = "blue",
    size = 10,
    dropRate = 10,
  }: confetti.ParticleOptions = {}) {
    this.color = color;
    this.size = size;
    this.dropRate = dropRate;

    // Initialize properties that will be set in setup method
    this.canvas = {} as confetti.HTMLCanvasElementWithCtx;
    this.wind = 0;
    this.windPosCoef = 0;
    this.windSpeedMax = 0;
    this.x = 0;
    this.y = 0;
    this.d = 0;
    this.particleSize = 0;
    this.tilt = 0;
    this.tiltAngleIncremental = 0;
    this.tiltAngle = 0;
    this.angle = 0;
    this.count = 0;
    this.remove = false;
  }

  /**
   * Sets up the particle with specific dynamics and position.
   * @param opts The setup options including canvas and wind-related properties.
   * @returns The instance of the particle for chaining.
   */
  setup({
    canvas,
    wind,
    windPosCoef,
    windSpeedMax,
    count,
  }: confetti.SetupOptions): this {
    this.canvas = canvas;
    this.wind = wind;
    this.windPosCoef = windPosCoef;
    this.windSpeedMax = windSpeedMax;
    this.x = getRandomNumber(-35, canvas.width + 35);
    this.y = getRandomNumber(-30, -35);
    this.d = getRandomNumber(150) + 10; // density
    this.particleSize = getRandomNumber(this.size, this.size * 2);
    this.tilt = getRandomNumber(10);
    this.tiltAngleIncremental =
      (getRandomNumber(0, 0.08) + 0.04) * (getRandomNumber() < 0.5 ? -1 : 1);
    this.tiltAngle = 0;
    this.angle = getRandomNumber(Math.PI * 2);
    this.count = count + 1;
    this.remove = false;
    return this;
  }

  /**
   * Updates the particle's position and dynamics based on environmental factors.
   */
  update(): void {
    this.tiltAngle +=
      this.tiltAngleIncremental *
      (Math.cos(this.wind + (this.d + this.x + this.y) * this.windPosCoef) *
        0.2 +
        1);
    this.y += (Math.cos(this.angle + this.d) + Number(this.dropRate)) / 2;

    this.x +=
      (Math.sin(this.angle) +
        Math.cos(this.wind + (this.d + this.x + this.y) * this.windPosCoef)) *
      this.windSpeedMax;
    this.y +=
      Math.sin(this.wind + (this.d + this.x + this.y) * this.windPosCoef) *
      this.windSpeedMax;
    this.tilt = Math.sin(this.tiltAngle - this.count / 3) * 15;
  }

  /**
   * Determines if the particle is past the bottom of the canvas.
   * @returns True if the particle is below the canvas; otherwise, false.
   */
  pastBottom(): boolean {
    return this.y > this.canvas.height;
  }

  /**
   * Draws the particle on the canvas.
   */
  draw(): void {
    if (this.canvas.ctx) {
      this.canvas.ctx.fillStyle = this.color;
      this.canvas.ctx.beginPath();
      this.canvas.ctx.setTransform(
        Math.cos(this.tiltAngle), // set the x axis to the tilt angle
        Math.sin(this.tiltAngle),
        0,
        1,
        this.x,
        this.y, // set the origin
      );
      // Additional drawing logic needed here to actually render the particle
    }
  }

  /**
   * Marks the particle for removal after it has left the screen.
   */
  kill(): void {
    this.remove = true;
  }
}

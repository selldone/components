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
import BaseParticle, { confetti } from "./base";

/**
 * Class representing an image particle.
 */
export default class ImageParticle extends BaseParticle {
  imgEl: HTMLImageElement;

  /**
   * Initialise
   * @param opts
   *  Options passed to the base particle.
   * @param imgEl
   *  An image element to pass through to ctx.drawImage.
   */
  constructor(opts: confetti.ParticleOptions, imgEl: HTMLImageElement) {
    super(opts);

    this.imgEl = imgEl;
  }

  /**
   * Draw the particle.
   */
  draw() {
    super.draw();
    if (this.canvas instanceof HTMLCanvasElement && this.canvas.ctx) {
      this.canvas.ctx.drawImage(
        this.imgEl,
        0,
        0,
        this.particleSize,
        this.particleSize,
      );
    }
  }
}

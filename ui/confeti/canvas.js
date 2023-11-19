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

/**
 * Class to generate and interact with an HTML canvas.
 */
export default class Canvas {
  /**
   * Initialise.
   * @param {HTMLCanvasElement} [canvasElement]
   *   An optional HTMLCanvasElement to override the default.
   */
  constructor(canvasElement) {
    const defaultCanvasId = 'confetti-canvas';

    if (canvasElement && !(canvasElement instanceof HTMLCanvasElement)) {
      throw new Error('Element is not a valid HTMLCanvasElement');
    }

    this.isDefault = !canvasElement;

    this.canvas = canvasElement || Canvas.createDefaultCanvas(defaultCanvasId);

    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * Add a fixed, full-screen canvas to the page.
   * @returns {HTMLCanvasElement}
   *   A full-screen canvas.
   */
  static createDefaultCanvas(id) {
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.position = 'fixed';
    canvas.style.pointerEvents = 'none';
    canvas.style.top = 0;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.id = id;
    document.querySelector('body').appendChild(canvas);
    return canvas;
  }

  /**
   * Get the canvas width.
   * @returns {Number}
   *   The canvas width.
   */
  get width() {
    return this.canvas.width;
  }

  /**
   * Get the canvas height.
   * @returns {Number}
   *   The canvas height.
   */
  get height() {
    return this.canvas.height;
  }

  /**
   * Clear the canvas.
   */
  clear() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Update the canvas dimensions, if necessary.
   */
  updateDimensions() {
    if (!this.isDefault) {
      return;
    }

    if (this.width !== window.innerWidth || this.height !== window.innerHeight) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }
}

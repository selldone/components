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
import CircleParticle from "@components/ui/confetti/particles/circle";
import RectParticle from "@components/ui/confetti/particles/rect";
import HeartParticle from "@components/ui/confetti/particles/heart";
import ImageParticle from "@components/ui/confetti/particles/image";

/**
 * A factory for creating particles with various shapes and properties.
 */
export default class ParticleFactory {
  private cachedImages: { [key: string]: HTMLImageElement };

  /**
   * Initialise the factory.
   */
  constructor() {
    this.cachedImages = {};
  }

  /**
   * Create an image element from the given source.
   * @param {string} imgSource
   *   The path to the image.
   * @returns {HTMLImageElement}
   *   The created image element.
   */
  private createImageElement(imgSource: string): HTMLImageElement {
    const imgEl = document.createElement("img");
    imgEl.setAttribute("src", imgSource);
    return imgEl;
  }

  /**
   * Get an image element from a source string.
   * @param {string} imgSource
   *   The path to the image.
   * @returns {HTMLImageElement}
   *   The retrieved image element.
   */
  private getImageElement(imgSource: string): HTMLImageElement {
    if (!this.cachedImages[imgSource]) {
      this.cachedImages[imgSource] = this.createImageElement(imgSource);
    }
    return this.cachedImages[imgSource];
  }

  /**
   * Get a random particle from the list of available particles.
   * @param {Object} options
   *   The particle options.
   * @returns {Object}
   *   A random particle.
   */
  private getRandomParticle(options: any = {}): any {
    const particles = options.particles || [];

    if (particles.length < 1) {
      return {};
    }

    return particles[Math.floor(Math.random() * particles.length)];
  }

  /**
   * Get the particle defaults.
   * @param {Object} options
   *   The particle options.
   * @returns {Object}
   *   The default particle options.
   */
  private getDefaults(options: any = {}): any {
    return {
      type: options.defaultType || "circle",
      size: options.defaultSize || 10,
      dropRate: options.defaultDropRate || 10,
      colors: options.defaultColors || [
        "DodgerBlue",
        "OliveDrab",
        "Gold",
        "pink",
        "SlateBlue",
        "lightblue",
        "Violet",
        "PaleGreen",
        "SteelBlue",
        "SandyBrown",
        "Chocolate",
        "Crimson",
      ],
      url: null,
    };
  }

  /**
   * Create a particle.
   * @param {Object} options
   *   The particle options.
   * @returns {CircleParticle | RectParticle | HeartParticle | ImageParticle}
   *   The created particle.
   */
  public create(
    options: any,
  ): CircleParticle | RectParticle | HeartParticle | ImageParticle {
    const defaults = this.getDefaults(options);
    const particle = this.getRandomParticle(options);

    const opts = Object.assign(defaults, particle);

    // Set a random color from the array
    const colorIndex = getRandomNumber(0, opts.colors.length - 1, true);
    opts.color = opts.colors[colorIndex];

    if (opts.type === "circle") {
      return new CircleParticle(opts);
    }

    if (opts.type === "rect") {
      return new RectParticle(opts);
    }

    if (opts.type === "heart") {
      return new HeartParticle(opts);
    }

    if (opts.type === "image") {
      return new ImageParticle(opts, this.getImageElement(opts.url));
    }

    throw Error(`Unknown particle type: "${opts.type}"`);
  }
}

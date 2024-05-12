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

import ParticleFactory from "../../ui/confetti/factories/particle";
import {confetti} from "./particles/base.ts";

/**
 * A particle generation and management service.
 */
export default class ParticleManager {
  items: any[];
  pool: any[];
  particleOptions: confetti.SetupOptions;
  particleFactory: ParticleFactory;

  /**
   * Initialise.
   * @param {object} particleOptions
   *   The particle options.
   */
  constructor(particleOptions: confetti.SetupOptions) {
    this.items = [];
    this.pool = [];
    this.particleOptions = particleOptions;
    this.particleFactory = new ParticleFactory();
  }

  /**
   * Update the position of each particle.
   *
   * Moves particles back to the pool if past the bottom and not due for removal.
   */
  public update(): void {
    const oldItems: any[] = [];
    const newItems: any[] = [];

    this.items.forEach((particle) => {
      particle.update();

      if (particle.pastBottom()) {
        if (!particle.remove) {
          particle.setup(this.particleOptions);
          oldItems.push(particle);
        }
      } else {
        newItems.push(particle);
      }
    });

    this.pool.push(...oldItems);

    this.items = newItems;
  }

  /**
   * Draw the particles currently in view.
   */
  public draw(): void {
    this.items.forEach((item) => item.draw());
  }

  /**
   * Add an item to the view.
   */
  public add(): void {
    if (this.pool.length > 0) {
      this.items.push(this.pool.pop().setup(this.particleOptions));
    } else {
      this.items.push(
        this.particleFactory
          .create(this.particleOptions)
          .setup(this.particleOptions),
      );
    }
  }

  /**
   * Replace particles once they have left the screen.
   */
  public refresh(): void {
    this.items.forEach((item) => {
      item.kill();
    });

    this.pool = [];
  }
}

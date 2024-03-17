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
 * Return a random number.
 * @param min The minimum number (default 1).
 * @param max The maximum number (default min + 1).
 * @param round True to round the number to the nearest integer, false otherwise.
 * @return A random number between min and max.
 */
export default (
  min: number = 1,
  max?: number,
  round: boolean = false,
): number => {
  if (max === undefined) {
    max = min + 1;
  }
  const minN: number = parseFloat(min.toString());
  const maxN: number = parseFloat(max.toString());
  const n: number = Math.random() * (maxN - minN) + minN;
  return round ? Math.round(n) : n;
};

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
 * @param {Number} [min]
 *   The minimum number (default 1).
 * @param {Number} [max]
 *   The maximum number (default min + 1).
 * @param {boolean} round
 *   True to round the number to the nearest integer, false otherwise.
 * @return {Number}
 *   A random number between min and max.
 */
export default (min = 1, max = min + 1, round = false) => {
  const minN = parseFloat(min);
  const maxN = parseFloat(max);
  const n = Math.random() * (maxN - minN) + minN;
  return round ? Math.round(n) : n;
};

// @ts-nocheck
/*
 * Copyright (c) 2024. Selldone® Business OS™
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
export const getYoutubeId = (url:string, opts = { fuzzy: true }) => {
  if (/youtu\.?be/.test(url)) {
    const patterns = [
      /youtu\.be\/([^#\&\?]{11})/, // youtu.be/<id>
      /\?v=([^#\&\?]{11})/, // ?v=<id>
      /\&v=([^#\&\?]{11})/, // &v=<id>
      /embed\/([^#\&\?]{11})/, // embed/<id>
      /\/v\/([^#\&\?]{11})/, // /v/<id>
    ];

    for (let i = 0; i < patterns.length; ++i) {
      if (patterns[i].test(url)) {
        return patterns[i].exec(url)[1];
      }
    }

    if (opts.fuzzy) {
      const tokens = url.split(/[\/\&\?=#\.\s]/g);
      for (let i = 0; i < tokens.length; ++i) {
        if (/^[^#\&\?]{11}$/.test(tokens[i])) {
          return tokens[i];
        }
      }
    }
  }

  return null;
};

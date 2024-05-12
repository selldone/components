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

export default {
  //  <!--  ---------------------- Section > Product ---------------------- -->

  product: {
    type: "product",
    image: null,
    span: "",
    title: "",
    message: "",
    bg_color: "transparent",
  },
  // <!--  ---------------------- Section > Image ---------------------- -->
  image: {
    type: "image",
    bg_color: "transparent",

    title: "",
    span: "",
    image: null,
    message: "",
    image_max_width: "200px",
  },

  //<!--  ---------------------- Section > Two Columns ---------------------- -->
  "two-columns": {
    type: "two-columns",
    bg_color: "transparent",

    s1: {
      title: null,
      image: null,
      html: "",
    },
    s2: {
      title: null,
      image: null,
      html: "",
    },
  },

  // <!--  ---------------------- Section > Text ---------------------- -->
  text: {
    type: "text",
    class: "",
    title: "",
    text: "",
    bg_color: "transparent",
  },
};

// @ts-nocheck
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

import {delay} from "lodash-es";

/**
 *
 * @mixin UMixinConfetti
 */
export const UMixinConfetti = {
  methods: {
    //――――――――――――――――――――――  Confetti  ――――――――――――――――――――
    // 🎊 🎊 🎊 🎊 🎊 🎊 🎊 🎊 🎊 🎊 🎊 🎊 🎊 🎊 🎊
    ShowConfetti(
      duration = 3000,
      type: "purple" | "love" | "blue" | null = null,
      canvasElement = null,
    ) {
      if (!this.$confetti) return;

      let config: Record<string, any> = {
        defaultDropRate: 5,
        defaultSize: 5,
      };

      if (type === "love") {
        config = {
          canvasElement: canvasElement,

          particles: [
            {
              type: "heart",
              colors: ["red", "pink"],
              size: 15,
              dropRate: 12,
            },
            {
              type: "circle",
              colors: ["#ba0000"],
              dropRate: 10,
            },
          ],
          defaultDropRate: 5,
          defaultSize: 5,
        };
      } else if (type === "blue") {
        config = {
          canvasElement: canvasElement,
          particles: [
            {
              type: "rect",
              dropRate: 7,
            },

            {
              type: "heart",
              colors: ["#12628d", "#1a83bb"],
              size: 15,
              dropRate: 12,
            },
            {
              type: "circle",
              colors: ["#1a83bb"],
              dropRate: 10,
            },
          ],
          defaultDropRate: 5,
          defaultSize: 5,
        };
      } else if (type === "purple") {
        config = {
          canvasElement: canvasElement,
          particles: [
            {
              type: "rect",
              dropRate: 7,
            },

            {
              type: "heart",
              colors: ["#673AB7", "#D32F2F", "#7B1FA2", "#C2185B"],
              size: 15,
              dropRate: 18,
            },
            {
              type: "circle",
              colors: ["#512DA8"],
              dropRate: 10,
            },
          ],
          defaultDropRate: 5,
          defaultSize: 5,
        };
      }

      this.$confetti.start(config);

      delay(() => {
        this.$confetti.stop();
      }, duration);
    },
  },
};

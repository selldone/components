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

import Confetti from "./confetti";
import { App, Plugin } from "vue";
export { Confetti };

const ConfettiPlugin: Plugin = {
  install(app: App, options?: any) {
    // Check if plugin has already been installed
    if (this.installed) {
      return;
    }
    this.installed = true;

    // Create a new Confetti instance
    const confettiInstance = new Confetti(options);

    // Provide the instance to all components
    app.config.globalProperties.$confetti = confettiInstance; // 🌴 Add to global properties
  },
};

export default ConfettiPlugin;

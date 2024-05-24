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

export class SBusinessProfileBreadcrumbsHelper {
  static GeneratePageHierarchy(root_name: string, page_name: string) {
    const out = [];

    out.push({
      id: -1,

      text: root_name,
      icon: "home",
      disabled: false,
      to: {
        name: window.$storefront.routes.SHOP_PAGE,
      },
      href: "#",
    });

    out.push({
      id: -2,
      text: page_name,
      disabled: true,
      href: "#",
    });

    return out;
  }
}

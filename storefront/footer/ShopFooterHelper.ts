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

import { Router } from "vue-router";

export class ShopFooterHelper {
  /**
   * Fix the footer menu items.
   * Make sure that the route exists. If not, redirect to home.
   * @param footer
   * @param router
   * @constructor
   */
  static GetMenuItems(footer: { menu: { items: any[] } }, router: Router) {
    const out: any = footer?.menu ? footer.menu : [[], [], [], []];
    while (out.length < 4) {
      out.push([]);
    }
    out.forEach((items: any) => {
      return items.forEach((item: any) => {
        // Check if route exists
        if (
          router &&
          item.to &&
          item.to.name &&
          !router.hasRoute(item.to.name)
        ) {
          console.log(
            `━━━━━━▶ ❌ Error in route name! [${item.to.name}] not exist on the shop route. So the link in the footer will be redirected to home. ━━━━━━`,
            item,
          );
          item.to = { path: "/" };
        }
        return item;
      });
    });

    return out;
  }
}

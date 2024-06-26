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

import { XapiUser } from "@selldone/sdk-storefront";
import { ApplicationExecutorStorefront } from "@selldone/core-js";
import { Shop } from "@selldone/core-js/models/shop/shop.model.ts";

declare global {
  interface Window {}

  const Android: {
    passShop: (shop: string) => void;
    passUser: (user: string) => void;
  }; // IF the app open in the webview in the Android app
}
export {};

/**
 * Calls the Android native interface with Shop data.
 * Also triggers an event for the shop application to listen to shop changes.
 *
 * @param shop - The Shop data.
 */
export function NativeInterfaceShop(shop: Shop): void {
  try {
    if (typeof Android !== "undefined" && Android !== null) {
      Android.passShop(JSON.stringify(shop));
    }
  } catch (e) {
    console.error(e);
  }

  // To pass to shop apps listen to shop change:
  ApplicationExecutorStorefront.TriggerEvent(
    ApplicationExecutorStorefront.EventsName.ChangeShop,
    shop,
  );
}

/**
 * Calls the Android native interface with User data.
 * Also triggers an event for the shop application to listen to user changes.
 *
 * @param user - The User data.
 */
export function NativeInterfaceUser(
  user: XapiUser.IMeServerResponse | null,
): void {
  try {
    if (typeof Android !== "undefined" && Android !== null) {
      Android.passUser(JSON.stringify(user));
    }
  } catch (e) {
    console.error(e);
  }

  // To pass to shop apps listen to user change:
  ApplicationExecutorStorefront.TriggerEvent(
    ApplicationExecutorStorefront.EventsName.ChangeUser,
    user,
  );
}

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


import {ShopLicense} from "@selldone/core-js/enums/shop/ShopLicense.ts";

function useCurrentOriginForCompiledAsset(icon: string) {
  try {
    const url = new URL(icon);
    const pathSegments = url.pathname.split("/");
    const appSegment = pathSegments.indexOf("app");
    const versionSegment = pathSegments[appSegment + 1];
    const isCompiledAsset =
      appSegment >= 0 &&
      typeof versionSegment === "string" &&
      versionSegment.length > 0 &&
      !versionSegment.startsWith("@") &&
      pathSegments[appSegment + 2] === "assets" &&
      Boolean(pathSegments[appSegment + 3]);

    if (
      (url.protocol === "http:" || url.protocol === "https:") &&
      isCompiledAsset
    ) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    // Relative paths and malformed URLs must stay exactly as provided.
  }

  return icon;
}

const LicenseMixin = {

  methods: {
    getShopLicenseObject(license: keyof typeof ShopLicense) {
      return ShopLicense[license];
    },
    getShopLicenseName(license: keyof typeof ShopLicense) {
      const _license = ShopLicense[license];
      return _license ? this.$t(_license.name) : this.$t("global.error");
    },

    getShopLicenseIcon(license: keyof typeof ShopLicense) {
      const _license = ShopLicense[license];
      return _license ? useCurrentOriginForCompiledAsset(_license.icon) : null;
    },

  },
};

export default LicenseMixin;

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



const DomainMixin = {

  methods: {

    //――――――――――――――――――――――――― Home Image Helper ―――――――――――――――――――――――――
    GetDomainHomeIcon: function (home: string) {
      return home === "shop"
          ? require("@selldone/components-vue/assets/icons/store.svg")
          : home === "avocado"
              ? require("@selldone/components-vue/assets/icons/avocado.svg")
              : home === "blog"
                  ? require("@selldone/components-vue/assets/icons/blog.svg")
                  : home === "hyper"
                      ? require("@selldone/components-vue/assets/icons/hyper.svg")
                      : home === "community"
                          ? require("@selldone/components-vue/assets/icons/community.png")
                          : home === "map"
                              ? require("@selldone/components-vue/assets/icons/map-tag.svg")
                              : ("" + home).startsWith("/")
                                  ? require("@selldone/components-vue/assets/icons/static-pages.svg")
                                  : home
                                      ? require("@selldone/components-vue/assets/icons/landing-page.svg")
                                      : require("@selldone/components-vue/assets/icons/store.svg");
    },


    GetDomainHomeName(home: string) {
      return home === "shop"
          ? this.$t("global.commons.shop")
          : home === "avocado"
              ? this.$t("global.commons.avocado")
              : home === "blog"
                  ? this.$t("global.commons.blog")
                  : home === "hyper"
                      ? this.$t("global.commons.hyper")
                      : home === "community"
                          ? this.$t("global.commons.community")
                          : home === "map"
                              ? this.$t("global.commons.map")
                              : ("" + home).startsWith("/")
                                  ? this.$t("global.commons.static_page")
                                  : home
                                      ? this.$t("global.commons.landing_page")
                                      : this.$t("global.commons.store");
    },


  },
};

export default DomainMixin;

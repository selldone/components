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

import type {gapi} from "@selldone/core-js/gapi/requests/gapi.countries.get.ts";
import {debounce} from "lodash-es";
import {Vue} from "vue/types/vue";

export class CountriesResourceHelper {
  //―――――――――――――――――――――― Get Countries List ――――――――――――――――――――
  static FetchCountries(
    vue: Vue,
    callback?: (countries: gapi.countries.get.ICountry[]) => void,
  ) {
    const fun = debounce((callback = null) => {
      const countries = vue.$store.getters.getCountries;
      if (countries && countries.length) {
        if (callback) callback(countries);
      }
      console.log("⏺ Fetch countries...");

      window.$selldone.gapi.fetchCountries().then((countries) => {
        vue.$store.commit("setCountries", countries);
        if (callback) callback(countries);
      });
    }, 1000);

    fun(callback);
  }
}

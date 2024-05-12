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

interface IValuationStructureItemType {
  title: string; // Assuming title is always a string translated by this.$t
  value: string | null; // value can be a string or null based on the provided data
  icon: string; // icon is a string representing font-awesome classes
  valuation?: boolean; // valuation is optional and a boolean
}

export const ValuationStructureItemType: IValuationStructureItemType[] = [
  {
    title: window.$i18n_global.t("global.form_builder.types.simple"),
    value: null,
    icon: "fa:fas fa-paragraph",
  },
  {
    title: window.$i18n_global.t("global.form_builder.types.selective"),
    value: "select",
    icon: "fa:fas fa-list-ul",
    valuation: true,
  },
  {
    title: window.$i18n_global.t("global.form_builder.types.switch"),
    value: "switch",
    icon: "fa:fas fa-toggle-on",
    valuation: true,
  },
  {
    title: window.$i18n_global.t("global.form_builder.types.number"),
    value: "number",
    icon: "fa:fas fa-hashtag",
    valuation: true,
  },
];

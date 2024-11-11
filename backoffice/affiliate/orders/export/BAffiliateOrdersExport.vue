<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="widget-box">
    <h2>Export orders</h2>
    <v-list-subheader></v-list-subheader>

    <u-date-input
      v-model="start"
      :label="$t('global.commons.start_date')"
      :placeholder="$t('global.placeholders.select_date')"
      clearable
      date-only
      return-utc
    />

    <u-date-input
      v-model="end"
      :disabled="!start"
      :label="$t('global.commons.end_date')"
      :min="start"
      :placeholder="$t('global.commons.now')"
      clearable
      date-only
      return-utc
    />

    <s-export-format-select
      :csv="csv"
      :excel="excel"
      :pdf="pdf"
      dense
      type="Affiliate orders"
    >
    </s-export-format-select>
  </div>
</template>
<script lang="ts">
import UDateInput from "../../../../ui/date/input/UDateInput.vue";
import SExportFormatSelect from "../../../../ui/file/export-format-select/SExportFormatSelect.vue";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";

export default {
  name: "BAffiliateOrdersExport",
  components: {
    SExportFormatSelect,
    UDateInput,
  },

  props: {
    shop: {
      require: true,
      type: Object,
    },

    affiliate: {
      require: true,
      type: Object,
    },
  },
  data() {
    return {
      start: new Date().addDays(-7),
      end: new Date(),
    };
  },
  computed: {
    excel() {
      return this.getExportUrl("excel");
    },
    csv() {
      return this.getExportUrl("csv");
    },
    pdf() {
      return this.getExportUrl("pdf");
    },
  },

  watch: {},

  mounted() {},
  created() {},

  methods: {
    getExportUrl(render) {
      return (
        window.API.GET_EXPORT_AFFILIATE_ORDERS(
          this.shop.id,
          this.affiliate.id,
          render,
        ) +
        `?start=${DateConverter.dateToString(this.start)}` +
        (this.end ? `&end=${DateConverter.dateToString(this.end)}` : "")
      );
    },
  },
};
</script>

<style lang="scss" scoped></style>

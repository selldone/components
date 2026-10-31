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
  <div class="sd-modern-widget b-affiliate-orders-export text-start">
    <h2 class="sd-modern-title-text">
      {{ $t("affiliate_workspace.orders.export") }}
    </h2>
    <p class="sd-modern-subtitle">
      {{ $t("exporter.sections.affiliate_scope") }}
    </p>

    <div class="b-affiliate-orders-export__dates">
      <u-date-input
        v-model="start"
        class="sd-modern-underlined-field"
        variant="underlined"
        :label="$t('global.commons.start_date')"
        :placeholder="$t('global.placeholders.select_date')"
        clearable
        date-only
        return-utc
      />

      <u-date-input
        v-model="end"
        class="sd-modern-underlined-field"
        variant="underlined"
        :disabled="!start"
        :label="$t('global.commons.end_date')"
        :min="start"
        :placeholder="$t('global.commons.now')"
        clearable
        date-only
        return-utc
      />
    </div>

    <s-export-format-select
      modern
      :csv="csv"
      :excel="excel"
      :pdf="pdf"
      dense
      :type="$t('affiliate_workspace.orders.title')"
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

<style lang="scss" scoped>
.b-affiliate-orders-export {
  padding: 24px;
  border-radius: 20px;

  .sd-modern-title-text {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
  }
  .sd-modern-subtitle {
    margin-block-start: 4px;
    font-size: 13px;
    line-height: 1.6;
  }
  &__dates {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    margin-block: 20px;
  }
  .s--export-format-select--modern {
    margin-inline: -24px;
    margin-block-end: -24px;
  }
  @media (max-width: 600px) {
    padding: 20px;

    &__dates {
      grid-template-columns: minmax(0, 1fr);
    }
    .s--export-format-select--modern {
      margin-inline: -20px;
      margin-block-end: -20px;
    }
  }
}
</style>

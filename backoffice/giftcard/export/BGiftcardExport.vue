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

<template>
  <s-widget-box class="sd-modern-widget b-giftcard-export text-start">
    <header class="sd-modern-title b-giftcard-export__header">
      <v-icon class="sd-modern-icon--plain" size="20" aria-hidden="true"
        >file_download</v-icon
      >
      <h2 class="sd-modern-title-text">
        {{ $t("gift_card.dashboard.export.title") }}
      </h2>
    </header>
    <section class="b-giftcard-export__group">
      <h3 class="b-giftcard-export__subtitle">
        <v-icon size="18" aria-hidden="true">credit_card</v-icon>
        {{ $t("gift_card.dashboard.export.cards_list") }}
      </h3>

      <s-export-format-select
        modern
        :csv="
          window.API.GET_EXPORT_GIFT_CARDS(
            $route.params.shop_id,
            giftCardType.id,
            'csv',
          )
        "
        :excel="
          window.API.GET_EXPORT_GIFT_CARDS(
            $route.params.shop_id,
            giftCardType.id,
            'excel',
          )
        "
        :type="$t('global.commons.giftcard')"
        :csv-message="$t('exporter.sections.gift_cards_scope')"
        dense
        :excel-message="$t('exporter.sections.gift_cards_scope')"
      >
      </s-export-format-select>
    </section>

    <section class="b-giftcard-export__group">
      <h3 class="b-giftcard-export__subtitle">
        <v-icon size="18" aria-hidden="true">query_stats</v-icon>
        {{ $t("gift_card.dashboard.export.get_report") }}
      </h3>
      <s-export-format-select
        modern
        :csv="
          window.API.GET_EXPORT_GIFT_CARDS_DATA(
            $route.params.shop_id,
            giftCardType.id,
            'csv',
          )
        "
        :excel="
          window.API.GET_EXPORT_GIFT_CARDS_DATA(
            $route.params.shop_id,
            giftCardType.id,
            'excel',
          )
        "
        :type="$t('global.commons.report')"
        :csv-message="$t('exporter.sections.gift_report_scope')"
        dense
        :excel-message="$t('exporter.sections.gift_report_scope')"
      >
      </s-export-format-select>
    </section>
  </s-widget-box>
</template>

<script lang="ts">
import SWidgetBox from "../../../ui/widget/box/SWidgetBox.vue";
import SExportFormatSelect from "../../../ui/file/export-format-select/SExportFormatSelect.vue";

export default {
  name: "BGiftcardExport",
  components: { SExportFormatSelect, SWidgetBox },
  props: {
    giftCardType: {
      required: true,
      type: Object,
    },
  },

  data: () => ({}),

  computed: {},

  created() {},
  mounted() {},
  beforeUnmount() {},
};
</script>

<style lang="scss" scoped>
.b-giftcard-export {
  border-radius: 20px;
  letter-spacing: 0;

  &.sd-modern-widget {
    padding: 24px;
  }
  :deep(.widget-body) {
    margin: 0;
  }
  .s--export-format-select--modern {
    margin-inline: -24px;
  }
  &__group:last-child .s--export-format-select--modern {
    margin-block-end: -24px;
  }

  &__header {
    gap: 10px;
    align-items: center;
  }
  .sd-modern-title-text {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
  }
  &__group {
    margin-block-start: 24px;

    + .b-giftcard-export__group {
      padding-block-start: 24px;
      border-block-start: 1px solid var(--sd-modern-border);
    }
  }
  &__subtitle {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;

    .v-icon {
      color: var(--sd-modern-muted);
    }
  }
  @media (max-width: 600px) {
    &.sd-modern-widget {
      padding: 20px;
    }
    .s--export-format-select--modern {
      margin-inline: -20px;
    }
    &__group:last-child .s--export-format-select--modern {
      margin-block-end: -20px;
    }
  }
}
</style>

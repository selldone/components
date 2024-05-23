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
  <s-widget-box
    :title="`<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mx-sm' style='font-size: 6px;'></span> ${$t(
      'gift_card.dashboard.export.title',
    )}   <span class='fw-normal mx-xs small'> </span>  </h5>`"
    icon="fa:fas fa-cloud-download-alt"
  >
    <h3 class="mt-3">
      <v-icon class="me-1" color="#111">credit_card</v-icon>

      {{ $t("gift_card.dashboard.export.cards_list") }}
    </h3>

    <s-export-format-select
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
      csv-message="Download list of gift cards in CSV format. It contains all the details of the gift cards."
      dense
      excel-message="Download list of gift cards in Excel format. It contains all the details of the gift cards."
    >
    </s-export-format-select>

    <h3 class="mt-3">
      <v-icon class="me-1" color="#111">query_stats</v-icon>
      {{ $t("gift_card.dashboard.export.get_report") }}
    </h3>
    <s-export-format-select
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
      csv-message="Download report of gift cards in CSV format."
      dense
      excel-message="Download report of gift cards in Excel format."
    >
    </s-export-format-select>
  </s-widget-box>
</template>

<script>
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

<style lang="scss" scoped></style>

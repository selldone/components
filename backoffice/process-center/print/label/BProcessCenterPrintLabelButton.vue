<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <u-button-circle
    @click="dialog = true"
    :tooltip="$t('process_center.menu.label')"
    adjust-for-font-awesome
    icon="fa:fas fa-receipt"
  />

  <v-bottom-sheet
    v-model="dialog"
    max-width="98vw"
    width="640"
    content-class="rounded-t-xl"
  >
    <v-card class="text-start" rounded="t-xl">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">fa:fas fa-receipt</v-icon>
        {{ $t("process_center.menu.label") }}

        <v-spacer></v-spacer>

        <b-order-button :order="basket" vew-only class="pen"></b-order-button>
      </v-card-title>

      <v-list class="border-between-vertical pb-8" lines="two">
        <v-list-item
          subtitle="Appropriate for A5 size labels or any other similar 4:3 or 16:9 aspect ratio labels."
          prepend-icon="crop_16_9"
          append-icon="download"
          :href="
            window.API.GET_ORDERS_PDF(
              $shop.id,
              basket.id,
              OrderExportPDFType.LABEL,
              'pdf',
              null,
            )
          "
          class="hover-up"
          target="_blank"
        >
          <template v-slot:title>
            <b>A5</b>
          </template>
        </v-list-item>
        <v-list-item
          subtitle="Appropriate for 15cm x 15cm , 6in x 6in , 20cm x 20cm"
          append-icon="download"
          prepend-icon="crop_square"
          :href="
            window.API.GET_ORDERS_PDF(
              $shop.id,
              basket.id,
              OrderExportPDFType.LABEL,
              'pdf',
              'square',
            )
          "
          class="hover-up"
          target="_blank"
        >
          <template v-slot:title>
            <b>Square</b>
          </template>
        </v-list-item>
      </v-list>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="dialog = false"
            prepend-icon="close"
          >
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { OrderExportPdfType } from "@selldone/core-js/enums/order/OrderExportPdfType.ts";
import BOrderButton from "@selldone/components-vue/backoffice/order/button/BOrderButton.vue";

export default defineComponent({
  name: "BProcessCenterPrintLabelButton",
  components: { BOrderButton },
  inject: ["$shop"],
  props: {
    basket: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      OrderExportPDFType: OrderExportPdfType,

      dialog: false,
    };
  },
});
</script>

<style scoped lang="scss"></style>

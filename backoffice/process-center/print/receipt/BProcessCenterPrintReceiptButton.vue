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
    :tooltip="$t('process_center.menu.receipt')"
    adjust-for-font-awesome
    icon="fa:fas fa-scroll"
  />

  <v-bottom-sheet
    v-model="dialog"
    max-width="98vw"
    width="640"
    content-class="rounded-t-xl"
  >
    <v-card class="text-start" rounded="t-xl">
      <v-card-title></v-card-title>

      <v-list class="border-between-vertical pb-8" lines="two">
        <v-list-item
          title="Normal Receipt"
          subtitle="Features enhanced graphical elements for intuitive comprehension."
          prepend-icon="receipt"
          append-icon="download"
          :href="
            window.API.GET_ORDERS_PDF(
              $shop.id,
              basket.id,
              OrderExportPDFType.RECEIPT,
              'pdf',
            )
          "
          class="row-hover"
          target="_blank"
        ></v-list-item>
        <v-list-item
          subtitle="It's mostly text-based and suitable for printing."
          append-icon="download"
          prepend-icon="receipt_long"
          :href="
            window.API.GET_ORDERS_PDF(
              $shop.id,
              basket.id,
              OrderExportPDFType.RECEIPT,
              'standard',
            )
          "
          class="row-hover"
          target="_blank"
        >
          <template v-slot:title>
            Standard Receipt
            <v-chip size="x-small" class="ma-1" label>English</v-chip>
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
import {OrderExportPdfType} from "@selldone/core-js/enums/order/OrderExportPdfType.ts";

export default defineComponent({
  name: "BProcessCenterPrintReceiptButton",
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

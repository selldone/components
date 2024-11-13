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
  <v-btn
    v-bind="$attrs"
    class="me-5 flex-grow-0"
    icon
    tile
    variant="text"
    @click="show_qr = true"
    ><img src="@selldone/components-vue/assets/icons/qr-code.svg" width="32" />
    <v-tooltip activator="parent" location="bottom"> Barcode</v-tooltip>
  </v-btn>

  <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Dialog > QR Code ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
  <v-dialog
    v-model="show_qr"
    :dark="!light_qr"
    content-class="no-shadow-dialog"
    max-width="530"
  >
    <v-card
      :style="`border-radius: ${qr_size / 5}px ${qr_size / 2}px ${
        qr_size / 10
      }px ${qr_size / 2}px;padding:${qr_size / 10}px;${
        light_qr
          ? 'background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);'
          : 'background-image: linear-gradient(60deg, #3a2c41 0%, #261b2d 100%);'
      }`"
      class="dialog-shadow"
    >
      <div>
        <u-qrcode
          v-if="qrcode_value"
          :options="{
            width: qr_size,
            color: { dark: light_qr ? '#222' : '#fff', light: '#FFFFFF00' },
          }"
          :value="qrcode_value"
        />
        <v-btn
          class="hover-scale-small"
          icon
          variant="text"
          style="position: absolute; top: 10%; left: 10%"
          @click="show_qr = false"
        >
          <v-icon color="#989898">close</v-icon>
        </v-btn>

        <v-avatar class="center-absolute" size="38">
          <v-img v-if="$product.icon" :src="getShopImagePath($product.icon)" />
        </v-avatar>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ShopURLs } from "@selldone/core-js/helper";

export default defineComponent({
  name: "SProductQr",
  inject: ["$shop", "$product"],

  data: () => ({
    show_qr: false,
    light_qr: true,
  }),
  computed: {
    qrcode_value() {
      if (!this.$product) return null;
      return `${ShopURLs.MainShopUrl(this.$shop)}/product/${this.$product.id}`;
    },
    qr_size() {
      return window.innerWidth > 480 ? 400 : window.innerWidth * 0.8;
    },
  },
});
</script>

<style scoped lang="scss"></style>

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
  <v-row v-bind="$attrs" class="s--footer-section-contact">
    <v-col
      v-if="address"
      class="border-end-grater-md"
      cols="12"
      md="6"
    >
      <p class="info-title">
        <i class="fas fa-map-marked-alt mx-2" />
        {{ $t("footer.address") }}
      </p>
      <p class="info-value mx-2">
        {{ address }}

        <v-btn
          v-if="location"
          :title="$t('footer.map')"
          class="ms-2 hover-scale-small"
          icon
          size="small"
          variant="text"
          @click="show_map = !show_map"
        >
          <v-icon> near_me</v-icon>
        </v-btn>
      </p>
    </v-col>

    <v-col
      v-if="phone"
      class="border-end-grater-md px-2"
      cols="12"
      md="3"
    >
      <p class="info-title">
        <i class="fas fa-phone mx-2" />
        {{ $t("footer.phone") }}

      </p>
      <p class="info-value mx-2">
        {{ phone }}
      </p>
    </v-col>

    <v-col v-if="email" cols="12" md="3">
      <p class="info-title">
        <i class="fas fa-envelope mx-2" />

        {{ $t("footer.email") }}

      </p>
      <p class="info-value mx-2">
        {{ email }}
      </p>
    </v-col>
  </v-row>

  <v-dialog
    v-if="location"
    v-model="show_map"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-card>
      <!-- MAP -->
      <u-map-view
        :center="location"
        :delay-load="1000"
        :marker-position="location"
        :pin-image="require('../../../../assets/icons/bags.svg')"
        :radius="18"
        :zoom="16"
        style="position: absolute; left: 0; top: 0; right: 0; bottom: 0"
      >
      </u-map-view>
      <div class="widget-buttons absolute-bottom-center w-100">
        <v-btn
          prepend-icon="close"
          size="x-large"
          variant="flat"
          @click="show_map = false"
        >
          {{ $t("global.actions.close") }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import UMapView from "@selldone/components-vue/ui/map/view/UMapView.vue";

export default defineComponent({
  name: "SFooterSectionContact",
  components: { UMapView },
  inject: ["$shop"],
  data: () => ({
    show_map: false,
  }),
  computed: {
    shopInfo() {
      if (!this.$shop) return {};
      return this.$shop.info ? this.$shop.info : {};
    },

    address() {
      return this.shopInfo.address;
    },
    phone() {
      if (this.shopInfo.phone && this.shopInfo.phone.length <= 14)
        return this.shopInfo.phone.replace(/\D+/g, ""); // simple phone number show
      return this.shopInfo.phone;
    },
    email() {
      return this.shopInfo.email;
    },

    location() {
      if (
        !this.$shop.info ||
        !this.$shop.info.location ||
        !this.$shop.info.location.lat ||
        !this.$shop.info.location.lng
      )
        return null;
      return this.$shop.info.location;
    },
  },
});
</script>

<style scoped lang="scss">

.s--footer-section-contact{
  --border-color: #bbb;
  --border-style: dashed;
}

.info-title {
  margin: 8px 0 0 0;
  text-align: start;
  padding: 0 10px;
  opacity: 0.8;
}
.info-value {
  text-align: start;
  padding: 0 10px;
  margin-bottom: 8px;
  font-weight: 500;
  unicode-bidi: plaintext;
}



</style>

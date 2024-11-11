<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <div class="widget-box mb-5">
    <u-widget-header
      icon="add_to_drive"
      title="Google Drive™"
    ></u-widget-header>

    <v-list-subheader>
      You have the option to link your shop with your Google Drive. This will
      automatically generate a new file named "Selldone-Products" where your
      products will be listed. Moreover, any changes you make to the Price,
      Discount, or Quantity in your Google Drive will be directly reflected in
      your shop's products.
    </v-list-subheader>

    <v-img
      :aspect-ratio="1528 / 830"
      :src="
        require('../../../product/advanced-options/google-sheet/assets/google-drive.png')
      "
      class="rounded-lg"
    ></v-img>

    <div v-if="service_google_sheet" class="my-5">
      <u-text-value-dashed v-if="service_google_sheet.user_id">
        <template v-slot:label>Added by</template>
        <v-avatar class="avatar-gradient -thin -user" size="2.6em">
          <img :src="getUserAvatar(service_google_sheet.user_id)" />
        </v-avatar>
      </u-text-value-dashed>

      <u-text-value-dashed v-if="service_google_sheet.created_at">
        <template v-slot:label>Connect date</template>
        {{ getLocalDateString(service_google_sheet.created_at) }}
      </u-text-value-dashed>

      <u-text-value-dashed v-if="service_google_sheet.error">
        <template v-slot:label>Error</template>
        {{ service_google_sheet.error }}
      </u-text-value-dashed>

      <u-text-value-dashed>
        <template v-slot:label>Last sync date</template>
        {{ getLocalDateString(service_google_sheet.sync_at) }}
        <u-check v-if="syncing" :value="true" class="ms-1"></u-check>
        <v-btn
          v-else
          :loading="busy_sync"
          class="ms-1"
          icon
          title="Manually force update file."
          @click="forceSync"
        >
          <v-icon>cloud_sync</v-icon>
        </v-btn>
      </u-text-value-dashed>

      <u-text-value-dashed v-if="service_google_sheet.products_sheet_id">
        <template v-slot:label>File</template>
        <v-btn
          :href="`https://docs.google.com/spreadsheets/d/${service_google_sheet.products_sheet_id}`"
          class="tnt"
          color="primary"
          target="_blank"
        >
          <img
            class="mx-1"
            height="16"
            src="../../../../assets/trademark/google-drive.svg"
            width="16"
          />

          Open File
          <v-icon class="mx-1" size="small">open_in_new</v-icon>
        </v-btn>
      </u-text-value-dashed>
    </div>

    <div class="widget-buttons">
      <v-btn
        v-if="!service_google_sheet"
        :href="`/shops/${shop.id}/services/google/sheet/authentication/login`"
        :loading="busy"
        class="tnt"
        color="primary"
        size="x-large"
        variant="flat"
        @click="busy = true"
      >
        <v-icon class="me-1">cable</v-icon>
        Connect to

        <img
          class="mx-1"
          height="16"
          src="../../../../assets/trademark/google-drive.svg"
          width="16"
        />
        Google Drive™
      </v-btn>
      <v-btn
        v-else
        :loading="busy"
        class="tnt"
        color="red"
        size="x-large"
        variant="text"
        @click="askRemove()"
      >
        <v-icon class="me-1">mobiledata_off</v-icon>
        Remove connection to Google Drive™
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import UTextValueDashed from "../../../../ui/text/value-dashed/UTextValueDashed.vue";

export default {
  name: "BProductsAdvancedOptionsGoogleSheet",
  components: {
    UTextValueDashed,
  },
  props: {
    shop: {
      required: true,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
  },
  data: () => ({
    verify_articles: false,
    busy_articles: false,
    busy: false,
    busy_sync: false,
    syncing: false,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
    service_google_sheet() {
      return this.shop.service_google_sheet;
    },
  },

  watch: {},

  created() {},

  mounted() {},

  beforeUnmount() {},
  methods: {
    askRemove() {
      this.openDangerAlert(
        "Remove connection",
        "Are you sure remove the google drive link for products?",
        "Yes, Remove it",
        () => {
          this.removeSearchConsole();
        },
      );
    },

    removeSearchConsole() {
      this.busy = true;

      axios
        .delete(window.API.DELETE_GOOGLE_SHEET_CONNECTION(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.shop.service_google_sheet = null;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    forceSync() {
      this.busy_sync = true;

      axios
        .post(window.API.POST_GOOGLE_SHEET_FORCE_SYNC(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.syncing = true;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_sync = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>

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
  <v-list class="border-between-vertical bg-transparent text-start">
    <v-list-item
      v-for="file in files"
      :key="file.id"
      :class="{ 'row-hover': canDownload(file), pen: !canDownload(file) }"
      @click="
        canDownload(file)
          ? file.download_link
            ? window.open(file.download_link, '_blank')
            : getBuyerFileUrl(file)
          : undefined
      "
    >
      <!--    v-bind="file.download_link ? { href: file.download_link } : undefined" -->
      <v-list-item-avatar tile>
        <img :src="getFileExtensionImage(file.name)" />
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title class="subtitle-2 py-1 d-flex align-center">
          <div
            class="flex-grow-1 single-line inline-block font-weight-black"
            :title="file.name"
          >
            {{ file.name }}
          </div>

          <v-chip
            v-if="file.sample"
            label
            small
            color="#009688"
            dark
            class="mx-2"
            style="min-width: 68px"
            >Sample</v-chip
          >
          <v-chip
            v-else
            label
            small
            color="#673AB7"
            dark
            class="mx-2"
            style="min-width: 68px"
            ><v-icon left small>diamond</v-icon> Paid</v-chip
          >
        </v-list-item-title>
        <v-list-item-subtitle>
          <v-btn
            v-if="file.download_link"
            @click.stop="
              copyToClipboard(file.download_link);
              copied_items.add(file.id);
            "
            :color="copied_items.includes(file.id) ? 'green' : 'primary'"
            text
            small
            title="Copy download link."
          >
            <v-icon small class="me-1">{{
              copied_items.includes(file.id) ? "check_circle" : "file_copy"
            }}</v-icon>
            {{ $t("global.commons.download_link") }}</v-btn
          >
        </v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action style="flex-basis: 50px">
        <v-list-item-action-text dir="ltr" class="text-center english-field">
          {{ (file.size * 1024) | numeralFormat("0.[0] b") }}
        </v-list-item-action-text>

        <v-btn
          v-if="canDownload(file)"
          :loading="busy_get_file === file"
          icon
          color="#1976D2"
          title="Download"
          ><v-icon>cloud_download</v-icon></v-btn
        >
      </v-list-item-action>
    </v-list-item>
  </v-list>
</template>

<script>
import { ShopOptionsHelper } from "../../../../../core/helper/shop/ShopOptionsHelper";

export default {
  name: "SShopProductFilesList",

  props: {
    files: {
      required: true,
    },
    basket: {
      // For guest file purchase
      required: false,
    },

    purchased: {
      type: Boolean,
    },
  },

  computed: {},
  watch: {
    files_show(files_show) {
      this.$emit("input", files_show);
    },
    value(value) {
      this.files_show = this.value;
    },
  },

  data: function () {
    return {
      files_show: false,
      busy_get_file: null,

      copied_items: [],
    };
  },

  created() {
    this.files_show = this.value;
  },
  methods: {
    getBuyerFileUrl(file) {
      if (
        !this.USER() &&
        !ShopOptionsHelper.HasGuestCheckout(this.getShop()) /*🥶 Guest*/
      ) {
        return this.NeedLogin();
      }

      this.busy_get_file = file;

      axios
        .get(
          window.XAPI.GENERATE_DOWNLOAD_PRODUCT_FILE_TEMP_URL(
            this.shop_name,
            file.product_id,
            file.id
          ),
          {
            params: {
              code: this.basket?.code /*🥶 Guest*/,
            },
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            let link = document.createElement("a");
            link.download = name;
            link.href = data.url;
            link.click();

            // Add link to file:
            file.download_link = data.url;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_get_file = null;
        });
    },
    canDownload(file) {
      return this.purchased || file.sample;
    },
  },
};
</script>

<style scoped lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-product-files-list{

}


/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-product-files-list{

}
</style>

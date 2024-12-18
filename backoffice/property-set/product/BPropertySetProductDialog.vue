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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- ███████████████████████ Dialog > Add Bulk ███████████████████████ -->
  <v-bottom-sheet
    :model-value="modelValue"
    width="98vw"
    max-width="1200"
    scrollable
    transition="dialog-bottom-transition"
    content-class="rounded-t-xl"
    @update:model-value="(v) => $emit('update:modelValue', v)"
  >
    <v-card rounded="t-xl" class="text-start">
      <v-card-title class="d-flex align-center">
        <u-avatar-folder
          :src="getShopImagePath($product.icon, 128)"
          class="me-2"
          :size="48"
          :border-size="6"
          side-icon="shelves"
        ></u-avatar-folder>
        {{ $t("product_property_set.select_property_set") }}
      </v-card-title>
      <v-card-text>
        <div class="widget-box -large mb-5">
          <u-widget-header
            icon="hive"
            :title="$t('global.commons.property_set')"
            :to="
              IS_VENDOR_PANEL
                ? undefined
                : { name: 'BPageShopLogisticPropertySets' }
            "
            :add-caption="$t('product_property_set.add_property_set')"
            :disabled="IS_VENDOR_PANEL"
            :disabled-reason="$t('product_badges.only_marketplace_owner_msg')"
            add-text
            target="_blank"
          ></u-widget-header>
          <v-list-subheader>
            {{ $t("product_property_set.subtitle") }}
          </v-list-subheader>

          <b-product-property-set-preview
            class="mb-5"
            :property-set="property_set"
          ></b-product-property-set-preview>

          <b-property-set-input
            v-model="property_set"
            return-object
          ></b-property-set-input>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="close"
            prepend-icon="close"
          >
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            :loading="busy"
            color="primary"
            size="x-large"
            @click="saveProductPropertySet()"
            variant="elevated"
            prepend-icon="save"
          >
            {{ $t("global.actions.save_changes") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import BPropertySetInput from "@selldone/components-vue/backoffice/property-set/input/BPropertySetInput.vue";
import BProductPropertySetPreview from "@selldone/components-vue/backoffice/property-set/preview/BProductPropertySetPreview.vue";

export default {
  name: "BPropertySetProductDialog",
  mixins: [],

  inject: ["$shop", "$vendor", "$product"],
  components: {
    BProductPropertySetPreview,
    BPropertySetInput,
    UAvatarFolder,
  },
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
  },
  data() {
    return {
      busy: false,
      property_set: null,
    };
  },

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },

  watch: {
    $product() {
      this.init();
    },
    modelValue() {
      this.init();
    },
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.property_set = this.$product.property_set;
    },
    saveProductPropertySet() {
      this.busy = true;

      let url = null;

      if (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/) {
        url = window.VAPI.PUT_MY_VENDOR_PRODUCT_SET_PROPERTY_SET(
          this.$vendor.id,
          this.$product.id,
        );
      } else {
        url = window.API.PUT_PRODUCT_SET_PROPERTY_SET(
          this.$shop.id,
          this.$product.id,
        );
      }

      axios
        .put(url, {
          property_set_id: this.property_set?.id,
        })
        .then(({ data }) => {
          if (!data.error) {
            Object.assign(this.$product, data.product);
            this.$product.property_set = data.property_set;

            this.$emit("update:product", this.$product);

            this.close();

            NotificationService.showSuccessAlert(
              null,
              "Product property set has been updated successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    close() {
      this.$emit("update:modelValue", false);
    },
  },
};
</script>

<style lang="scss" scoped></style>

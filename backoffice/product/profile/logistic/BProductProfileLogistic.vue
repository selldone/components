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
  <v-list-item
    v-for="profile_type in LogisticProfileType"
    :key="profile_type.value"
    :prepend-icon="profile_type.icon"
    class="row-hover"
    v-bind="$attrs"
    @click="showSetProfile(profile_type, product[profile_type.product_column])"
  >
    <v-list-item-title>
      <b>{{ $t(profile_type.title) }}</b>
    </v-list-item-title>
    <v-list-item-subtitle class="single-line">
      {{ $t(profile_type.desc) }}
    </v-list-item-subtitle>

    <v-tooltip
      activator="parent"
      content-class="text-start bg-black"
      location="end"
      max-width="360"
    >
      {{ $t(profile_type.desc) }}

      <b-product-profile-location-preview
        class="py-2 px-6"
        :title="$t(profile_type.title)"
        :orderKey="getOrderKey(profile_type.value)"
      ></b-product-profile-location-preview>
    </v-tooltip>

    <template v-slot:append>
      <v-list-item-action end>
        <v-btn
          :color="product[profile_type.product_column] ? 'success' : 'primary'"
          icon
          variant="text"
        >
          <v-icon
            >{{
              product[profile_type.product_column] ? "check_box" : "add_box"
            }}
          </v-icon>
        </v-btn>
      </v-list-item-action>
    </template>
  </v-list-item>

  <!-- ██████████████████████ Dialog > Select Logistic profile ██████████████████████ -->

  <v-dialog
    v-model="profile_dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card v-if="selected_profile_type">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1" color="#111">sticky_note_2</v-icon>
        {{ $t("product_logistic_profile.dialog.title") }}
      </v-card-title>
      <v-card-text>
        <div class="widget-box -large mb-5">
          <u-widget-header
            :add-caption="$t('product_logistic_profile.dialog.add_new_action')"
            :disabled="IS_VENDOR_PANEL"
            :disabled-reason="
              $t('product_logistic_profile.dialog.add_new_disable_msg')
            "
            :icon="selected_profile_type.icon"
            :title="$t(selected_profile_type.title)"
            :to="{ name: 'BPageShopLogisticProfiles' }"
            add-text
          >
          </u-widget-header>
          <v-list-subheader
            >{{ $t(selected_profile_type.desc) }}
          </v-list-subheader>
          <v-locale-provider :rtl="false"
            ><!-- Fix Open menu bug in RTL Vuetify 3 -->
            <b-logistic-profile-input
              v-model="profile_input"
              :shop="shop"
              :type="selected_profile_type"
            ></b-logistic-profile-input>
          </v-locale-provider>
        </div>

        <div v-if="articles && profile">
          <b-logistic-profile-editor
            :key="profile.id"
            :articles="articles"
            :profile="profile"
            :shop="shop"
            :editable="!IS_VENDOR_PANEL"
          ></b-logistic-profile-editor>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="profile_dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            color="primary"
            size="x-large"
            variant="elevated"
            @click="selectProfile(profile_input)"
          >
            <v-icon class="me-1">check</v-icon>
            {{ $t("global.actions.confirm") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { defineComponent } from "vue";
import { LogisticProfileType } from "@selldone/core-js/enums/logistic/LogisticProfileType";
import BLogisticProfileInput from "../../../logistic/profile/input/BLogisticProfileInput.vue";
import BLogisticProfileEditor from "../../../product/profile/logistic/BLogisticProfileEditor.vue";
import BProductProfileLocationPreview from "@selldone/components-vue/backoffice/product/profile/location-preview/BProductProfileLocationPreview.vue";
import ProductSection from "@selldone/core-js/enums/product/ProductSection.ts";

export default defineComponent({
  name: "BProductProfileLogistic",
  components: {
    BProductProfileLocationPreview,
    BLogisticProfileEditor,
    BLogisticProfileInput,
  },

  props: {
    product: {
      required: true,
      type: Object,
    },
    shop: {
      required: true,
      type: Object,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
  },
  data: function () {
    return {
      LogisticProfileType: LogisticProfileType,

      selected_profile_type: null,
      profile_dialog: false,
      profile_input: null,

      articles: null,
      profile: null,
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
    profile_input(val) {
      if (val) {
        this.fetchProfile();
      } else {
        this.articles = null;
        this.profile = null;
      }
    },
  },

  methods: {
    // ████████████████████ Logistic Profiles ████████████████████

    showSetProfile(type, id) {
      this.profile_input = id;
      this.selected_profile_type = type;
      this.profile_dialog = true;
    },
    selectProfile(profile_id) {
      if (
        this.selected_profile_type.value === LogisticProfileType.WARRANTY.value
      ) {
        this.product.warranty_id = profile_id;
      } else if (
        this.selected_profile_type.value ===
        LogisticProfileType.RETURN_POLICY.value
      ) {
        this.product.return_policy_id = profile_id;
      } else if (
        this.selected_profile_type.value === LogisticProfileType.GUIDE.value
      ) {
        this.product.guide_id = profile_id;
      } else if (
        this.selected_profile_type.value === LogisticProfileType.SHIPPING.value
      ) {
        this.product.shipping_id = profile_id;
      }

      this.profile_dialog = false;
    },

    fetchProfile() {
      this.busy = true;

      const handleSuccessResponse = ({ profile, articles }) => {
        this.profile = profile;
        this.articles = articles;
      };

      window.$backoffice.logistic.profile
        .cancellation()
        .optimize(120)
        .get(this.shop.id, this.profile_input)
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    getOrderKey(code) {
      if (code === LogisticProfileType.GUIDE.value) return ProductSection.guide.code;
      else if (code === LogisticProfileType.RETURN_POLICY.value)
        return ProductSection.return_policy.code;
      else if (code === LogisticProfileType.SHIPPING.value) return ProductSection.shipping.code;
      else if (code === LogisticProfileType.WARRANTY.value) return ProductSection.warranty.code;
    },
  },
});
</script>

<style lang="scss" scoped></style>

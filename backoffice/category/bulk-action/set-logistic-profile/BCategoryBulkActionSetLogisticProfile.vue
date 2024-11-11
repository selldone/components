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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-card>
    <v-card-title>
      <v-avatar class="me-2" size="36">
        <img v-if="category.icon" :src="getShopImagePath(category.icon, 64)" />
        <v-icon v-else>folder</v-icon>
      </v-avatar>

      {{ category.title }} > Bulk set profile
    </v-card-title>
    <v-card-text>
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Category ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div class="widget-box mb-5">
        <u-widget-header icon="assignment" title="Profile"></u-widget-header>
        <v-list-subheader>
          <ul>
            <li>
              The selected profile will be assigned to all products in the
              category.
            </li>
            <li>
              Products in the <b>sub categories</b> will <b>not be affected</b>.
            </li>
          </ul>
        </v-list-subheader>
        <u-smart-select
          v-model="type"
          :items="profile_types"
          class="my-3"
          item-description="desc"
          item-icon="icon"
          item-text="title"
          item-value="value"
          @change="value = null"
        ></u-smart-select>

        <div class="py-3">
          <v-expand-transition>
            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Tax ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <div v-if="type === 'TAX'">
              <b-tax-profile-input
                v-model="value"
                :shop="shop"
              ></b-tax-profile-input>
            </div>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Tax ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <div v-else-if="type === 'MAP'">
              <b-map-tag-input v-model="value" :shop="shop"></b-map-tag-input>
            </div>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Logistic ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <div v-else-if="type && LogisticProfileType[type]">
              <b-logistic-profile-input
                v-model="value"
                :shop="shop"
                :type="LogisticProfileType[type]"
              ></b-logistic-profile-input>
            </div>
          </v-expand-transition>
        </div>

        <v-expand-transition>
          <div v-if="!value">
            <div
              class="min-height-20vh pa-2 d-flex align-center justify-center text-h4 font-weight-light"
            >
              Clear profile for products!
            </div>
          </div>
        </v-expand-transition>

        <u-smart-verify v-model="check" class="my-3"></u-smart-verify>
      </div>
    </v-card-text>
    <v-card-actions>
      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="$emit('close')">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          :class="{
            disabled: !check,
          }"
          :loading="busy"
          color="primary"
          size="x-large"
          variant="flat"
          @click="assignProfile()"
        >
          <v-icon start>save</v-icon>
          {{
            value ? "Assign profile to products" : "Clear profile from products"
          }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { LogisticProfileType } from "@selldone/core-js/enums/logistic/LogisticProfileType";
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import BTaxProfileInput from "../../../tax/profile/input/BTaxProfileInput.vue";
import BLogisticProfileInput from "../../../logistic/profile/input/BLogisticProfileInput.vue";
import BMapTagInput from "../../../map/tag/input/BMapTagInput.vue";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";

export default {
  name: "BCategoryBulkActionSetLogisticProfile",
  components: {
    USmartVerify,
    BMapTagInput,
    BLogisticProfileInput,
    BTaxProfileInput,
    USmartSelect,
  },
  props: {
    shop: {
      required: true,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
    category: {
      required: true,
    },
  },

  data: () => ({
    LogisticProfileType: LogisticProfileType,

    busy: false,
    type: null,
    value: null,

    check: false,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    profile_types() {
      const out = Object.values(LogisticProfileType);
      out.push({
        value: "TAX",
        title: "Tax",
        desc: "Override default tax behavior by setting tax profile.",
        icon: "gavel",
      });
      out.push({
        value: "MAP",
        title: "Location",
        desc: "You can pin products on the map location by assigning location tags to the products.",
        icon: "map",
      });
      return out;
    },
  },
  watch: {
    category() {
      this.resetToDefault(); // 🞇 Reset to default
    },
  },
  created() {},

  methods: {
    assignProfile() {
      this.busy = true;

      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/ // NOT SUPPORTED FOR VENDOR YET!
            ? window.VAPI.POST_MY_VENDOR_ASSIGN_PROFILE_TO_PRODUCTS_IN_CATEGORY(
                this.vendor.id,
                this.category.id,
              )
            : window.API.POST_ASSIGN_PROFILE_TO_PRODUCTS_IN_CATEGORY(
                this.shop.id,
                this.category.id,
              ),

          {
            type: this.type,
            value: this.value,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("close");
            this.showSuccessAlert(
              null,
              "Bulk profile assignment task completed." +
                (data.message ? data.message : ""),
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

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
      <v-avatar size="36" class="me-2">
        <img v-if="category.icon" :src="getShopImagePath(category.icon, 64)" />
        <v-icon v-else>folder</v-icon>
      </v-avatar>

      {{ category.title }} > Bulk set profile</v-card-title
    >
    <v-card-text>
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Category ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div class="widget-box mb-5">
        <s-widget-header title="Profile" icon="assignment"> </s-widget-header>
        <v-list-subheader
          ><ul>
            <li>
              The selected profile will be assigned to all products in the
              category.
            </li>
            <li>
              Products in the <b>sub categories</b> will <b>not be affected</b>.
            </li>
          </ul></v-list-subheader
        >
        <s-smart-select
          v-model="type"
          :items="profile_types"
          item-value="value"
          item-text="title"
          item-description="desc"
          item-icon="icon"
          @change="value = null"
          class="my-3"
        ></s-smart-select>

        <div class="py-3">
          <v-expand-transition>
            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Tax ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <div v-if="type === 'TAX'">
              <b-tax-profile-input
                :shop="shop"
                v-model="value"
              ></b-tax-profile-input>
            </div>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Tax ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <div v-else-if="type === 'MAP'">
              <b-map-tag-input
                :shop="shop"
                v-model="value"
              ></b-map-tag-input>
            </div>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Logistic ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <div v-else-if="type && LogisticProfileType[type]">
              <b-logistic-profile-input
                :shop="shop"
                v-model="value"
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

        <s-smart-check-verify-action
          v-model="check"
          class="my-3"
        ></s-smart-check-verify-action>
      </div>
    </v-card-text>
    <v-card-actions>
      <div class="widget-buttons">
        <v-btn @click="$emit('close')" text x-large>
          <v-icon class="me-1">close</v-icon>
          {{ $t("global.actions.close") }}</v-btn
        >

        <v-btn
          color="primary"
          depressed
          @click="assignProfile()"
          :loading="busy"
          x-large
          :class="{
            disabled: !check,
          }"
        >
          <v-icon class="me-1">save</v-icon>
          {{
            value ? "Assign profile to products" : "Clear profile from products"
          }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
import { LogisticProfileType } from "@core/enums/logistic/LogisticProfileType";
import SSmartSelect from "@components/smart/SSmartSelect.vue";
import BTaxProfileInput from "@components/backoffice/tax/profile/input/BTaxProfileInput.vue";
import BLogisticProfileInput from "@components/backoffice/logistic/profile/input/BLogisticProfileInput.vue";
import BMapTagInput from "@components/backoffice/map-tag/input/BMapTagInput.vue";
import SSmartCheckVerifyAction from "@components/smart/SSmartCheckVerifyAction.vue";

export default {
  name: "CategoryBulkProductsSetProfile",
  components: {
    SSmartCheckVerifyAction,
    BMapTagInput,
    BLogisticProfileInput,
    BTaxProfileInput,
    SSmartSelect,
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
                this.category.id
              )
            : window.API.POST_ASSIGN_PROFILE_TO_PRODUCTS_IN_CATEGORY(
                this.shop.id,
                this.category.id
              ),

          {
            type: this.type,
            value: this.value,
          }
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("close");
            this.showSuccessAlert(
              null,
              "Bulk profile assignment task completed." +
                (data.message ? data.message : "")
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

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
  <div class="s--shop-billing-address-form">
    <v-btn-toggle
      v-if="!forceShowForm"
      v-model="same_billing"
      @update:model-value="updateValue"
      class="rounded-toggles h-auto mx-auto border"
      selected-class="bg-primary elevation-3"
      rounded="lg"
    >
      <div class="align-center pe-2 ps-1 d-none d-sm-flex">
        <img
          :src="
            dark
              ? require('./assets/receipt-w.svg')
              : require('./assets/receipt.svg')
          "
          width="24"
          height="24"
        />
      </div>
      <v-btn
        :value="true"
        min-height="44"
        rounded="lg"
        :size="$vuetify.display.xs ? 'small' : undefined"
      >
        {{
          no_receiver_address
            ? $t("basket_page.no_billing_title")
            : $t("basket_page.same_billing_address")
        }}
      </v-btn>

      <v-btn
        :value="false"
        min-height="44"
        rounded="lg"
        class="ms-2"
        :size="$vuetify.display.xs ? 'small' : undefined"
      >
        {{ $t("basket_page.custom_billing_info") }}
      </v-btn>
    </v-btn-toggle>

    <div v-if="same_billing" class="small">
      {{
        no_receiver_address
          ? $t("basket_page.no_billing_desc")
          : receiverInfo?.address
            ? MapHelper.GenerateFullAddressFromMapInfo(receiverInfo)
            : $t("basket_page.same_billing_address_desc")
      }}
    </div>
    <div v-else class="small">
      {{ $t("basket_page.custom_billing_info_desc") }}
    </div>

    <v-expand-transition>
      <v-container v-if="!same_billing" fluid>
        <u-smart-switch
          v-model="billing_business"
          :dark="dark"
          :false-description="$t('basket_page.billing_personal_desc')"
          :false-title="$t('global.commons.personal')"
          :true-description="$t('basket_page.billing_business_desc')"
          :true-title="$t('global.commons.business')"
          class="mb-6"
          false-icon="person"
          true-icon="business"
          @change="updateValue"
          border
        >
        </u-smart-switch>

        <v-expand-transition>
          <div v-if="billing_business">
            <v-text-field
              v-model="billing_tax_id"
              :label="$t('global.commons.tax_id')"
              @change="updateValue"
              variant="outlined"
              class="mt-3"
            ></v-text-field>
          </div>
        </v-expand-transition>

        <v-text-field
          v-model="billing_name"
          :label="$t('global.address_info.name')"
          :placeholder="$t('global.placeholders.name')"
          persistent-placeholder
          variant="outlined"
          @change="updateValue"
          class="mt-3"
        ></v-text-field>

        <s-country-select
          v-model="billing_country"
          :errorMessages="
            !billing_country
              ? $t('basket_page.errors.select_billing_country')
              : ''
          "
          :label="$t('global.address_info.country')"
          :placeholder="$t('global.placeholders.select_a_country')"
          persistent-placeholder
          :loading="busy_regions"
          variant="outlined"
          item-value="alpha2"
          required
          @change="updateValue()"
          class="mt-3"
        ></s-country-select>

        <v-select
          v-if="tax_regions && tax_regions.length"
          v-model="billing_state"
          :errorMessages="
            !billing_state ? $t('basket_page.errors.select_billing_state') : ''
          "
          :items="tax_regions"
          :label="$t('global.address_info.state')"
          variant="outlined"
          required
          @update:model-value="updateValue"
          class="mt-3"
        >
        </v-select>

        <v-text-field
          v-model="billing_address"
          :label="$t('global.address_info.address')"
          :placeholder="$t('global.placeholders.address')"
          persistent-placeholder
          variant="outlined"
          @change="updateValue"
          class="mt-3"
        ></v-text-field>
      </v-container>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import SCountrySelect from "../../../ui/country/select/SCountrySelect.vue";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import { MapHelper } from "@selldone/core-js/helper/map/MapHelper";

export default {
  name: "SShopBillingAddressForm",
  components: { USmartSwitch, SCountrySelect },
  emits: ["update:modelValue", "change"],
  props: {
    modelValue: {},
    receiverInfo: {},
    dark: {
      default: false,
      type: Boolean,
    },
    forceShowForm: {
      // When receiverInfo not available!
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    MapHelper: MapHelper,

    same_billing: true,
    billing_business: false,
    billing_name: null,
    billing_country: null,
    billing_state: null,
    billing_state_code: null,
    billing_address: null,
    billing_tax_id: null,

    tax_regions: [],
    last_country_regions: null,
    busy_regions: false,
  }),

  watch: {
    billing_country() {
      this.getTaxRegionsOfCountry();
    },

    same_billing() {
      this.loadValue();
    },
  },

  computed: {
    billing() {
      return {
        name: !this.same_billing ? this.billing_name : this.receiverInfo?.name,
        country: !this.same_billing
          ? this.billing_country
          : this.receiverInfo?.country,
        state: !this.same_billing
          ? this.billing_state
          : this.receiverInfo?.state,

        state_code: !this.same_billing
          ? this.billing_state_code
          : this.receiverInfo?.state_code,

        address: !this.same_billing
          ? this.billing_address
          : this.receiverInfo?.address,
        business: !this.same_billing ? this.billing_business : false,
        custom: !this.same_billing,

        tax_id: this.billing_business ? this.billing_tax_id : null,
      };
    },

    no_receiver_address() {
      // When we have no shipping info!
      return !this.receiverInfo || !this.receiverInfo.address;
    },
  },

  created() {
    this.same_billing = !this.modelValue.custom;

    this.loadValue();
  },
  mounted() {
    if (this.forceShowForm) {
      this.same_billing = false;
    }
  },

  methods: {
    loadValue() {
      if (this.modelValue) {
        this.billing_name = this.modelValue.name;
        this.billing_country = this.modelValue.country;
        this.billing_state = this.modelValue.state;
        this.billing_state_code = this.modelValue.state_code;
        this.billing_address = this.modelValue.address;
        this.billing_business = this.modelValue.business;
        this.billing_tax_id = this.modelValue.tax_id;
      } else {
        Object.assign(this.$data, this.$options.data()); // Reset values.
        if (this.receiverInfo) {
          this.billing_country = this.receiverInfo.country;
          this.billing_state = this.receiverInfo.state;
          this.billing_state_code = this.receiverInfo.state_code;
          this.billing_address = this.receiverInfo.address;
          this.billing_name = this.receiverInfo.name;
        }
      }
    },

    updateValue() {
      //console.log('-->',this.value,this.billing,this.receiverInfo)
      this.$emit("update:modelValue", this.billing);
      this.$nextTick(() => {
        this.$emit("change", this.billing);
      });
    },

    getTaxRegionsOfCountry() {
      if (!this.billing_country) {
        this.tax_regions = [];
        return;
      }

      if (this.last_country_regions === this.billing_country) return;

      this.busy_regions = true;

      const country = this.billing_country;
      axios
        .get(window.XAPI.GET_TAX_REGIONS(this.shop_name, country))
        .then(({ data }) => {
          if (!data.error) {
            this.last_country_regions = country;
            this.tax_regions = data.tax_regions; // User must select a region!
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_regions = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-billing-address-form {
}
</style>

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
    <s-smart-toggle
      v-if="!forceShowForm"
      class="text-start-dir"
      v-model="same_billing"
      color="success"
      :true-title="
        no_billing_mode
          ? $t('basket_page.no_billing_title')
          : $t('basket_page.same_billing_address')
      "
      :true-description="
        no_billing_mode
          ? $t('basket_page.no_billing_desc')
          : receiverInfo?.address
          ? MapHelper.GenerateFullAddressFromMapInfo(receiverInfo)
          : $t('basket_page.same_billing_address_desc')
      "
      :false-title="$t('basket_page.custom_billing_info')"
      :false-description="$t('basket_page.custom_billing_info_desc')"
      @change="updateValue"
      :dark="dark"
    ></s-smart-toggle>

    <v-expand-transition>
      <v-container fluid v-if="!same_billing">
        <s-smart-switch
          v-model="billing_business"
          rounded
          class="my-3"
          @change="updateValue"
          :true-title="$t('global.commons.business')"
          :false-title="$t('global.commons.personal')"
          :true-description="$t('basket_page.billing_business_desc')"
          :false-description="$t('basket_page.billing_personal_desc')"
          true-icon="business"
          false-icon="person"
          :dark="dark"
        >
        </s-smart-switch>

        <v-expand-transition>
          <div v-if="billing_business">
            <v-text-field
              v-model="billing_tax_id"
              label="Tax ID"
              flat
              @change="updateValue"
            ></v-text-field>
          </div>
        </v-expand-transition>

        <v-text-field
          v-model="billing_name"
          :label="$t('global.address_info.name')"
          flat
          @change="updateValue"
        ></v-text-field>

        <country-list
          v-model="billing_country"
          item-value="alpha2"
          required
          :label="$t('global.address_info.country')"
          flat
          :errorMessages="
            !billing_country
              ? $t('basket_page.errors.select_billing_country')
              : ''
          "
          :loading="busy_regions"
          @change="updateValue()"
        ></country-list>

        <v-select
          v-if="tax_regions && tax_regions.length"
          v-model="billing_state"
          :label="$t('global.address_info.state')"
          flat
          required
          :items="tax_regions"
          :errorMessages="
            !billing_state ? $t('basket_page.errors.select_billing_state') : ''
          "
          @change="updateValue"
        >
        </v-select>

        <v-text-field
          v-model="billing_address"
          :label="$t('global.address_info.address')"
          flat
          @change="updateValue"
        ></v-text-field>
      </v-container>
    </v-expand-transition>
  </div>
</template>

<script>
import CountryList from "@/Components/ui/country/country-list/CountryList.vue";
import SSmartToggle from "@/Components/smart/SSmartToggle.vue";
import SSmartSwitch from "@/Components/smart/SSmartSwitch.vue";
import { MapHelper } from "../../../../../core/helper/map/MapHelper";
export default {
  name: "SShopBillingAddressForm",
  components: { SSmartSwitch, SSmartToggle, CountryList },
  props: {
    value: {},
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

    no_billing_mode() {
      // When we have no shipping info!
      return !this.receiverInfo || !this.receiverInfo.address;
    },
  },

  created() {
    this.loadValue();


  },
  mounted() {
    if (this.forceShowForm) {
      this.same_billing = false;
    }
  },

  methods: {
    loadValue() {
      if (this.value) {
        this.same_billing = !this.value.custom;

        this.billing_name = this.value.name;
        this.billing_country = this.value.country;
        this.billing_state = this.value.state;
        this.billing_state_code = this.value.state_code;
        this.billing_address = this.value.address;
        this.billing_business = this.value.business;
        this.billing_tax_id = this.value.tax_id;
      } else {
        Object.assign(this.$data, this.$options.data()); // Reset values.
      }
    },

    updateValue() {
      //console.log('-->',this.value,this.billing,this.receiverInfo)
      this.$emit("input", this.billing);
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
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_regions = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">

/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-billing-address-form{

}
</style>
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
  <div>
    <div class="widget-box mb-5">
      <u-widget-header
        :icon="customer ? 'person_outline' : 'person_add_alt'"
        :title="
          customer
            ? $t('customer_add.edit_title')
            : $t('customer_add.add_title')
        "
      ></u-widget-header>
      <v-list-subheader>
        {{ $t("customer_add.subtitle") }}
      </v-list-subheader>

      <v-text-field
        v-model="name"
        :label="$t('global.commons.name')"
        :rules="[GlobalRules.required()]"
        variant="underlined"
      ></v-text-field>
      <v-text-field
        v-model="email"
        :label="$t('global.commons.email')"
        variant="underlined"
      ></v-text-field>

      <v-text-field
        v-if="customer"
        v-model="phone"
        :label="$t('global.commons.phone')"
        variant="underlined"
      ></v-text-field>

      <u-tel-input
        v-else
        v-model="phone_number"
        :defaultCountry="defaultCountry"
        :placeholder="$t('phone_verify.phone_number_input')"
        class="mb-10"
        enabledCountryCode
        required
        validCharactersOnly
        variant="underlined"
        @country-changed="
          (val) => {
            country = val;
          }
        "
      ></u-tel-input>
    </div>

    <div v-if="!expanded" class="widget-buttons mb-5">
      <v-btn
        color="primary"
        size="x-large"
        variant="text"
        @click="show_detail = !show_detail"
      >
        <div>
          <div>{{ $t("customer_add.more.title") }}</div>
          <div class="small">
            {{ $t("customer_add.more.subtitle") }}
          </div>
        </div>
        <v-icon
          :class="{ 'rotate-180': show_detail }"
          class="transition-all-400"
          end
          >expand_more
        </v-icon>
      </v-btn>
    </div>

    <v-expand-transition>
      <div v-if="show_detail">
        <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Detail ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
        <div class="widget-box mb-5">
          <u-widget-header
            :title="$t('global.commons.personal_info')"
            icon="badge"
          ></u-widget-header>
          <v-list-subheader>
            {{ $t("customer_add.detail.subtitle") }}
          </v-list-subheader>

          <u-date-input
            v-model="birthday"
            :label="$t('basic_information.personal_info_dialog.birthday_input')"
            :max="new Date()"
            :placeholder="$t('global.placeholders.birthday')"
            clearable
            date-only
            type="date"
          />

          <u-smart-select
            v-model="sex"
            :items="[
              {
                icon: 'fa:fas fa-mars',
                title: 'global.commons.male',
                value: 'Male',
              },
              {
                icon: 'fa:fas fa-venus',
                title: 'global.commons.female',
                value: 'Female',
              },
            ]"
            class="my-3"
            item-icon="icon"
            item-text="title"
            item-value="value"
          ></u-smart-select>
        </div>

        <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Preferences ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
        <div class="widget-box mb-5">
          <u-widget-header
            :title="$t('global.commons.preferences')"
            icon="tune"
          ></u-widget-header>
          <v-list-subheader>
            {{ $t("customer_add.preferences.subtitle") }}
          </v-list-subheader>

          <u-currency-input
            v-model="currency"
            :active-currencies="shop.currencies"
            :label="$t('global.commons.currency')"
          ></u-currency-input>

          <b-club-select v-model="level" class="my-3"></b-club-select>

          <b-customer-segment-input
            v-model="segments"
            :label="$t('global.commons.segments')"
            :shop="shop"
          ></b-customer-segment-input>
        </div>

        <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Address ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
        <div class="widget-box mb-5">
          <u-widget-header
            :title="$t('global.commons.address')"
            icon="map"
          ></u-widget-header>
          <v-list-subheader>
            {{ $t("customer_add.address.subtitle") }}
          </v-list-subheader>

          <div>
            <v-row dense>
              <v-col class="pt-4" cols="12">
                <v-textarea
                  v-model="address.address"
                  :label="$t('global.commons.address')"
                  :placeholder="$t('global.map_view.enter_your_address')"
                  auto-grow
                  color="green"
                  persistent-placeholder
                  prepend-inner-icon="local_shipping"
                  rows="2"
                  variant="underlined"
                />
              </v-col>

              <v-col cols="6" sm="6">
                <v-text-field
                  v-model="address.no"
                  :color="SaminColorLight"
                  :label="$t('global.map_view.building_number')"
                  prepend-inner-icon="apartment"
                  variant="underlined"
                />
              </v-col>
              <v-col cols="6" sm="6">
                <v-text-field
                  v-model="address.unit"
                  :color="SaminColorLight"
                  :label="$t('global.map_view.building_unit')"
                  prepend-inner-icon="roofing"
                  variant="underlined"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="address.name"
                  :color="SaminColorLight"
                  :label="$t('global.commons.name')"
                  prepend-inner-icon="perm_identity"
                  variant="underlined"
                />
              </v-col>
              <v-col cols="12" md="6" sm="6">
                <s-country-select
                  v-model="address.country"
                  :dense="$vuetify.display.smAndDown"
                  :label="$t('global.address_info.country')"
                  item-value="alpha2"
                  required
                  variant="underlined"
                ></s-country-select>
              </v-col>
              <v-col cols="6" md="3" sm="3">
                <component
                  :is="states && states.length ? 'v-combobox' : 'v-text-field'"
                  v-model="address.state"
                  :dense="$vuetify.display.smAndDown"
                  :items="states ? states : []"
                  :label="state_label"
                  variant="underlined"
                ></component>
              </v-col>
              <v-col cols="6" md="3" sm="3">
                <v-text-field
                  v-model="address.city"
                  :label="$t('global.address_info.city')"
                  variant="underlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="address.postal"
                  :color="SaminColorLight"
                  :label="$t('global.map_view.postal_code')"
                  prepend-inner-icon="markunread_mailbox"
                  variant="underlined"
                >
                </v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="address.message"
                  :color="SaminColorLight"
                  :label="$t('global.map_view.more_detail_input')"
                  :rows="1"
                  auto-grow
                  class="mb-3"
                  messages="Add a note for the courier."
                  variant="underlined"
                />
              </v-col>
            </v-row>
          </div>
        </div>
      </div>
    </v-expand-transition>

    <s-widget-buttons auto-fixed-position class="widget-buttons">
      <v-btn
        v-if="dialogMode"
        size="x-large"
        variant="text"
        @click="$emit('close')"
      >
        <v-icon start>close</v-icon>
        {{ $t("global.actions.close") }}
      </v-btn>

      <v-btn
        v-if="!customer"
        :disabled="!name || (!email && !phone_number && !phone)"
        :loading="busy"
        color="primary"
        size="x-large"
        @click="addNewCustomer"
      >
        <v-icon start>add</v-icon>
        {{ $t("global.actions.add") }}
      </v-btn>

      <v-btn
        v-else
        :disabled="!name || (!email && !phone_number && !phone)"
        :loading="busy"
        color="primary"
        size="x-large"
        @click="editNewCustomer"
      >
        <v-icon start>save</v-icon>
        {{ $t("global.actions.save") }}
      </v-btn>
    </s-widget-buttons>
  </div>
</template>

<script lang="ts">
import UCurrencyInput from "../../../ui/currency/input/UCurrencyInput.vue";
import USmartSelect from "../../../ui/smart/select/USmartSelect.vue";
import UDateInput from "../../../ui/date/input/UDateInput.vue";
import BClubSelect from "../../club/select/BClubSelect.vue";
import MapLocationAddressWidget from "../../transportation/MapLocationAddressWidget.vue";
import SCountrySelect from "../../../ui/country/select/SCountrySelect.vue";
import BCustomerSegmentInput from "../../customer/segment/input/BCustomerSegmentInput.vue";
import SWidgetButtons from "../../../ui/widget/buttons/SWidgetButtons.vue";
import { defineAsyncComponent } from "vue";

export default {
  name: "BCustomerAdd",
  components: {
    UTelInput: defineAsyncComponent(
      () => import("@selldone/components-vue/ui/tel-input/UTelInput.vue"),
    ),
    SWidgetButtons,
    BCustomerSegmentInput,
    SCountrySelect,
    MapLocationAddressWidget,
    BClubSelect,
    UDateInput,
    USmartSelect,
    UCurrencyInput,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },

    customer: {
      // Edit mode
      require: false,
      type: Object,
    },
    expanded: {
      default: false,
      type: Boolean,
    },
    dialogMode: Boolean,
  },

  data: () => ({
    busy: false,

    name: null,
    email: null,

    phone_number: "",
    country: null,

    phone: null,
    birthday: null,
    sex: null,
    level: null,
    segments: [],

    show_detail: false,
    currency: null,

    address: {},
  }),

  computed: {
    defaultCountry() {
      return this.SetupService.DefaultCountry();
    },

    countries() {
      return this.$store.getters.getCountries;
    },

    selected_country_detail() {
      return (
        this.address &&
        this.address.country &&
        this.countries &&
        this.countries &&
        this.countries.find((v) => v.alpha2 === this.address.country)
      );
    },
    states() {
      // console.log('country',this.country)
      return (
        this.selected_country_detail &&
        this.selected_country_detail.states &&
        this.selected_country_detail.states.map((i) => i.name)
      );
    },

    state_label() {
      return this.states && this.states.length
        ? this.$t("global.address_info.state")
        : this.$t("global.address_info.county");
    },
  },

  watch: {
    country(country) {
      //  console.log("Change country!", country.iso2);
      if (country && !this.address.address) {
        // Custom address not entered, so we auto update country in the address!
        this.address.country = country.iso2;
        this.$forceUpdate();
      }
    },
  },

  created() {
    this.currency = this.GetUserSelectedCurrency().code;

    if (this.customer) {
      this.name = this.customer.name;
      this.email = this.customer.email;
      this.phone = this.customer.phone;
      this.birthday = this.customer.birthday;
      this.sex = this.customer.sex;
      this.level = this.customer.level;
      this.segments = this.customer.segments;
      this.currency = this.customer.currency;

      this.currency = this.customer.currency;

      this.address = this.customer.address;

      if (!this.address || !this.isObject(this.address))
        this.address = { country: this.defaultCountry };
    }
    this.show_detail = this.expanded;
  },

  methods: {
    addNewCustomer() {
      this.busy = true;

      axios
        .post(window.API.POST_ADD_NEW_SHOP_CUSTOMER(this.shop.id), {
          phone:
            (this.country ? this.country.dialCode : "") + this.phone_number,

          email: this.email,

          country: this.country ? this.country.iso2 : null,

          name: this.name,

          currency: this.currency,
          birthday: this.birthday,
          sex: this.sex,

          level: this.level,

          segments: this.segments,

          address: this.address,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("add", data.customer);

            this.showSuccessAlert(
              data.customer.name,
              "New customer has been added successfully.",
            );
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

    editNewCustomer() {
      this.busy = true;

      axios
        .put(
          window.API.PUT_SHOP_CUSTOMER_UPDATE(this.shop.id, this.customer.id),
          {
            phone: this.phone,

            email: this.email,

            name: this.name,

            currency: this.currency,
            birthday: this.birthday,
            sex: this.sex,

            level: this.level,

            segments: this.segments,

            address: this.address,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("update", data.customer);

            this.showSuccessAlert(
              data.customer.name,
              "Customer has been updated successfully.",
            );
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
  },
};
</script>

<style scoped></style>

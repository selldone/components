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
  <div>
    <div :class="{ '-large': !collapse }" class="widget-box mb-5">
      <s-widget-header
        :disabled="!locations"
        add-caption="Add Country"
        disabled-reason="No restriction"
        icon="mode_of_travel"
        title="Available Locations"
        @click:add="add_dialog = true"
      >
        <template v-slot:actions>
          <u-smart-menu
            v-if="locations && !IS_VENDOR_PANEL"
            :items="[
              {
                title: 'Load profile',
                subtitle: 'Select a saved locations profile.',
                icon: 'sim_card_download',
                click: () => {
                  dialog_load_profile = true;
                },
              },

              {
                title: 'Save profile',
                subtitle: 'Store locations for future use.',

                icon: 'save',
                click: () => {
                  profile_title_input = selected_profile?.title;
                  dialog_save_profile = true;
                },
              },
            ]"
            class="ms-2"
          >
          </u-smart-menu>
        </template>
      </s-widget-header>
      <v-list-subheader>
        If this product or service is available exclusively in certain areas,
        defined by country and zip or pin codes, you can specify those locations
        here. These restrictions are applied at the product level. On the
        product page, we request customers to select their location. If the
        product is available in their selected area, they will then be able to
        purchase it.
      </v-list-subheader>
      <u-smart-toggle
        v-model="has_location"
        false-gray
        true-description="Customers can only purchase this product within the specified country and zip code, due to the established location restriction."
        true-title="Has location restriction"
        @change="
          (val) => {
            locations = val ? Object.assign({}, product.locations) : null;
            setting_changed = true;
          }
        "
      >
      </u-smart-toggle>

      <v-expand-transition>
        <div v-if="locations">
          <!-- ⬬⬬⬬⬬ Location restriction error ⬬⬬⬬⬬ -->
          <b-product-flow-errors-location
            :product="product"
          ></b-product-flow-errors-location>

          <v-table class="bg-transparent mb-5" density="compact">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-start">{{ $t("global.commons.country") }}</th>

                  <th class="text-left">Zip / Pin Codes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody class="text-start">
                <tr v-for="(zips, country) in locations" :key="country">
                  <td>
                    <div class="min-width-200">
                      <b class="d-block">
                        <flag :iso="country" :squared="false" class="me-3" />
                        {{ country }}</b
                      >
                      <small>{{ getCountryName(country) }}</small>
                    </div>
                  </td>

                  <td>
                    <v-combobox
                      v-model="locations[country]"
                      bg-color="transparent"
                      chips
                      clearable
                      closable-chips
                      flat
                      hide-details
                      label="Enter zip/pin code and press enter to add..."
                      multiple
                      single-line
                      variant="solo"
                      @update:model-value="setting_changed = true"
                    >
                      <template v-slot:prepend-inner>
                        <v-icon
                          v-if="!locations[country]?.length"
                          class="blink-me-linear me-1"
                          color="red"
                          size="small"
                          >circle
                        </v-icon>
                      </template>
                    </v-combobox>
                  </td>

                  <td>
                    <v-btn
                      color="red"
                      icon
                      title="Remove"
                      variant="text"
                      @click="deleteCountry(country)"
                    >
                      <v-icon>close</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>

          <div
            v-if="!Object.values(locations).some((v) => v.length)"
            class="py-5 text-center"
          >
            <div class="text-h4 font-weight-light text-muted">
              <v-icon class="me-1" size="large">wrong_location</v-icon>
              Please include at least one country along with a list of zip/pin
              codes. Without it, this product will not be available.
            </div>

            <div class="max-widget-width my-5">
              <b-product-location-restrictions-input
                v-model="selected_profile"
                :shop="shop"
                label="Location Profile"
                placeholder="Select a saved profile..."
                variant="solo"
                @update:model-value="setProfile()"
              ></b-product-location-restrictions-input>
              <div class="pa-3 text-muted">{{ $t("global.commons.or") }}</div>
              Click on the <b>+ Add Country</b> button to start creating a new
              location set. Once you're done, you can save it by clicking on the
              top-right <b>⋮ Menu</b> and selecting <b>Save Profile</b>.
            </div>
          </div>
        </div>
      </v-expand-transition>

      <v-expand-transition>
        <div v-if="setting_changed">
          <v-list-subheader>
            The location restriction settings for the product have been changed.
            To preserve these changes, please click on the 'Save' button below.
          </v-list-subheader>
          <div class="widget-buttons">
            <v-btn
              :loading="busy_save"
              color="primary"
              size="x-large"
              @click="saveLocations"
            >
              <v-icon start>save</v-icon>
              {{ $t("global.actions.save") }}
            </v-btn>
          </div>
        </div>
      </v-expand-transition>
    </div>
    <!-- ██████████████████████ Dialog > Add country ██████████████████████ -->

    <v-bottom-sheet
      v-model="add_dialog"
      content-class="rounded-t-xl"
      max-width="840"
    >
      <v-card class="rounded-t-xl text-start">
        <v-card-title>
          <v-icon class="me-2" color="#111">add_location_alt</v-icon>
          Add Country
        </v-card-title>

        <template v-slot:image>
          <v-img
            v-if="country_input"
            :src="`/images/worldmap/high/${country_input.toUpperCase()}.svg`"
            class="position-absolute pen op-0-3"
            height="100%"
            width="100%"
          >
          </v-img>
        </template>
        <v-card-text>
          <p>
            Choose a country and click 'Add'. This will append the country to
            the table, allowing you to assign Zipcodes, Pincodes, City names, or
            Region names to it.
          </p>

          <div class="max-widget-width">
            <s-country-select
              v-model="country_input"
              :filter="shop.countries"
              class="my-5"
              clearable
              item-value="alpha2"
              placeholder="Select a country..."
            ></s-country-select>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="add_dialog = false">
              <v-icon start>close</v-icon>
              Close
            </v-btn>

            <v-btn
              :disabled="!country_input"
              color="primary"
              size="x-large"
              variant="flat"
              @click="addCountry()"
            >
              <v-icon start>add</v-icon>
              {{ $t("global.actions.add") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- ██████████████████████ Dialog > Save profile ██████████████████████ -->
    <v-bottom-sheet
      v-model="dialog_save_profile"
      content-class="rounded-t-xl"
      max-width="840"
    >
      <v-card class="rounded-t-xl text-start">
        <v-card-title>
          <v-icon class="me-2" color="#111">save</v-icon>
          Add Locations Profile
        </v-card-title>
        <v-card-text>
          Please input a name to save this set of locations. This saved location
          set can be applied to other products, allowing for quick location
          loading with just a single click. If a profile with the provided name
          already exists, it will be updated with these new values.

          <div class="max-widget-width">
            <v-text-field
              v-model="profile_title_input"
              :filter="shop.countries"
              class="my-5"
              placeholder="A category name, or store name, ..."
              title="Profile title"
              variant="underlined"
            ></v-text-field>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="dialog_save_profile = false"
            >
              <v-icon start>close</v-icon>
              Close
            </v-btn>

            <v-btn
              :loading="busy_save_profile"
              color="primary"
              size="x-large"
              variant="flat"
              @click="saveProfile()"
            >
              <v-icon start>add</v-icon>
              {{ $t("global.actions.add") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- ██████████████████████ Dialog > Load profile ██████████████████████ -->
    <v-bottom-sheet
      v-model="dialog_load_profile"
      content-class="rounded-t-xl"
      max-width="840"
    >
      <v-card class="rounded-t-xl text-start">
        <v-card-title>
          <v-icon class="me-2" color="#111">sim_card_download</v-icon>
          Load Locations Profile
        </v-card-title>
        <v-card-text>
          You can load locations by selecting a previously saved location set
          here.

          <div class="max-widget-width">
            <b-product-location-restrictions-input
              v-model="selected_profile"
              :shop="shop"
              class="my-5"
              label="Location Profile"
              placeholder="Select a profile..."
            ></b-product-location-restrictions-input>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="dialog_load_profile = false"
            >
              <v-icon start>close</v-icon>
              Close
            </v-btn>

            <v-btn
              :class="{ disabled: !selected_profile }"
              color="primary"
              size="x-large"
              variant="flat"
              @click="setProfile()"
            >
              <v-icon class="me-1">download</v-icon>
              Load {{ selected_profile?.title }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

import USmartToggle from "../../../../../ui/smart/toggle/USmartToggle.vue";
import SCountrySelect from "../../../../../ui/country/select/SCountrySelect.vue";
import USmartMenu from "../../../../../ui/smart/menu/USmartMenu.vue";
import BProductLocationRestrictionsInput from "../../../../product/location/restrictions/input/BProductLocationRestrictionsInput.vue";
import BProductFlowErrorsLocation from "../../../../product/flow/errors/location/BProductFlowErrorsLocation.vue";

export default {
  name: "BProductLocationRestrictionsList",
  components: {
    BProductFlowErrorsLocation,
    BProductLocationRestrictionsInput,
    USmartMenu,
    SCountrySelect,
    USmartToggle,
  },
  props: {
    product: {
      required: true,
      type: Object,
    },
    shop: {
      required: true,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
  },
  data: () => ({
    locations: null,

    has_location: false,

    country_input: null,
    add_dialog: false,
    busy_save: false,

    setting_changed: false,

    //----------------------------
    profile_title_input: null,
    dialog_save_profile: false,
    busy_save_profile: false,

    dialog_load_profile: false,
    selected_profile: null,
  }),
  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    isVirtual() {
      return this.product && this.product.type === ProductType.VIRTUAL.code;
    },
    isPhysical() {
      return this.product && this.product.type === ProductType.PHYSICAL.code;
    },
    isFile() {
      return this.product && this.product.type === ProductType.FILE.code;
    },

    collapse() {
      return this.isFile && !this.has_location;
    },
  },

  watch: {
    product() {
      this.init();
    },
  },

  created() {
    this.init();
  },
  methods: {
    init() {
      this.locations = this.product.locations
        ? Object.assign({}, this.product.locations)
        : null;

      this.has_location = !!this.product.locations;
    },

    addCountry() {
      if (
        !this.locations[this.country_input] ||
        !Array.isArray(this.locations[this.country_input])
      )
        this.locations[this.country_input] = [];

      this.add_dialog = false;
      this.setting_changed = true;
      this.country_input = null;
    },

    deleteCountry(country) {
      delete this.locations[country];
      this.setting_changed = true;
    },

    saveLocations() {
      this.busy_save = true;

      axios
        .put(
          window.API.PUT_SET_PRODUCT_LOCATIONS(this.shop.id, this.product.id),
          {
            locations: this.locations,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.product.locations = data.locations;
            this.setting_changed = false;
            this.showSuccessAlert(
              null,
              "The available locations for the product have been successfully updated.",
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    saveProfile() {
      this.busy_save_profile = true;

      axios
        .post(window.API.POST_ADD_PRODUCT_LOCATIONS_SAVES(this.shop.id), {
          title: this.profile_title_input,
          locations: this.locations,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.dialog_save_profile = false;
            this.showSuccessAlert(
              null,
              "The location set for the product has been saved successfully.",
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save_profile = false;
        });
    },

    setProfile() {
      if (!this.selected_profile) return;

      this.locations = Object.assign({}, this.selected_profile.locations);
      this.dialog_load_profile = false;
      this.showSuccessAlert(
        null,
        "The location set has been successfully loaded.",
      );
    },
  },
};
</script>

<style scoped></style>

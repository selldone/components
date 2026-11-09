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
  <div
    :class="{
      'text-start': modern,
      'b-product-locations--modern': modern,
    }"
  >
    <div
      :class="
        modern
          ? 'sd-modern-widget b-product-locations__widget'
          : 'widget-box -large mb-5'
      "
    >
      <!-- Same heading as the editor's other tabs (Specifications): outline icon, title, muted intro. -->
      <header v-if="modern" class="b-product-locations__header">
        <div class="b-product-locations__heading">
          <b-product-edit-info-icon name="MapPin" />
          <h2>{{ $t("b_product_inventory.locations.title") }}</h2>
          <!-- Add country sits under the list (or in the empty state); the heading keeps the profile menu. -->
          <u-smart-menu
            v-if="locations && !IS_VENDOR_PANEL"
            :items="location_menu_items"
            class="b-product-locations__menu"
          />
        </div>
        <p class="b-product-locations__intro">
          {{ $t("b_product_inventory.locations.subtitle") }}
        </p>
      </header>
      <!-- Where the draft sells: the product rule, the store default or everywhere. -->
      <div v-if="modern" class="b-product-locations__summary">
        <b-product-locations-summary
          :locations="locations"
          :countries="shop.countries"
          :limit="8"
        />
        <v-btn
          v-if="!locations && !IS_VENDOR_PANEL"
          :to="{ name: 'BPageShopSettingLocations' }"
          variant="text"
          color="primary"
          class="sd-modern-button sd-modern-button--small"
          append-icon="arrow_forward"
          >{{ $t("product_flow.location.shop_locations") }}</v-btn
        >
      </div>
      <div class="b-product-locations__details">
        <u-widget-header
          v-if="!modern"
          :disabled="!locations"
          :add-caption="$t('product_location_restrictions.add_location_action')"
          :disabled-reason="$t('product_location_restrictions.no_restriction')"
          icon="mode_of_travel"
          :title="$t('product_location_restrictions.title')"
          @click:add="add_dialog = true"
        >
          <template v-slot:actions>
            <u-smart-menu
              v-if="locations && !IS_VENDOR_PANEL"
              :items="location_menu_items"
              class="ms-2"
            >
            </u-smart-menu>
          </template>
        </u-widget-header>
        <v-list-subheader>
          {{ $t("product_location_restrictions.subtitle") }}
        </v-list-subheader>
        <u-smart-toggle
          v-model="has_location"
          false-gray
          :true-description="
            $t(
              'product_location_restrictions.has_restriction_input.description',
            )
          "
          :true-title="
            $t('product_location_restrictions.has_restriction_input.title')
          "
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

            <v-table
              v-if="!modern || has_countries"
              :class="
                modern
                  ? 'sd-modern-table sd-modern-table--dense b-product-locations__table'
                  : 'bg-transparent mb-5'
              "
              density="compact"
            >
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-start">
                      {{ $t("global.commons.country") }}
                    </th>

                    <th :class="modern ? 'text-start' : 'text-left'">
                      {{ $t("product_location_restrictions.zip_pin_code") }}
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody class="text-start">
                  <tr
                    v-for="(zips, country) in locations"
                    :key="country"
                    :data-country="country"
                  >
                    <td>
                      <!-- One line per country keeps the list dense. -->
                      <div v-if="modern" class="b-product-locations__country">
                        <flag :iso="country" :squared="false" />
                        <span>{{ getCountryName(country) }}</span>
                        <small>{{ country }}</small>
                      </div>
                      <div v-else class="min-width-200">
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
                        :density="modern ? 'compact' : undefined"
                        flat
                        hide-details
                        :label="
                          modern
                            ? $t(
                                'b_product_inventory.locations.zip_placeholder',
                              )
                            : 'Enter zip/pin code and press enter to add...'
                        "
                        multiple
                        single-line
                        variant="solo"
                        @update:model-value="setting_changed = true"
                      >
                        <template v-slot:prepend-inner>
                          <v-icon
                            v-if="!locations[country]?.length"
                            :class="modern ? 'me-1 no-inv' : 'blink-me-linear me-1'"
                            :color="modern ? 'error' : 'red'"
                            size="small"
                            >circle
                          </v-icon>
                        </template>
                      </v-combobox>
                    </td>

                    <td>
                      <v-btn
                        :color="modern ? undefined : 'red'"
                        icon
                        :title="modern ? undefined : 'Remove'"
                        :aria-label="
                          modern
                            ? $t('b_product_inventory.locations.remove_country')
                            : undefined
                        "
                        :class="modern ? 'sd-modern-icon-button' : undefined"
                        :size="modern ? 'small' : undefined"
                        variant="text"
                        @click="deleteCountry(country)"
                      >
                        <v-icon>close</v-icon>
                        <v-tooltip
                          v-if="modern"
                          activator="parent"
                          location="top"
                          content-class="sd-modern-tooltip text-start"
                          >{{
                            $t("b_product_inventory.locations.remove_country")
                          }}</v-tooltip
                        >
                      </v-btn>
                    </td>
                  </tr>
                  <!-- The list's last row adds a country in place; the cursor then moves to its ZIP codes. -->
                  <tr v-if="modern" class="b-product-locations__add-row">
                    <td colspan="3">
                      <s-country-select
                        :model-value="null"
                        :filter="addable_countries"
                        item-value="alpha2"
                        :placeholder="
                          $t('b_product_inventory.locations.add_country')
                        "
                        variant="plain"
                        dense
                        hide-details
                        @update:model-value="addCountry"
                      >
                        <template #prepend-inner>
                          <v-icon size="20" aria-hidden="true"
                            >add_location_alt</v-icon
                          >
                        </template>
                      </s-country-select>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-table>

            <div
              v-if="!Object.values(locations).some((v) => v.length)"
              class="py-5 text-center"
            >
              <div
                :class="
                  modern
                    ? 'sd-modern-notice b-product-locations__notice'
                    : 'text-h4 font-weight-light text-muted'
                "
              >
                <v-icon class="me-1" size="large">wrong_location</v-icon>

                <span :class="{ 'sd-modern-notice__content': modern }">{{
                  $t("product_location_restrictions.no_country_selected_error")
                }}</span>
              </div>

              <div class="max-widget-width my-5">
                <b-product-location-restrictions-input
                  v-model="selected_profile"
                  :shop="shop"
                  :label="
                    $t(
                      'product_location_restrictions.load_profile_dialog.select_input.title',
                    )
                  "
                  :placeholder="
                    $t(
                      'product_location_restrictions.load_profile_dialog.select_input.placeholder',
                    )
                  "
                  variant="solo"
                  @update:model-value="setProfile()"
                ></b-product-location-restrictions-input>
                <div v-if="!modern || !has_countries" class="pa-3 text-muted">
                  {{ $t("global.commons.or") }}
                </div>

                <template v-if="modern">
                  <s-country-select
                    v-if="!has_countries"
                    :model-value="null"
                    :filter="addable_countries"
                    item-value="alpha2"
                    :label="$t('b_product_inventory.locations.add_country')"
                    variant="solo"
                    hide-details
                    @update:model-value="addCountry"
                  >
                    <template #prepend-inner>
                      <v-icon aria-hidden="true">add_location_alt</v-icon>
                    </template>
                  </s-country-select>
                  <!-- What the profile picker above and the ⋮ menu do. -->
                  <div class="b-product-locations__profiles text-start">
                    <p class="sd-modern-eyebrow">
                      {{ $t("b_product_inventory.locations.profiles_title") }}
                    </p>
                    <div class="b-product-locations__profile">
                      <v-icon size="18" aria-hidden="true"
                        >sim_card_download</v-icon
                      >
                      <span
                        ><strong>{{
                          $t("product_location_restrictions.import.title")
                        }}</strong>
                        {{
                          $t("b_product_inventory.locations.profiles_load")
                        }}</span
                      >
                    </div>
                    <div
                      v-if="!IS_VENDOR_PANEL"
                      class="b-product-locations__profile"
                    >
                      <v-icon size="18" aria-hidden="true">save</v-icon>
                      <span
                        ><strong>{{
                          $t("product_location_restrictions.export.title")
                        }}</strong>
                        {{
                          $t("b_product_inventory.locations.profiles_save")
                        }}</span
                      >
                    </div>
                  </div>
                </template>
                <div
                  v-else
                  v-html="$t('product_location_restrictions.tips')"
                ></div>
              </div>
            </div>
          </div>
        </v-expand-transition>

        <v-expand-transition>
          <div v-if="setting_changed">
            <v-list-subheader>
              {{ $t("product_location_restrictions.need_save_message") }}
            </v-list-subheader>
            <div :class="modern ? 'sd-modern-form-actions' : 'widget-buttons'">
              <v-btn
                :class="
                  modern
                    ? 'sd-modern-button sd-modern-button--form sd-modern-button--primary'
                    : undefined
                "
                :loading="busy_save"
                color="primary"
                :size="modern ? undefined : 'x-large'"
                @click="saveLocations"
              >
                <v-icon start>save</v-icon>
                {{ $t("global.actions.save") }}
              </v-btn>
            </div>
          </div>
        </v-expand-transition>
      </div>
    </div>
    <!-- ██████████████████████ Dialog > Add country ██████████████████████ -->

    <v-bottom-sheet
      v-model="add_dialog"
      content-class="rounded-t-xl"
      :max-width="modern ? 720 : 840"
    >
      <v-card
        :class="
          modern
            ? 'b-product-locations-sheet text-start'
            : 'rounded-t-xl text-start'
        "
        :theme="
          modern ? (USER()?.preferences?.dark ? 'dark' : 'light') : undefined
        "
      >
        <v-card-title>
          <v-icon class="me-2" :color="modern ? undefined : '#111'"
            >add_location_alt</v-icon
          >

          {{ $t("product_location_restrictions.add_dialog.title") }}
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
            {{ $t("product_location_restrictions.add_dialog.message") }}
          </p>

          <div class="max-widget-width">
            <s-country-select
              v-model="country_input"
              :filter="shop.countries"
              class="my-5"
              clearable
              item-value="alpha2"
              :placeholder="$t('global.placeholders.select_a_country')"
            ></s-country-select>
          </div>
        </v-card-text>
        <v-card-actions>
          <div
            :class="
              modern ? 'b-product-locations-sheet__actions' : 'widget-buttons'
            "
          >
            <v-btn
              :size="modern ? undefined : 'x-large'"
              :class="
                modern ? 'sd-modern-button sd-modern-button--form' : undefined
              "
              variant="text"
              @click="add_dialog = false"
              prepend-icon="close"
            >
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              :disabled="!country_input"
              color="primary"
              :size="modern ? undefined : 'x-large'"
              :class="
                modern ? 'sd-modern-button sd-modern-button--form' : undefined
              "
              variant="elevated"
              @click="addCountry()"
              prepend-icon="add"
            >
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
      :max-width="modern ? 720 : 840"
    >
      <v-card
        :class="
          modern
            ? 'b-product-locations-sheet text-start'
            : 'rounded-t-xl text-start'
        "
        :theme="
          modern ? (USER()?.preferences?.dark ? 'dark' : 'light') : undefined
        "
      >
        <v-card-title>
          <v-icon class="me-2" :color="modern ? undefined : '#111'"
            >save</v-icon
          >

          {{ $t("product_location_restrictions.save_profile_dialog.title") }}
        </v-card-title>
        <v-card-text>
          {{ $t("product_location_restrictions.save_profile_dialog.message") }}
          <div class="max-widget-width">
            <v-text-field
              v-model="profile_title_input"
              :filter="shop.countries"
              class="my-5"
              :placeholder="
                $t(
                  'product_location_restrictions.save_profile_dialog.title_input.placeholder',
                )
              "
              :title="
                $t(
                  'product_location_restrictions.save_profile_dialog.title_input.title',
                )
              "
              variant="underlined"
            ></v-text-field>
          </div>
        </v-card-text>
        <v-card-actions>
          <div
            :class="
              modern ? 'b-product-locations-sheet__actions' : 'widget-buttons'
            "
          >
            <v-btn
              :size="modern ? undefined : 'x-large'"
              :class="
                modern ? 'sd-modern-button sd-modern-button--form' : undefined
              "
              variant="text"
              @click="dialog_save_profile = false"
              prepend-icon="close"
            >
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              :loading="busy_save_profile"
              color="primary"
              :size="modern ? undefined : 'x-large'"
              :class="
                modern ? 'sd-modern-button sd-modern-button--form' : undefined
              "
              variant="elevated"
              @click="saveProfile()"
              prepend-icon="add"
            >
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
      :max-width="modern ? 720 : 840"
    >
      <v-card
        :class="
          modern
            ? 'b-product-locations-sheet text-start'
            : 'rounded-t-xl text-start'
        "
        :theme="
          modern ? (USER()?.preferences?.dark ? 'dark' : 'light') : undefined
        "
      >
        <v-card-title>
          <v-icon class="me-2" :color="modern ? undefined : '#111'"
            >sim_card_download</v-icon
          >

          {{ $t("product_location_restrictions.load_profile_dialog.title") }}
        </v-card-title>
        <v-card-text>
          {{ $t("product_location_restrictions.load_profile_dialog.message") }}
          <div class="max-widget-width">
            <b-product-location-restrictions-input
              v-model="selected_profile"
              :shop="shop"
              class="my-5"
              :label="
                $t(
                  'product_location_restrictions.load_profile_dialog.select_input.title',
                )
              "
              :placeholder="
                $t(
                  'product_location_restrictions.load_profile_dialog.select_input.placeholder',
                )
              "
            ></b-product-location-restrictions-input>
          </div>
        </v-card-text>
        <v-card-actions>
          <div
            :class="
              modern ? 'b-product-locations-sheet__actions' : 'widget-buttons'
            "
          >
            <v-btn
              :size="modern ? undefined : 'x-large'"
              :class="
                modern ? 'sd-modern-button sd-modern-button--form' : undefined
              "
              variant="text"
              @click="dialog_load_profile = false"
              prepend-icon="close"
            >
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              :class="{
                disabled: !selected_profile,
                'sd-modern-button sd-modern-button--form': modern,
              }"
              :disabled="modern && !selected_profile"
              color="primary"
              :size="modern ? undefined : 'x-large'"
              variant="elevated"
              @click="setProfile()"
              prepend-icon="download"
            >
              {{ $t("global.actions.load") }} {{ selected_profile?.title }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts">
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

import USmartToggle from "../../../../../ui/smart/toggle/USmartToggle.vue";
import SCountrySelect from "../../../../../ui/country/select/SCountrySelect.vue";
import USmartMenu from "../../../../../ui/smart/menu/USmartMenu.vue";
import BProductLocationRestrictionsInput from "../../../../product/location/restrictions/input/BProductLocationRestrictionsInput.vue";
import BProductFlowErrorsLocation from "../../../../product/flow/errors/location/BProductFlowErrorsLocation.vue";
import BProductLocationsSummary from "../../summary/BProductLocationsSummary.vue";
import BProductEditInfoIcon from "../../../edit/info/BProductEditInfoIcon.vue";
import { getCodes } from "@selldone/core-js/models/general/country/country-helper.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductLocationRestrictionsList",
  mixins: [],
  components: {
    BProductEditInfoIcon,
    BProductLocationsSummary,
    BProductFlowErrorsLocation,
    BProductLocationRestrictionsInput,
    USmartMenu,
    SCountrySelect,
    USmartToggle,
  },
  props: {
    modern: { type: Boolean, default: false },
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
    location_menu_items() {
      return [
        {
          title: this.$t("product_location_restrictions.import.title"),
          subtitle: this.$t("product_location_restrictions.import.subtitle"),
          icon: "sim_card_download",
          click: () => {
            this.dialog_load_profile = true;
          },
        },
        {
          title: this.$t("product_location_restrictions.export.title"),
          subtitle: this.$t("product_location_restrictions.export.subtitle"),
          icon: "save",
          click: () => {
            this.profile_title_input = this.selected_profile?.title;
            this.dialog_save_profile = true;
          },
        },
      ];
    },
    has_countries() {
      return !!this.locations && Object.keys(this.locations).length > 0;
    },
    // Countries the store sells to that the rule does not list yet.
    addable_countries() {
      return (this.shop.countries || getCodes()).filter(
        (iso) => !this.locations?.[iso],
      );
    },
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

    addCountry(iso = this.country_input) {
      // Keys are ISO 3166 alpha-2 codes, as ProductLocationRule requires on save.
      if (typeof iso !== "string" || !/^[A-Z]{2}$/.test(iso)) return;
      if (!Array.isArray(this.locations[iso])) this.locations[iso] = [];

      this.add_dialog = false;
      this.setting_changed = true;
      this.country_input = null;
      // Continue with the new country's ZIP codes.
      this.$nextTick(() =>
        this.$el
          .querySelector?.(`tr[data-country="${iso}"] input`)
          ?.focus(),
      );
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
            NotificationService.showSuccessAlert(
              null,
              "The available locations for the product have been successfully updated.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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
            NotificationService.showSuccessAlert(
              null,
              "The location set for the product has been saved successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save_profile = false;
        });
    },

    setProfile() {
      if (!this.selected_profile) return;

      this.locations = Object.assign({}, this.selected_profile.locations);
      this.dialog_load_profile = false;
      this.setting_changed = true; // A loaded profile is a draft until saved.
      NotificationService.showSuccessAlert(
        null,
        "The location set has been successfully loaded.",
      );
    },
  },
};
</script>

<style scoped lang="scss">
.b-product-locations--modern {
  min-width: 0;
  display: flex;
  flex-direction: column;
  // Card and heading geometry follow the editor's Specifications tab.
  .b-product-locations__widget {
    min-width: 0;
    padding: 23px;
    border-radius: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .b-product-locations__heading {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .b-product-locations__heading > svg {
    flex: 0 0 auto;
    color: var(--sd-modern-muted);
  }
  .b-product-locations__heading h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    letter-spacing: -0.15px;
  }
  .b-product-locations__menu {
    margin-inline-start: auto;
  }
  .b-product-locations__intro {
    margin: 9px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  .b-product-locations__summary {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px 16px;
    margin-block-start: 16px;
    padding: 10px 14px;
    border-radius: 10px;
    background: var(--sd-modern-inset);
    font-size: 13px;
    line-height: 20px;
  }
  .b-product-locations__details {
    margin-block-start: 16px;
    min-width: 0;
  }
  .b-product-locations__details :deep(.v-list-subheader__text) {
    white-space: normal;
    overflow: visible;
  }
  .b-product-locations__details :deep(.v-list-subheader) {
    padding-inline: 0;
    min-height: 0;
    padding-block: 0 14px;
    white-space: normal;
    font-size: 13px;
    line-height: 20px;
  }
  .b-product-locations__table {
    margin-block: 16px;
  }
  // Dense rows (shared --dense): one-line country, compact ZIP chips.
  .b-product-locations__table :deep(.v-field__input) {
    min-height: 36px;
    padding-block: 4px;
  }
  .b-product-locations__table :deep(.v-chip) {
    height: 24px;
    padding-inline: 9px 6px;
    font-size: 12px;
  }
  .b-product-locations__country {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 150px;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    white-space: nowrap;
  }
  .b-product-locations__country small {
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
  }
  // The add row reads as an action: primary icon and placeholder, quiet hover.
  .b-product-locations__add-row :deep(.v-field__prepend-inner > .v-icon),
  .b-product-locations__add-row :deep(input::placeholder) {
    color: rgb(var(--v-theme-primary));
    opacity: 1;
  }
  .b-product-locations__add-row :deep(input) {
    font-size: 14px;
  }
  .b-product-locations__add-row:hover > td {
    background: var(--sd-modern-inset);
  }
  // Load/Save profile guide under the empty state's pickers.
  .b-product-locations__profiles {
    display: grid;
    gap: 8px;
    margin-block-start: 16px;
    padding: 12px 14px;
    border-radius: 10px;
    background: var(--sd-modern-inset);
    font-size: 13px;
    line-height: 20px;
  }
  .b-product-locations__profiles .sd-modern-eyebrow {
    margin: 0;
  }
  .b-product-locations__profile {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .b-product-locations__profile > .v-icon {
    margin-block-start: 1px;
    color: var(--sd-modern-muted);
  }
  .b-product-locations__profile strong {
    font-weight: 500;
  }
  .b-product-locations__notice {
    font-size: 13px;
    line-height: 20px;
    text-align: start;
  }
  .b-product-locations__notice > .v-icon {
    font-size: 18px;
  }
  .sd-modern-form-actions {
    display: flex;
    justify-content: flex-end;
  }
  @media (max-width: 639px) {
    .b-product-locations__widget {
      padding: 18px;
    }
    .b-product-locations__table :deep(thead) {
      display: none;
    }
    .b-product-locations__table :deep(tr) {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 44px;
      gap: 10px;
      padding: 12px;
      border-block-end: 1px solid var(--sd-modern-border);
    }
    .b-product-locations__table :deep(td) {
      padding: 0;
      border: 0;
      min-width: 0;
      height: auto;
    }
    .b-product-locations__table :deep(td:nth-child(2)) {
      grid-column: 1 / -1;
      grid-row: 2;
    }
    .b-product-locations__table :deep(td:nth-child(3)) {
      grid-column: 2;
      grid-row: 1;
    }
    .b-product-locations__add-row > td {
      grid-column: 1 / -1;
    }
  }
}
.b-product-locations-sheet {
  border-start-start-radius: 16px;
  border-start-end-radius: 16px;
  border-end-start-radius: 0;
  border-end-end-radius: 0;
  .v-card-title {
    font-size: 18px;
    font-weight: 500;
    line-height: 27px;
    white-space: normal;
    padding: 18px 22px;
  }
  .v-card-text {
    font-size: 14px;
    line-height: 22px;
    padding: 0 22px 18px;
  }
  .v-card-actions {
    padding: 12px 22px;
    border-block-start: 1px solid var(--sd-modern-border, rgba(var(--v-theme-on-surface), 0.09));
  }
  .b-product-locations-sheet__actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
  }
  @media (max-width: 599px) {
    .v-card-title {
      padding: 16px;
    }
    .v-card-text {
      padding-inline: 16px;
    }
    .v-card-actions {
      padding: 12px 16px;
    }
  }
}
</style>

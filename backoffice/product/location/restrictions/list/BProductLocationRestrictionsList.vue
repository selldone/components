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
      'b-product-locations--expanded': modern && settings_open,
    }"
  >
    <div
      :class="
        modern
          ? 'sd-modern-widget b-product-locations__widget'
          : 'widget-box -large mb-5'
      "
    >
      <header
        v-if="modern"
        class="sd-modern-header b-product-locations__header"
      >
        <div class="sd-modern-title">
          <v-icon class="sd-modern-icon" aria-hidden="true">location_on</v-icon>
          <div class="flex-grow-1 min-width-0">
            <h2>{{ $t("b_product_inventory.locations.title") }}</h2>
            <p class="sd-modern-subtitle">
              {{ $t("b_product_inventory.locations.subtitle") }}
            </p>
          </div>
        </div>
        <v-btn
          variant="text"
          color="primary"
          class="sd-modern-button sd-modern-button--small"
          :aria-expanded="settings_open"
          :aria-controls="'product-locations-' + product.id"
          @click="settings_open = !settings_open"
        >
          <v-icon start aria-hidden="true">{{
            settings_open ? "expand_less" : "edit"
          }}</v-icon>
          {{
            $t(settings_open ? "global.actions.close" : "global.actions.edit")
          }}
        </v-btn>
      </header>
      <div
        v-if="modern"
        v-show="!settings_open"
        class="b-product-locations__summary"
      >
        <span class="sd-modern-status sd-modern-status--plain"
          ><i
            class="sd-modern-status__dot"
            :class="locations ? 'sd-modern-status__dot--warning' : ''"
          ></i
          >{{
            locations
              ? $t("b_product_inventory.locations.restricted", {
                  count: Object.keys(locations).length,
                })
              : $t("b_product_inventory.locations.uses_store")
          }}</span
        >
      </div>
      <div
        v-show="!modern || settings_open"
        :id="modern ? 'product-locations-' + product.id : undefined"
        class="b-product-locations__details"
      >
        <div
          v-if="modern"
          class="sd-modern-actions b-product-locations__toolbar"
        >
          <v-btn
            variant="text"
            color="primary"
            class="sd-modern-button sd-modern-button--small"
            :disabled="!locations"
            prepend-icon="add_location_alt"
            @click="add_dialog = true"
            >{{
              $t("product_location_restrictions.add_location_action")
            }}</v-btn
          >
          <u-smart-menu
            v-if="locations && !IS_VENDOR_PANEL"
            :items="location_menu_items"
          />
        </div>
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
              :class="
                modern
                  ? 'sd-modern-table b-product-locations__table'
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
                  <tr v-for="(zips, country) in locations" :key="country">
                    <td>
                      <div
                        :class="
                          modern
                            ? 'b-product-locations__country'
                            : 'min-width-200'
                        "
                      >
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

                {{
                  $t("product_location_restrictions.no_country_selected_error")
                }}
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
                <div class="pa-3 text-muted">{{ $t("global.commons.or") }}</div>

                <div v-html="$t('product_location_restrictions.tips')"></div>
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

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductLocationRestrictionsList",
  mixins: [],
  components: {
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
    settings_open: false,
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
  .b-product-locations__widget {
    min-width: 0;
    padding: 18px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .b-product-locations__header {
    align-items: flex-start;
    gap: 12px;
    margin: 0;
  }
  .b-product-locations__header h2 {
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
    margin: 0;
  }
  .b-product-locations__header .sd-modern-subtitle {
    font-size: 13px;
    line-height: 20px;
    margin: 4px 0 0;
  }
  .b-product-locations__header > .v-btn {
    flex-shrink: 0;
  }
  .b-product-locations__summary {
    padding-block-start: 14px;
    margin-block-start: auto;
    font-size: 12px;
    line-height: 20px;
    color: var(--sd-modern-muted);
  }
  .b-product-locations__details {
    margin-block-start: 16px;
    min-width: 0;
  }
  .b-product-locations__toolbar {
    justify-content: flex-end;
    margin-block-end: 10px;
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
  .b-product-locations__country {
    min-width: 120px;
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
    .b-product-locations__header {
      flex-wrap: wrap;
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
